"""
FastAPI wrapper around the DuoConvo semantic retrieval pipeline (fine-tuned
Sentence Transformer + FAISS + confidence engine).

Matches the POST /predict contract api/src/services/ai.service.ts already
expects for AI_PROVIDER=http:

    POST /predict
    body: {"text": string, "language": string}
    response: {
      "topMatches": [{"conceptCode": string, "intent": string, "score": number}],
      "confidence": number,
      "decision": "HIGH_CONFIDENCE" | "MEDIUM_CONFIDENCE" | "LOW_CONFIDENCE"
    }

Reuses ai-engine/inference/confidence.py's calculate_confidence() directly -
same formula and thresholds the project has been evaluating against, not a
reimplementation.

Run from this directory (ai-engine/app), not the project root - "ai-engine"
has a hyphen, which breaks Python's dotted module-import syntax:

    cd ai-engine/app
    <path-to-venv>/python.exe -m uvicorn ai_server:app --host 0.0.0.0 --port 8001
"""

import logging
import sys
from pathlib import Path

AI_ENGINE_DIR = Path(__file__).resolve().parents[1]
INFERENCE_DIR = AI_ENGINE_DIR / "inference"
for path in (AI_ENGINE_DIR, INFERENCE_DIR):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

import faiss
import pandas as pd
from confidence import calculate_confidence
from config import INDEX_PATH, METADATA_PATH, MODEL_OUTPUT_DIR, TOP_K
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_server")

logger.info("Loading fine-tuned model, FAISS index and metadata...")
model = SentenceTransformer(str(MODEL_OUTPUT_DIR))
index = faiss.read_index(str(INDEX_PATH))
metadata = pd.read_csv(METADATA_PATH)
logger.info("Loaded - %d concepts in the index.", index.ntotal)

app = FastAPI(title="DuoConvo AI Retrieval (Sentence Transformer + FAISS)")


class PredictRequest(BaseModel):
    text: str
    language: str = ""


@app.post("/predict")
async def predict(request: PredictRequest):
    embedding = model.encode([request.text], convert_to_numpy=True).astype("float32")
    faiss.normalize_L2(embedding)

    k = min(TOP_K, index.ntotal)
    scores, indices = index.search(embedding, k=k)

    top_matches = []
    intents = []
    for score, idx in zip(scores[0], indices[0]):
        row = metadata.iloc[idx]
        intents.append(row["intent"])
        top_matches.append({
            "conceptCode": row["concept_code"],
            "intent": row["intent"],
            "score": float(score),
        })

    confidence_result = calculate_confidence(scores[0], intents)

    return {
        "topMatches": top_matches,
        "confidence": float(confidence_result.confidence),
        "decision": confidence_result.decision,
    }


@app.get("/health")
async def health():
    return {"status": "ok", "concepts": index.ntotal}
