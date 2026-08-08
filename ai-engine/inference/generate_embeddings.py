"""
generate_embeddings.py

Generate embeddings from the
fine-tuned DuoConvo model.
"""

import sys
from pathlib import Path

# Allow this script to be run directly from the project root.
AI_ENGINE_DIR = Path(__file__).resolve().parents[1]
if str(AI_ENGINE_DIR) not in sys.path:
  sys.path.insert(0, str(AI_ENGINE_DIR))

# import necessary libraries
import numpy as np
import pandas as pd
from config import (
  CURATED_DATASET,
  MODEL_OUTPUT_DIR,
  OUTPUT_EMBEDDINGS,
  OUTPUT_METADATA,
)
from sentence_transformers import SentenceTransformer


def load_model():
  print("Loading fine-tuned model...")
  
  # load the fine-tuned model
  return SentenceTransformer(str(MODEL_OUTPUT_DIR))


def load_dataset():
  print("Loading curated dataset...")
  
  # load the curated dataset
  return pd.read_csv(CURATED_DATASET)


def generate_embeddings(model, df):
  print("Generating embeddings...")

  # generate embeddings for the English phrases
  embeddings = model.encode(
    df["english"].tolist(),
    convert_to_numpy=True,
    show_progress_bar=True,
  )

  return embeddings


def save_outputs(df, embeddings):
  print("Saving embeddings and metadata...")
  
  # create the output directory if it doesn't exist
  OUTPUT_EMBEDDINGS.parent.mkdir(parents=True, exist_ok=True)
  
  # save embeddings and metadata
  np.save(OUTPUT_EMBEDDINGS, embeddings)
  # save metadata (English phrases and their translations) to CSV
  df.to_csv(OUTPUT_METADATA,index=False)

  print("Embeddings saved.")


def main():
  # load the fine-tuned model and curated dataset
  print("Initializing...")
  model = load_model()
  
  # load the curated dataset
  df = load_dataset()
  
  # generate embeddings
  embeddings = generate_embeddings(model, df)
  
  # save embeddings and metadata
  save_outputs(df, embeddings)
  print(f"Saved to: {OUTPUT_EMBEDDINGS}")


if __name__ == "__main__":
  main()
