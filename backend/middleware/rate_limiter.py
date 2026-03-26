from datetime import datetime, timezone, timedelta
from flask import request, g
from models import db, Conversion


def check_rate_limit(user=None):
    """
    Returns True if the current requester has exceeded the free plan hourly limit.
    Checks by user_id (if authenticated) OR by IP address.
    Premium users are never rate-limited.
    """
    if user and user.plan_type == "premium":
        return False

    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    ip = get_client_ip()

    if user:
        count = Conversion.query.filter(
            Conversion.user_id == user.id,
            Conversion.created_at >= one_hour_ago,
            Conversion.status == "completed",
        ).count()
    else:
        count = Conversion.query.filter(
            Conversion.ip_address == ip,
            Conversion.user_id == None,  # noqa: E711
            Conversion.created_at >= one_hour_ago,
            Conversion.status == "completed",
        ).count()

    from flask import current_app
    limit = current_app.config.get("FREE_CONVERSIONS_PER_HOUR", 3)
    return count >= limit


def get_client_ip():
    """Extract real client IP, respecting X-Forwarded-For."""
    if request.headers.get("X-Forwarded-For"):
        return request.headers["X-Forwarded-For"].split(",")[0].strip()
    return request.remote_addr or "unknown"
