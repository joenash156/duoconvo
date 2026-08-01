"""
filter_market_phrases.py

Filters general multilingual datasets into
market-related candidate phrases.
"""

import pandas as pd

MARKET_KEYWORDS = [
  "buy",
  "sell",
  "price",
  "cost",
  "pay",
  "payment",
  "cash",
  "money",
  "market",
  "shop",
  "store",
  "food",
  "rice",
  "tomato",
  "pepper",
  "fish",
  "meat",
  "fruit",
  "vegetable",
  "bag",
  "basket",
  "bottle",
  "water",
  "drink",
  "bread",
  "discount",
  "cheap",
  "expensive",
  "kilogram",
  "kg",
  "gram",
  "quantity",
  "piece",
  "customer",
  "seller",
  "taxi",
  "restaurant",
  "hotel",
  "receipt",
  "mobile money",
  "momo"
]


def is_market_sentence(sentence):
  sentence = str(sentence).lower()

  return any(
    keyword in sentence
    for keyword in MARKET_KEYWORDS
  )


def filter_dataset(df, text_column="English"):
  filtered = df[
    df[text_column].apply(is_market_sentence)
  ]

  return filtered

# C:/Users/joena/Desktop/My Projects/mobile_apps/duoconvo/

def main():
  input_file = (
    "C:/Users/joena/Desktop/My Projects/mobile_apps/duoconvo/datasets/public/"
    "english_hausa_parallel_corpus.csv"
  )

  output_file = (
    "C:/Users/joena/Desktop/My Projects/mobile_apps/duoconvo/datasets/curated/"
    "candidate_market_phrases.csv"
  )

  df = pd.read_csv(input_file)

  filtered = filter_dataset(df)

  filtered.to_csv(
    output_file,
    index=False
  )

  print(
    f"Found {len(filtered)} "
    "market-related sentences."
  )


if __name__ == "__main__":
  main()