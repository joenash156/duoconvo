"""
build_faiss.py

Build a FAISS index from
the generated embeddings.
"""

 
import sys
from pathlib import Path

# Allow this script to be run directly from the project root.
AI_ENGINE_DIR = Path(__file__).resolve().parents[1]
if str(AI_ENGINE_DIR) not in sys.path:
  sys.path.insert(0, str(AI_ENGINE_DIR))

import faiss
import numpy as np
from config import (
  EMBEDDINGS_PATH,
  INDEX_PATH,
)


def load_embeddings():
  print("Loading embeddings...")
  
  embeddings = np.load(EMBEDDINGS_PATH)
  return embeddings.astype("float32")


def build_index(embeddings):
  dimension = embeddings.shape[1]
  index = faiss.IndexFlatIP(dimension)
  
  faiss.normalize_L2(embeddings)
  index.add(embeddings)
  
  return index


def save_index(index):
    faiss.write_index(index, str(INDEX_PATH))
    print("FAISS index saved.")


def main():
  embeddings = load_embeddings()
  print(f"Embedding shape: {embeddings.shape}")

  index = build_index(embeddings)
  save_index(index)


if __name__ == "__main__":
  main()
