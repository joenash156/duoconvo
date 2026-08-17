"""
build_twi_pairs.py

Loads Ghana-NLP/ENGLISH_TWI_PARALLEL_TEXT (public, no auth needed) and saves
clean (english, twi) pairs for general cross-lingual training - on top of
the curated dataset's 40 domain-specific concept pairs.

Run:
    <path-to-venv>/python.exe dataset-tools/build_twi_pairs.py
"""

import csv
import sys
from pathlib import Path

from datasets import load_dataset

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = PROJECT_ROOT / "datasets" / "generated" / "twi_general_pairs.csv"

MIN_LENGTH = 4
MAX_LENGTH = 200


def main():
    ds = load_dataset("Ghana-NLP/ENGLISH_TWI_PARALLEL_TEXT", split="train")
    print(f"Loaded {len(ds)} raw rows.")

    seen = set()
    rows = []

    for row in ds:
        english = (row.get("text") or "").strip()
        twi = (row.get("label") or "").strip()

        if not english or not twi:
            continue
        if not (MIN_LENGTH <= len(english) <= MAX_LENGTH):
            continue

        key = (english, twi)
        if key in seen:
            continue
        seen.add(key)

        rows.append({"english": english, "twi": twi})

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["english", "twi"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"Done. Wrote {len(rows)} English-Twi pairs to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
