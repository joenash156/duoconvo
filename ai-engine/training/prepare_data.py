"""
prepare_data.py

Loads and validates the DuoConvo datasets before training.
"""

import sys
from pathlib import Path

# Allow this script to be run directly from the project root.
AI_ENGINE_DIR = Path(__file__).resolve().parents[1]
if str(AI_ENGINE_DIR) not in sys.path:
  sys.path.insert(0, str(AI_ENGINE_DIR))

import pandas as pd
from config import CURATED_DATASET, PARAPHRASES_DATASET


def load_canonical_dataset():
  """
  Load the canonical multilingual dataset.
  """
  df = pd.read_csv(CURATED_DATASET)
  return df


def load_paraphrases_dataset():
  """
  Load the paraphrases dataset.
  """
  df = pd.read_csv(PARAPHRASES_DATASET)
  return df


def validate_dataset(df):
  """
  Ensure the dataset contains the required columns.
  """
  required_columns = [
    "id",
    "concept_code",
    "domain",
    "intent",
    "english"
  ]

  missing = []

  for column in required_columns:
    if column not in df.columns:
      missing.append(column)

  if len(missing) > 0:
    raise ValueError(f"Dataset is missing required columns: {missing}")
  
  print("Dataset validation passed.")


def show_dataset_summary(df):
  """
  # Display useful dataset statistics.
  """
  print("\n========== DATASET SUMMARY ==========")

  print(f"Total Concepts : {len(df)}")

  print(f"Domains        : {df['domain'].nunique()}")

  print(f"Intents        : {df['intent'].nunique()}")

  print("\nConcepts Per Intent\n")

  print(df["intent"].value_counts())

  print("\n====================================\n")


def main():

  canonical_df = load_canonical_dataset()

  validate_dataset(canonical_df)

  show_dataset_summary(canonical_df)


if __name__ == "__main__":
  main()
