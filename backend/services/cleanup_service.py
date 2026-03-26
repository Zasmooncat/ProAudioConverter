import os
import time
import logging
from flask import current_app

logger = logging.getLogger(__name__)


def cleanup_old_files(app):
    """
    Delete files older than FILE_TTL seconds from uploads/ and converted/ dirs.
    Called by APScheduler; needs app context.
    """
    with app.app_context():
        ttl = app.config.get("FILE_TTL", 3600)
        now = time.time()
        dirs = [
            app.config.get("UPLOAD_FOLDER"),
            app.config.get("CONVERTED_FOLDER"),
        ]
        for folder in dirs:
            if not folder or not os.path.isdir(folder):
                continue
            for filename in os.listdir(folder):
                filepath = os.path.join(folder, filename)
                try:
                    if os.path.isfile(filepath):
                        age = now - os.path.getmtime(filepath)
                        if age > ttl:
                            os.remove(filepath)
                            logger.info("Deleted old file: %s (age %.0fs)", filepath, age)
                except OSError as e:
                    logger.warning("Could not remove %s: %s", filepath, e)
