"""
filter_market_phrases.py

Filters general multilingual datasets into
market-related candidate phrases.
"""

import re

import pandas as pd

MARKET_KEYWORDS = [
  "buy", "buying", "buys", "bought",
  "sell", "selling", "sells", "sold",
  "price", "prices", "priced",
  "cost", "costs", "costing",
  "pay", "paying", "pays", "paid",
  "payment", "payments",
  "cash",
  "money",
  "market", "markets",
  "shop", "shops", "shopping",
  "store", "stores",
  "food", "foods",
  "rice",
  "tomato", "tomatoes",
  "pepper", "peppers",
  "fish",
  "meat",
  "fruit", "fruits",
  "vegetable", "vegetables",
  "bag", "bags",
  "basket", "baskets",
  "bottle", "bottles",
  "water",
  "drink", "drinks",
  "bread",
  "discount", "discounts",
  "cheap", "cheaper", "cheapest",
  "expensive",
  "kilogram", "kilograms",
  "kg",
  "gram", "grams",
  "quantity", "quantities",
  "piece", "pieces",
  "customer", "customers",
  "seller", "sellers",
  "taxi", "taxis",
  "restaurant", "restaurants",
  "hotel", "hotels",
  "receipt", "receipts",
  "mobile money",
  "momo"
]


# Word-boundary matching, not plain substring - "price" as a bare substring
# also matches inside "prices" (fine) but "rice"/"kg"/"gram"/"store" as bare
# substrings false-positive inside completely unrelated words like
# "p-RICE-s", "bac-KG-round", "-GRAM-shana", "-STORE-d". \b handles the
# "mobile money" two-word keyword correctly too (boundary at each end).
MARKET_KEYWORD_PATTERN = re.compile(
  r"\b(" + "|".join(re.escape(keyword) for keyword in MARKET_KEYWORDS) + r")\b",
  re.IGNORECASE,
)


def is_market_sentence(sentence):
  return bool(MARKET_KEYWORD_PATTERN.search(str(sentence)))


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