"""
evaluate_retrieval.py

Evaluate DuoConvo semantic retrieval.
"""

import sys
from pathlib import Path

# Allow this script to be run directly from the project root.
AI_ENGINE_DIR = Path(__file__).resolve().parents[1]
if str(AI_ENGINE_DIR) not in sys.path:
  sys.path.insert(0, str(AI_ENGINE_DIR))

import faiss
import pandas as pd
from config import INDEX_PATH, METADATA_PATH, MODEL_OUTPUT_DIR
from sentence_transformers import SentenceTransformer


def load_resources():
  model = SentenceTransformer(str(MODEL_OUTPUT_DIR))

  index = faiss.read_index(str(INDEX_PATH))
  metadata = pd.read_csv(METADATA_PATH)

  return model, index, metadata


def evaluate():
  model, index, metadata = load_resources()

  correct = 0
  total = len(metadata)

  for _, row in metadata.iterrows():

    query = row["english"]
    expected_concept = row["concept_code"]

    embedding = model.encode(
      [query],
      convert_to_numpy=True
    ).astype("float32")

    faiss.normalize_L2(embedding)
    _, indices = index.search(embedding, k=1)
    matched_index = indices[0][0]
    matched_row = metadata.iloc[matched_index]
    predicted_concept = (matched_row["concept_code"])
    
    if predicted_concept == expected_concept:
      correct += 1

  accuracy = correct / total

  print()
  print("=" * 50)
  print("DuoConvo Retrieval Evaluation")
  print("=" * 50)
  print(f"Correct matches : {correct}")
  print(f"Total queries   : {total}")
  print(f"Accuracy        : {accuracy:.2%}")
  print("=" * 50)


if __name__ == "__main__":
  evaluate()