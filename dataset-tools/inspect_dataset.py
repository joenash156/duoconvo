"""
inspect_dataset.py

Inspect a dataset before importing it into DuoConvo.
"""

from pathlib import Path

import pandas as pd

from datasets import load_dataset


def inspect_csv(file_path):
  print("=" * 60)
  print(f"Inspecting: {file_path.name}")
  print("=" * 60)

  df = pd.read_csv(file_path)

  print("\nRows, Columns")
  print(df.shape)

  print("\nColumn Names")
  print(df.columns.tolist())

  print("\nFirst Five Rows")
  print(df.head())

  print("\nMissing Values")
  print(df.isnull().sum())

  print("\nData Types")
  print(df.dtypes)

  print("\nInspection Complete.\n")
  
"""
inspect_huggingface.py

Inspect a Hugging Face dataset before using it.
"""


# Datasets to be inspected
DATASET_NAME = "ghananlpcommunity/english-twi_sentence-pairs-4m"


def inspect_dataset(dataset_name):

  print(f"\nLoading {dataset_name}...\n")

  ds = load_dataset(dataset_name)

  print(ds)

  print("\nAvailable Splits:")
  print(ds.keys())

  train = ds["train"]

  print("\nNumber of Rows:")
  print(len(train))

  print("\nColumn Names:")
  print(train.column_names)

  print("\nFirst Example:")
  print(train[0])

  print("\nFirst Five Examples:")

  for i in range(5):
      print(train[i])


if __name__ == "__main__":
  fr_to_ewe_dataset = Path("C:/Users/joena/Desktop/My Projects/mobile_apps/duoconvo/datasets/public/French_to_ewe_dataset.csv")
  en_to_hau_dataset = Path("C:/Users/joena/Desktop/My Projects/mobile_apps/duoconvo/datasets/public/english_hausa_parallel_corpus.csv")
  
  inspect_csv(en_to_hau_dataset)
  inspect_csv(fr_to_ewe_dataset)
  inspect_dataset(DATASET_NAME)