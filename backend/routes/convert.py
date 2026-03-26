import os
import uuid
import logging
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from werkzeug.utils import secure_filename

from models import db, User, Conversion
from services.conversion_service import convert_audio, ConversionError, ALLOWED_MIME_TYPES
from middleware.rate_limiter import check_rate_limit, get_client_ip

convert_bp = Blueprint("convert", __name__)
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {"wav", "mp3", "flac", "aac", "ogg", "m4a", "aiff", "alac"}


def get_optional_user():
    """Try to get the current user from JWT; return None if not authenticated."""
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            return db.session.get(User, int(user_id))
    except Exception:
        pass
    return None


def allowed_file(filename: str) -> bool:
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def sanitize_filename(filename: str) -> str:
    """Return a safe original filename for logging (no path components)."""
    return secure_filename(os.path.basename(filename))


@convert_bp.route("/convert", methods=["POST"])
def convert():
    user = get_optional_user()
    ip = get_client_ip()

    # ── 1. File presence check ──────────────────────────────────────────────
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    original_name = sanitize_filename(file.filename)

    # ── 2. Extension validation ─────────────────────────────────────────────
    if not allowed_file(original_name):
        return jsonify({"error": f"Unsupported file format. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"}), 400

    # ── 3. Size limit ───────────────────────────────────────────────────────
    is_premium = user and user.plan_type == "premium"
    max_size = current_app.config["PREMIUM_MAX_SIZE"] if is_premium else current_app.config["FREE_MAX_SIZE"]

    file.seek(0, 2)
    file_size = file.tell()
    file.seek(0)

    if file_size > max_size:
        limit_mb = max_size // (1024 * 1024)
        return jsonify({"error": f"File too large. Maximum size for your plan: {limit_mb} MB"}), 413

    # ── 4. Output format + quality ──────────────────────────────────────────
    output_format = (request.form.get("output_format") or "").lower().strip()
    if output_format not in current_app.config["ALLOWED_OUTPUT_FORMATS"]:
        return jsonify({"error": f"Unsupported output format: {output_format}"}), 400

    quality = {}
    if output_format == "mp3":
        quality["bitrate"] = request.form.get("bitrate", "192k")
    elif output_format == "wav":
        quality["bit_depth"] = request.form.get("bit_depth", "16")
    elif output_format in ("aac", "ogg"):
        quality["bitrate"] = request.form.get("bitrate", "192k")

    # ── 5. Rate limiting ────────────────────────────────────────────────────
    if check_rate_limit(user):
        return jsonify({
            "error": "You've reached the free limit of 3 conversions per hour. Upgrade to Premium for unlimited conversions.",
            "limit_exceeded": True,
        }), 429

    # ── 6. Save uploaded file ───────────────────────────────────────────────
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)

    ext = original_name.rsplit(".", 1)[1].lower()
    safe_input_name = f"{uuid.uuid4().hex}.{ext}"
    input_path = os.path.join(upload_folder, safe_input_name)
    file.save(input_path)

    # ── 7. Convert ──────────────────────────────────────────────────────────
    try:
        output_filename = convert_audio(input_path, output_format, quality)
    except ConversionError as e:
        logger.error("Conversion failed for %s: %s", original_name, str(e))
        # Clean up upload
        try:
            os.remove(input_path)
        except OSError:
            pass
        # Record failed conversion
        _record_conversion(user, ip, original_name, output_format, "failed")
        return jsonify({"error": f"Conversion failed: {str(e)}"}), 500
    finally:
        # Always try to remove the upload
        try:
            os.remove(input_path)
        except OSError:
            pass

    # ── 8. Record conversion ────────────────────────────────────────────────
    _record_conversion(user, ip, original_name, output_format, "completed")

    return jsonify({
        "message": "Conversion successful",
        "download_url": f"/api/download/{output_filename}",
        "filename": output_filename,
    }), 200


@convert_bp.route("/download/<filename>", methods=["GET"])
def download(filename):
    # Prevent path traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        return jsonify({"error": "Invalid filename"}), 400

    converted_folder = current_app.config["CONVERTED_FOLDER"]
    filepath = os.path.join(converted_folder, filename)

    if not os.path.isfile(filepath):
        return jsonify({"error": "File not found or has expired"}), 404

    download_name = request.args.get("name")
    
    return send_from_directory(
        converted_folder,
        filename,
        as_attachment=True,
        download_name=download_name if download_name else filename
    )


def _record_conversion(user, ip, original_filename, output_format, status):
    try:
        record = Conversion(
            user_id=user.id if user else None,
            ip_address=ip,
            original_filename=original_filename,
            output_format=output_format,
            status=status,
        )
        db.session.add(record)
        db.session.commit()
    except Exception as e:
        logger.error("Failed to record conversion: %s", e)
        db.session.rollback()
