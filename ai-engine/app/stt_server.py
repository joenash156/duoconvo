"""
Local speech-to-text service for Twi, Ga and Ewe.

Wraps KhayaAI's Southern Ghana multilingual ASR model
(w2v-bert-ada_ewe_fat_fra_gaa_nzi_twi_en) in a small HTTP API matching the
contract api/src/services/stt.service.ts's transcribeFromHttpEngine()
already expects.

English/French speech-to-text is handled separately by Groq's Whisper API
(see api/src/services/stt.service.ts) - Whisper doesn't support these three
languages at all, which is why this service exists.

The inference logic (add_language_prefix, the language -> id map, the
forward pass) is copied verbatim from the actual working implementation at
https://huggingface.co/spaces/Ghana-NLP/Southern-Ghana-ASR (app.py), not
reconstructed from the model card - the two differ in nontrivial ways
(tensor shapes, prefix_len, missing AutoFeatureExtractor) and only the
Space's own source is confirmed to actually work.

Run from this directory (ai-engine/app), not the project root - "ai-engine"
has a hyphen, which breaks Python's dotted module-import syntax:

    cd ai-engine/app
    <path-to-venv>/python.exe -m uvicorn stt_server:app --host 0.0.0.0 --port 8002

First run downloads the model (~0.6B params) from Hugging Face and will take
a while; keep the process running afterward so the model stays loaded in
memory instead of reloading per request.
"""

import io
import logging

import av
import numpy as np
import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from transformers import AutoFeatureExtractor, AutoModelForCTC, AutoProcessor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("stt_server")

MODEL_ID = "KhayaAI/w2v-bert-ada_ewe_fat_fra_gaa_nzi_twi_en"

# DuoConvo's internal language codes -> this model's language labels.
# Only languages with no Groq/on-device support are routed here.
LANGUAGE_LABELS = {
    "tw": "Asante Twi",
    "ga": "Ga",
    "ee": "Ewe",
}

# Full language -> prefix-id map, copied verbatim from the model's Space
# source (shared across all DONDO multilingual checkpoints - most entries
# are irrelevant to this specific model, but the ids must match what it was
# trained with).
LANGUAGE_MAP = {
    "Adangme": 0, "Akuapem Twi": 1, "Asante Twi": 2, "Dagbani": 3, "Dagaare": 4,
    "Ewe": 5, "African English": 6, "Fante": 7, "French": 8, "Ga": 9, "Gonja": 10,
    "Gurene": 11, "Hausa": 12, "Igbo": 13, "Kasem": 14, "Kikuyu": 15,
    "Konkomba (Likpakpaanl)": 16, "Konkomba (Likoonli)": 17, "Krio": 18,
    "Kusaal": 19, "Luo": 20, "Mampruli": 21, "Mende": 22, "Meru/Kimeru": 23,
    "Nzema": 24, "Pidgin": 25, "Shona": 26, "Swahili": 27, "Temne": 28,
    "Wali": 29, "Wolof": 30, "Yoruba": 31,
}

logger.info("Loading %s (first run downloads the model - this can take a while)...", MODEL_ID)
processor = AutoProcessor.from_pretrained(MODEL_ID)
feature_extractor = AutoFeatureExtractor.from_pretrained(MODEL_ID)
model = AutoModelForCTC.from_pretrained(MODEL_ID)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(DEVICE)
model.eval()
logger.info("Model loaded on %s. Sampling rate: %s", DEVICE, feature_extractor.sampling_rate)

app = FastAPI(title="DuoConvo Local STT (Twi/Ga/Ewe)")


def add_language_prefix(input_features: torch.Tensor, lang_id: int, prefix_len: int = 4) -> torch.Tensor:
    """Verbatim from the verified Ghana-NLP/Southern-Ghana-ASR Space app.py."""
    mel_dim = input_features.size(-1)
    lang_vec = torch.zeros(mel_dim)
    lang_vec[lang_id % mel_dim] = 1.0
    prefix = lang_vec.unsqueeze(0).unsqueeze(0).repeat(1, prefix_len, 1)
    return torch.cat([prefix, input_features], dim=1)


def decode_audio_to_array(audio_bytes: bytes, target_rate: int) -> np.ndarray:
    """Decodes m4a/wav/mp3/etc into a mono float32 array at `target_rate`.

    Uses PyAV (bundles its own FFmpeg libraries) instead of torchaudio or a
    system ffmpeg binary - neither was available/reliable in this
    environment (Python 3.14, no ffmpeg on PATH).
    """
    container = av.open(io.BytesIO(audio_bytes), mode="r")
    stream = container.streams.audio[0]
    resampler = av.AudioResampler(format="s16", layout="mono", rate=target_rate)

    chunks = []
    for packet in container.demux(stream):
        for frame in packet.decode():
            for resampled in resampler.resample(frame):
                chunks.append(resampled.to_ndarray())
    for resampled in resampler.resample(None):
        chunks.append(resampled.to_ndarray())

    if not chunks:
        raise ValueError("No audio frames decoded")

    return np.concatenate(chunks, axis=1).flatten().astype(np.float32) / 32768.0


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...), language: str = Form(...)):
    label = LANGUAGE_LABELS.get(language)
    if label is None:
        raise HTTPException(400, f"Unsupported language for local STT: {language}")

    audio_bytes = await audio.read()

    try:
        samples = decode_audio_to_array(audio_bytes, feature_extractor.sampling_rate)
    except Exception as error:
        logger.exception("Failed to decode uploaded audio")
        raise HTTPException(400, f"Could not decode audio: {error}") from error

    input_features = processor(
        samples,
        sampling_rate=feature_extractor.sampling_rate,
        return_tensors="pt",
        padding="longest",
    ).input_features

    input_features = add_language_prefix(input_features, LANGUAGE_MAP[label]).to(DEVICE)

    with torch.no_grad():
        logits = model(input_features).logits

    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.batch_decode(predicted_ids)[0]

    return {"text": transcription}


@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL_ID, "device": str(DEVICE)}
