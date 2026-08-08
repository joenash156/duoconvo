"""
search.py

Search the FAISS index
using the fine-tuned model.
"""

import sys
from pathlib import Path

# Allow this script to be run directly from the project root.
AI_ENGINE_DIR = Path(__file__).resolve().parents[1]
if str(AI_ENGINE_DIR) not in sys.path:
  sys.path.insert(0, str(AI_ENGINE_DIR))

import faiss
import pandas as pd
from confidence import calculate_confidence
from config import (
  INDEX_PATH,
  METADATA_PATH,
  MODEL_OUTPUT_DIR,
)
from sentence_transformers import SentenceTransformer


def load_everything():
  model = SentenceTransformer(str(MODEL_OUTPUT_DIR))
  index = faiss.read_index(str(INDEX_PATH))
  metadata = pd.read_csv(METADATA_PATH)

  return model, index, metadata


def search(query):
  model, index, metadata = load_everything()
  
  embedding = model.encode(
    [query],
    convert_to_numpy=True
  ).astype("float32")

  faiss.normalize_L2(embedding)
  scores, indices = index.search(embedding, k=3)

  intents = []

  for idx in indices[0]:
    row = metadata.iloc[idx]
    intents.append(row["intent"])

  confidence_result = calculate_confidence(scores[0], intents)

  print("\nTop Matches\n")

  for score, idx in zip(scores[0], indices[0]):
    row = metadata.iloc[idx]

    print("-" * 50)
    print(f"Score       : {score:.4f}")
    print(f"Concept     : {row['concept_code']}")
    print(f"Intent      : {row['intent']}")
    print(f"English     : {row['english']}")

  print("\nConfidence Analysis")
  print("-" * 50)
  print(
    f"Top score       : "
    f"{confidence_result.top_score:.4f}"
  )
  print(
    f"Second score    : "
    f"{confidence_result.second_score:.4f}"
  )
  print(
    f"Score gap       : "
    f"{confidence_result.score_gap:.4f}"
  )
  print(
    f"Intent agreement: "
    f"{confidence_result.intent_agreement:.2f}"
  )
  print(
    f"Confidence      : "
      f"{confidence_result.confidence:.4f}"
  )
  print(
    f"Decision        : "
    f"{confidence_result.decision}"
  )


def main():
  while True:
    query = input("\nYou: ")
    if query.lower() == "exit":
      break

    search(query)


if __name__ == "__main__":
  main()
