import stripe
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Subscription

stripe_bp = Blueprint("stripe", __name__)


def get_stripe():
    stripe.api_key = current_app.config["STRIPE_SECRET_KEY"]
    return stripe


@stripe_bp.route("/create-checkout", methods=["POST"])
@jwt_required()
def create_checkout():
    s = get_stripe()
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    price_id = current_app.config["STRIPE_PRICE_ID"]
    frontend_url = current_app.config["FRONTEND_URL"]

    try:
        session = s.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=f"{frontend_url}/?checkout=success",
            cancel_url=f"{frontend_url}/?checkout=cancelled",
            metadata={"user_id": str(user.id)},
            customer_email=user.email,
        )
        return jsonify({"checkout_url": session.url}), 200
    except stripe.error.StripeError as e:
        return jsonify({"error": str(e.user_message or e)}), 500


@stripe_bp.route("/webhook", methods=["POST"])
def webhook():
    s = get_stripe()
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get("Stripe-Signature")
    webhook_secret = current_app.config["STRIPE_WEBHOOK_SECRET"]

    try:
        event = s.Webhook.construct_event(payload, sig_header, webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        return jsonify({"error": "Invalid signature"}), 400

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type in ("customer.subscription.created", "customer.subscription.updated"):
        _handle_subscription_active(data)
    elif event_type == "customer.subscription.deleted":
        _handle_subscription_cancelled(data)
    elif event_type == "checkout.session.completed":
        _handle_checkout_completed(data)

    return jsonify({"received": True}), 200


@stripe_bp.route("/cancel", methods=["POST"])
@jwt_required()
def cancel_subscription():
    s = get_stripe()
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    sub = Subscription.query.filter_by(user_id=user.id).first()
    if not sub:
        return jsonify({"error": "No active subscription"}), 404

    try:
        s.Subscription.cancel(sub.stripe_subscription_id)
        sub.status = "cancelled"
        user.plan_type = "free"
        db.session.commit()
        return jsonify({"message": "Subscription cancelled"}), 200
    except stripe.error.StripeError as e:
        return jsonify({"error": str(e.user_message or e)}), 500


# ── Internal helpers ─────────────────────────────────────────────────────────

def _handle_checkout_completed(session_data):
    """Link Stripe customer to our user after checkout."""
    user_id_meta = (session_data.get("metadata") or {}).get("user_id")
    if not user_id_meta:
        return
    
    user = db.session.get(User, int(user_id_meta))
    if not user:
        return
        
    customer_id = session_data.get("customer")
    subscription_id = session_data.get("subscription")
    
    if not subscription_id or not customer_id:
        return

    sub = Subscription.query.filter_by(user_id=user.id).first()
    if not sub:
        # Create the new subscription mapping
        sub = Subscription(
            user_id=user.id,
            stripe_subscription_id=subscription_id,
            stripe_customer_id=customer_id,
            status="active"
        )
        db.session.add(sub)
    else:
        # Update existing record just in case
        sub.stripe_customer_id = customer_id
        sub.stripe_subscription_id = subscription_id
        sub.status = "active"

    user.plan_type = "premium"
    db.session.commit()


def _handle_subscription_active(sub_data):
    stripe_sub_id = sub_data["id"]
    customer_id = sub_data.get("customer")
    status = sub_data.get("status", "active")

    # Try to find user by existing subscription record
    sub = Subscription.query.filter_by(stripe_subscription_id=stripe_sub_id).first()
    if sub:
        sub.status = status
        if sub.user:
            sub.user.plan_type = "premium" if status == "active" else "free"
        db.session.commit()
        return

    # Try by customer_id if checkout completed first but didn't link the sub correctly
    if customer_id:
        sub = Subscription.query.filter_by(stripe_customer_id=customer_id).first()
        if sub:
            sub.stripe_subscription_id = stripe_sub_id
            sub.status = status
            if sub.user:
                sub.user.plan_type = "premium" if status == "active" else "free"
            db.session.commit()


def _handle_subscription_cancelled(sub_data):
    stripe_sub_id = sub_data["id"]
    sub = Subscription.query.filter_by(stripe_subscription_id=stripe_sub_id).first()
    if sub:
        sub.status = "cancelled"
        if sub.user:
            sub.user.plan_type = "free"
        db.session.commit()
