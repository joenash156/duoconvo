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

NEGATIVE_SAMPLES_PER_SENTENCE = 5


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



def generate_negative_pairs(canonical_df, paraphrase_df):

  pairs = []

  all_sentences = list(canonical_df["english"])

  all_sentences.extend(paraphrase_df["paraphrase"].tolist())

  for sentence in all_sentences:
    for _ in range(NEGATIVE_SAMPLES_PER_SENTENCE):
      negative_sentence = random.choice(all_sentences)
      if sentence == negative_sentence:
        continue
      
      pairs.append({
        "sentence_a": sentence,
        "sentence_b": negative_sentence,
        "label": 0
      })

  return pairs



def remove_duplicates(df):
  df = df.drop_duplicates()
  return df



def save_pairs(positive_pairs, negative_pairs):
  df = pd.DataFrame(positive_pairs + negative_pairs)
  df = remove_duplicates(df)
  df = df.sample(frac=1, random_state=RANDOM_STATE)

  df.to_csv(
    SENTENCE_PAIRS_DATASET,
    index=False
  )

  print(f"Saved {len(df)} sentence pairs.")


def main():
  canonical_df, paraphrase_df = load_datasets()
  positive_pairs = generate_positive_pairs(
      canonical_df,
      paraphrase_df
  )

  negative_pairs = generate_negative_pairs(
    canonical_df,
    paraphrase_df
  )

  save_pairs(
    positive_pairs,
    negative_pairs
  )


if __name__ == "__main__":
   main()