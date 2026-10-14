"""The interviewer's voice: Piper text-to-speech, run locally on the CPU.

Piper is the only engine this module touches, so another one (e.g. Kokoro on a
GPU server) can replace it here without changes elsewhere.
"""

import io
import logging
import re
import threading
import wave
from functools import lru_cache
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)

_voice = None
_lock = threading.Lock()


class TTSUnavailable(Exception):
    """The voice model is missing or could not be loaded."""


def _load_voice():
    """Load the voice once per process. Call with _lock held."""
    global _voice
    if _voice is None:
        path = Path(settings.TTS_VOICES_DIR) / f"{settings.TTS_VOICE}.onnx"
        if not path.exists():
            raise TTSUnavailable(
                f"Voice model {path} not found. Download it with: python -m "
                f"piper.download_voices {settings.TTS_VOICE} "
                f"--download-dir {settings.TTS_VOICES_DIR}"
            )
        from piper import PiperVoice

        _voice = PiperVoice.load(path)
    return _voice


def _speakable(text: str) -> str:
    """Drop markdown emphasis and code marks, which would otherwise be read out."""
    return re.sub(r"\s+", " ", re.sub(r"[`*]", "", text)).strip()


@lru_cache(maxsize=32)
def synthesize_speech(text: str) -> bytes:
    """The text spoken by the interviewer, as a WAV file."""
    with _lock:
        voice = _load_voice()
        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wav_file:
            voice.synthesize_wav(_speakable(text), wav_file)
    return buffer.getvalue()


def warm_up() -> None:
    """Load the voice ahead of the first question, which would otherwise wait."""
    try:
        with _lock:
            _load_voice()
        logger.info(f"Interviewer voice {settings.TTS_VOICE} loaded")
    except TTSUnavailable as e:
        logger.warning(str(e))
    except Exception as e:
        logger.error(f"Could not load interviewer voice: {e}")
