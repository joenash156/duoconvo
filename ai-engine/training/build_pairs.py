"""
build_pairs.py

Generate positive and negative sentence pairs
for Sentence Transformer fine-tuning.

Originally English-only (paraphrases of the same concept = positive,
random/same-intent-different-concept English sentences = negative). The
model was never actually taught cross-lingual alignment this way - it only
learned to compare English sentences to each other, so retrieval quality
for Twi/Ga/Ewe/French queries depended entirely on the base multilingual
model's unadjusted cross-lingual alignment, unverified and untested.

Now also builds genuine cross-lingual pairs:
  - curated: the 40 concepts' real English<->Twi/Ewe/French translations
    (Google Translate, see translate_curated_dataset.py) - oversampled since
    these are exactly the concepts the app needs to get right. Ga is skipped
    here (no translation exists yet - see dataset-tools/build_ga_pairs.py
    for how Ga training signal is still contributed, just not via the
    curated set).
  - general: broader English<->Twi/Ga/Ewe sentence pairs from real parallel
    corpora (dataset-tools/build_{twi,ga,ewe}_pairs.py), sampled down from
    much larger sources. Teaches general language alignment rather than
    domain-specific concepts - see idea.md's GENERAL DATA vs CURATED MARKET
    DATA distinction.
"""

import random
import sys
from pathlib import Path

# Allow this script to be run directly from the project root.
AI_ENGINE_DIR = Path(__file__).resolve().parents[1]
if str(AI_ENGINE_DIR) not in sys.path:
  sys.path.insert(0, str(AI_ENGINE_DIR))

import pandas as pd
from config import (
  CURATED_DATASET,
  EWE_GENERAL_PAIRS,
  GA_GENERAL_PAIRS,
  PARAPHRASES_DATASET,
  RANDOM_STATE,
  SENTENCE_PAIRS_DATASET,
  TWI_GENERAL_PAIRS,
)

random.seed(RANDOM_STATE)

NEGATIVE_SAMPLES_PER_SENTENCE = 5
# Kept deliberately low (1, not 3) - v1 at 3 pushed the negative:positive
# ratio too high (~8.6:1) and applied uniform separation pressure across ALL
# same-intent concepts, including genuinely near-synonymous ones (PRICE_001
# vs PRICE_003), which regressed unseen accuracy from 63.16% to 57.89%
# (see ai-engine/models/duoconvo-model-backup-hardneg-v1-57pct).
HARD_NEGATIVE_SAMPLES_PER_SENTENCE = 1

# The curated set is tiny (40 concepts) compared to the general corpora
# (thousands of rows) - without oversampling, cross-lingual signal for our
# actual domain concepts would be drowned out.
CURATED_CROSS_LINGUAL_OVERSAMPLE = 4

# Caps per general-corpus language, so no single source dominates training
# time or signal. Twi/Ga naturally have more available; Ewe is capped by how
# many rows build_ewe_pairs.py successfully translated (~3000 max).
GENERAL_PAIRS_CAP = 1500

# Separate (smaller) from NEGATIVE_SAMPLES_PER_SENTENCE above - at 5x, three
# languages x 2500 general positives produced 37,484 negative pairs alone
# (48,308 pairs total, ~15x the 3240-pair recipe that got the best verified
# result so far, which would have meant hours of training for unproven
# benefit - the hard-negative experiment already showed more isn't
# automatically better).
CROSS_LINGUAL_NEGATIVE_SAMPLES_PER_SENTENCE = 2

CROSS_LINGUAL_LANGUAGE_COLUMNS = ["twi", "ewe", "french"]


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



def generate_hard_negative_pairs(canonical_df, paraphrase_df):
  """
  Random negatives (generate_negative_pairs) mostly pair obviously-unrelated
  sentences, which teaches the model to separate clearly different concepts
  but not to distinguish similar ones within the same intent (e.g.
  PRICE_004 "Can you tell me the price?" vs PRICE_006 "What's your best
  price?", or GREETING_004 "Hello" vs GREETING_005 "Hi" - both observed as
  confused in evaluation/evaluate_unseen.py). This pairs sentences from
  different concepts that share the same intent as explicit negatives, so
  the model has to learn those finer boundaries.
  """
  concept_to_intent = dict(zip(canonical_df["concept_code"], canonical_df["intent"]))

  sentences_by_intent = {}
  for _, row in canonical_df.iterrows():
    sentences_by_intent.setdefault(row["intent"], []).append((row["concept_code"], row["english"]))
  for _, row in paraphrase_df.iterrows():
    intent = concept_to_intent.get(row["concept_code"])
    if intent is None:
      continue
    sentences_by_intent.setdefault(intent, []).append((row["concept_code"], row["paraphrase"]))

  pairs = []

  for items in sentences_by_intent.values():
    for concept_a, sentence_a in items:
      candidates = [item for item in items if item[0] != concept_a]
      if not candidates:
        continue

      sample_size = min(HARD_NEGATIVE_SAMPLES_PER_SENTENCE, len(candidates))
      for _, sentence_b in random.sample(candidates, sample_size):
        pairs.append({
          "sentence_a": sentence_a,
          "sentence_b": sentence_b,
          "label": 0
        })

  return pairs


