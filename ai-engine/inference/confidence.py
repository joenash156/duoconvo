"""
confidence.py

Evaluate FAISS search results and determine
how confident DuoConvo is in a semantic match.
"""

from dataclasses import dataclass

import numpy as np


@dataclass
class ConfidenceResult:
  top_score: float
  second_score: float
  score_gap: float
  intent_agreement: float
  confidence: float
  decision: str


def calculate_confidence(scores: np.ndarray, intents: list[str]) -> ConfidenceResult:
  top_score = float(scores[0])
  second_score = float(scores[1])

  score_gap = top_score - second_score
  top_intent = intents[0]

  same_intent_count = sum(intent == top_intent for intent in intents)
  intent_agreement = (same_intent_count / len(intents))

  confidence = ((top_score * 0.60) + (score_gap * 0.20) + (intent_agreement * 0.20))

  if confidence >= 0.60:
    decision = "HIGH_CONFIDENCE"

  elif confidence >= 0.35:
    decision = "MEDIUM_CONFIDENCE"

  else:
    decision = "LOW_CONFIDENCE"

  return ConfidenceResult(
    top_score=top_score,
    second_score=second_score,
    score_gap=score_gap,
    intent_agreement=intent_agreement,
    confidence=confidence,
    decision=decision,
  )