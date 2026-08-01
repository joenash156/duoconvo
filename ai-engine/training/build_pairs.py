"""
build_pairs.py

Generate positive and negative sentence pairs
for Sentence Transformer fine-tuning.
"""

import random

import pandas as pd
from config import (
  CURATED_DATASET,
  PARAPHRASES_DATASET,
  RANDOM_STATE,
  SENTENCE_PAIRS_DATASET,
)

random.seed(RANDOM_STATE)


def load_datasets():
  canonical_df = pd.read_csv(CURATED_DATASET)
  paraphrase_df = pd.read_csv(PARAPHRASES_DATASET)
  return canonical_df, paraphrase_df


def generate_positive_pairs(canonical_df, paraphrase_df):

  pairs = []

  for _, canonical in canonical_df.iterrows():
    concept = canonical["concept_code"]
    canonical_sentence = canonical["english"]
    matches = paraphrase_df[
      paraphrase_df["concept_code"] == concept
    ]

    for _, row in matches.iterrows():

      pairs.append({
        "sentence_a": canonical_sentence,
        "sentence_b": row["paraphrase"],
        "label": 1
      })

  return pairs


def generate_negative_pairs(canonical_df):

  pairs = []

  sentences = canonical_df["english"].tolist()
  concepts = canonical_df["concept_code"].tolist()
  
  for i in range(len(sentences)):
    current_sentence = sentences[i]
    current_concept = concepts[i]

    while True:
      random_index = random.randint(0, len(sentences) - 1)

      if concepts[random_index] != current_concept:
        pairs.append({
          "sentence_a": current_sentence,
          "sentence_b": sentences[random_index],
          "label": 0
        })

        break

  return pairs


def save_pairs(positive_pairs, negative_pairs):

  df = pd.DataFrame(positive_pairs + negative_pairs)

  df.to_csv(SENTENCE_PAIRS_DATASET, index=False)

  print(f"✅ Saved {len(df)} sentence pairs.")


def main():

    canonical_df, paraphrase_df = load_datasets()

    positive_pairs = generate_positive_pairs(
      canonical_df,
      paraphrase_df
    )

    negative_pairs = generate_negative_pairs(
      canonical_df
    )

    save_pairs(
      positive_pairs,
      negative_pairs
    )


if __name__ == "__main__":
  main()