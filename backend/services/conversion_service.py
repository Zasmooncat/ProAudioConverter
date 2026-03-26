import subprocess
import os
import uuid
import logging
from flask import current_app

logger = logging.getLogger(__name__)


class ConversionError(Exception):
    pass


# Format → file extension mapping
FORMAT_EXTENSIONS = {
    "mp3": "mp3",
    "wav": "wav",
    "flac": "flac",
    "aac": "aac",
    "ogg": "ogg",
}

# MIME types we accept on upload
ALLOWED_MIME_TYPES = {
    "audio/wav", "audio/x-wav",
    "audio/mpeg", "audio/mp3",
    "audio/flac", "audio/x-flac",
    "audio/aac", "audio/x-aac",
    "audio/ogg", "audio/vorbis",
    "audio/mp4", "audio/x-m4a",
    "audio/aiff", "audio/x-aiff",
    "audio/alac",
    # browsers sometimes send these
    "application/octet-stream",
    "video/mp4",
}


def build_ffmpeg_command(input_path: str, output_path: str, output_format: str, quality: dict) -> list:
    """
    Build a safe FFmpeg command list.

    quality dict examples:
      MP3:  {"bitrate": "320k"}
      WAV:  {"bit_depth": "24"}
      FLAC: {}
      AAC:  {"bitrate": "256k"}
      OGG:  {"bitrate": "192k"}
    """
    cmd = ["ffmpeg", "-y", "-i", input_path]

    if output_format == "mp3":
        bitrate = quality.get("bitrate", "192k")
        allowed_bitrates = {"128k", "192k", "256k", "320k"}
        if bitrate not in allowed_bitrates:
            bitrate = "192k"
        cmd += ["-codec:a", "libmp3lame", "-b:a", bitrate]

    elif output_format == "wav":
        bit_depth = quality.get("bit_depth", "16")
        pcm_codec = "pcm_s24le" if bit_depth == "24" else "pcm_s16le"
        cmd += ["-codec:a", pcm_codec]

    elif output_format == "flac":
        cmd += ["-codec:a", "flac"]

    elif output_format == "aac":
        bitrate = quality.get("bitrate", "192k")
        allowed_bitrates = {"128k", "192k", "256k", "320k"}
        if bitrate not in allowed_bitrates:
            bitrate = "192k"
        cmd += ["-codec:a", "aac", "-b:a", bitrate]

    elif output_format == "ogg":
        bitrate = quality.get("bitrate", "192k")
        allowed_bitrates = {"128k", "192k", "256k", "320k"}
        if bitrate not in allowed_bitrates:
            bitrate = "192k"
        cmd += ["-codec:a", "libvorbis", "-b:a", bitrate]

    cmd.append(output_path)
    return cmd


def convert_audio(input_path: str, output_format: str, quality: dict) -> str:
    """
    Run FFmpeg to convert an audio file.

    Returns the absolute path to the converted file.
    Raises ConversionError on failure.
    """
    converted_folder = current_app.config["CONVERTED_FOLDER"]
    os.makedirs(converted_folder, exist_ok=True)

    ext = FORMAT_EXTENSIONS.get(output_format)
    if not ext:
        raise ConversionError(f"Unsupported output format: {output_format}")

    output_filename = f"{uuid.uuid4().hex}.{ext}"
    output_path = os.path.join(converted_folder, output_filename)

    cmd = build_ffmpeg_command(input_path, output_path, output_format, quality)
    logger.info("Running FFmpeg: %s", " ".join(cmd))

    try:
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=300,  # 5-minute hard limit
        )
    except subprocess.TimeoutExpired:
        raise ConversionError("FFmpeg conversion timed out.")
    except FileNotFoundError:
        raise ConversionError("FFmpeg is not installed or not in PATH.")

    if result.returncode != 0:
        stderr_text = result.stderr.decode("utf-8", errors="replace")
        logger.error("FFmpeg error:\n%s", stderr_text)
        raise ConversionError(f"FFmpeg failed: {stderr_text[-500:]}")

    if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
        raise ConversionError("Converted file is empty or was not created.")

    logger.info("Conversion successful: %s", output_path)
    return output_filename  # return just the filename; caller constructs URL