def generate_curated_cross_lingual_pairs(canonical_df):
  """
  Direct English <-> translation pairs for the 40 curated concepts - the
  exact concepts the app needs to retrieve correctly, so oversampled
  relative to the much larger general corpora below.
  """
  pairs = []

  for _, row in canonical_df.iterrows():
    english = row["english"]

    for column in CROSS_LINGUAL_LANGUAGE_COLUMNS:
      translation = row.get(column)
      if not isinstance(translation, str) or not translation.strip():
        continue

      for _ in range(CURATED_CROSS_LINGUAL_OVERSAMPLE):
        pairs.append({
          "sentence_a": english,
          "sentence_b": translation,
          "label": 1
        })

  return pairs


def load_general_pairs(path, language_column):
  if not path.exists():
    print(f"WARNING: {path} not found - run dataset-tools/build_{language_column}_pairs.py first. Skipping.")
    return pd.DataFrame(columns=["english", language_column])

  return pd.read_csv(path)


def generate_general_cross_lingual_pairs():
  """
  Broader English<->language pairs from real parallel corpora, sampled down
  to GENERAL_PAIRS_CAP per language. General semantic/language coverage,
  not domain-specific - see idea.md's GENERAL DATA vs CURATED MARKET DATA
  distinction.
  """
  positive_pairs = []
  all_translations_by_language = {}

  for path, language_column in [
    (TWI_GENERAL_PAIRS, "twi"),
    (GA_GENERAL_PAIRS, "ga"),
    (EWE_GENERAL_PAIRS, "ewe"),
  ]:
    df = load_general_pairs(path, language_column)
    if df.empty:
      continue

    sample = df.sample(n=min(GENERAL_PAIRS_CAP, len(df)), random_state=RANDOM_STATE)
    all_translations_by_language[language_column] = sample

    for _, row in sample.iterrows():
      positive_pairs.append({
        "sentence_a": row["english"],
        "sentence_b": row[language_column],
        "label": 1
      })

    print(f"  {language_column}: sampled {len(sample)} of {len(df)} general pairs.")

  return positive_pairs, all_translations_by_language


def generate_cross_lingual_negative_pairs(translations_by_language):
  """
  Mismatched English sentence + unrelated translation from the general
  corpora, so the model also learns cross-lingual sentences DON'T always
  mean the same thing, not just that some do.
  """
  pairs = []

  for language_column, df in translations_by_language.items():
    if len(df) < 2:
      continue

    english_sentences = df["english"].tolist()
    translations = df[language_column].tolist()

    for i, english in enumerate(english_sentences):
      for _ in range(CROSS_LINGUAL_NEGATIVE_SAMPLES_PER_SENTENCE):
        j = random.randrange(len(translations))
        if j == i:
          continue

        pairs.append({
          "sentence_a": english,
          "sentence_b": translations[j],
          "label": 0
        })

  return pairs


def remove_duplicates(df):
  df = df.drop_duplicates()
  return df



def save_pairs(all_pairs):
  df = pd.DataFrame(all_pairs)
  df = remove_duplicates(df)
  df = df.sample(frac=1, random_state=RANDOM_STATE)

  df.to_csv(
    SENTENCE_PAIRS_DATASET,
    index=False
  )

  print(f"Saved {len(df)} sentence pairs.")


def main():
  canonical_df, paraphrase_df = load_datasets()

  positive_pairs = generate_positive_pairs(canonical_df, paraphrase_df)
  negative_pairs = generate_negative_pairs(canonical_df, paraphrase_df)

  # generate_hard_negative_pairs() exists and works, but two tuning attempts
  # (3 and 1 samples/sentence) both regressed unseen-paraphrase accuracy from
  # 63.16% to 57.89% - see ai-engine/models/duoconvo-model-backup-hardneg-v1-57pct.
  # With only 40 concepts, forcing separation between genuinely near-synonymous
  # same-intent concepts (e.g. PRICE_001 vs PRICE_003) seems to do more harm
  # than good. Left unused rather than deleted - may be worth revisiting once
  # the curated dataset has more concepts/paraphrases per concept.

  curated_cross_lingual_pairs = generate_curated_cross_lingual_pairs(canonical_df)

  print("Sampling general cross-lingual pairs...")
  general_cross_lingual_pairs, translations_by_language = generate_general_cross_lingual_pairs()
  general_cross_lingual_negative_pairs = generate_cross_lingual_negative_pairs(translations_by_language)

  print(f"English positive pairs: {len(positive_pairs)}")
  print(f"English random negative pairs: {len(negative_pairs)}")
  print(f"Curated cross-lingual positive pairs (oversampled x{CURATED_CROSS_LINGUAL_OVERSAMPLE}): {len(curated_cross_lingual_pairs)}")
  print(f"General cross-lingual positive pairs: {len(general_cross_lingual_pairs)}")
  print(f"General cross-lingual negative pairs: {len(general_cross_lingual_negative_pairs)}")

  save_pairs(
    positive_pairs
    + negative_pairs
    + curated_cross_lingual_pairs
    + general_cross_lingual_pairs
    + general_cross_lingual_negative_pairs
  )


if __name__ == "__main__":
   main()
