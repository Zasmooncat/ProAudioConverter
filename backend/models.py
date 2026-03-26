from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    plan_type = db.Column(db.String(20), nullable=False, default="free")  # "free" | "premium"
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    conversions = db.relationship("Conversion", backref="user", lazy=True)
    subscription = db.relationship("Subscription", backref="user", uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "plan_type": self.plan_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Conversion(db.Model):
    __tablename__ = "conversions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    ip_address = db.Column(db.String(45), nullable=False, index=True)
    original_filename = db.Column(db.String(255), nullable=False)
    output_format = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="completed")  # completed | failed
    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "original_filename": self.original_filename,
            "output_format": self.output_format,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Subscription(db.Model):
    __tablename__ = "subscriptions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)
    stripe_subscription_id = db.Column(db.String(255), nullable=False)
    stripe_customer_id = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), nullable=False, default="active")
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "stripe_subscription_id": self.stripe_subscription_id,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
