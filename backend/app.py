import os
import logging
from datetime import timedelta
from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler

from config import Config
from models import db
from routes.auth import auth_bp
from routes.convert import convert_bp
from routes.stripe_routes import stripe_bp
from services.cleanup_service import cleanup_old_files

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure storage directories exist
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(app.config["CONVERTED_FOLDER"], exist_ok=True)

    # Extensions
    db.init_app(app)
    jwt = JWTManager(app)

    # Configure JWT token expiry
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(
        seconds=app.config.get("JWT_ACCESS_TOKEN_EXPIRES", 604800)
    )

    CORS(app, resources={r"/api/*": {"origins": os.environ.get("CORS_ORIGINS", "*")}})

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(convert_bp, url_prefix="/api")
    app.register_blueprint(stripe_bp, url_prefix="/api/stripe")

    # Health check
    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"}), 200

    # JWT error handlers
    @jwt.unauthorized_loader
    def missing_token(reason):
        return jsonify({"error": "Missing authorization token"}), 401

    @jwt.invalid_token_loader
    def invalid_token(reason):
        return jsonify({"error": "Invalid token"}), 422

    @jwt.expired_token_loader
    def expired_token(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired"}), 401

    # Generic error handlers
    @app.errorhandler(413)
    def too_large(e):
        return jsonify({"error": "File is too large for this server configuration"}), 413

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        logger.error("Internal server error: %s", e)
        return jsonify({"error": "Internal server error"}), 500

    # Create DB tables
    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables created / verified.")
        except Exception as e:
            logger.warning("DB init warning (may be ok if DB not ready): %s", e)

    # Background cleanup scheduler
    scheduler = BackgroundScheduler(daemon=True)
    scheduler.add_job(
        func=cleanup_old_files,
        args=[app],
        trigger="interval",
        minutes=15,
        id="cleanup_job",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("File cleanup scheduler started (every 15 min).")

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=app.config.get("DEBUG", False))
