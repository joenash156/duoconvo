"""
build_ewe_pairs.py

datasets/public/French_to_ewe_dataset.csv pairs Ewe with French, not English.
Our anchor language for training is English (that's what the curated dataset
and FAISS index are keyed on), so this bridges French -> English via Google
Translate, then saves usable (english, ewe) pairs for general cross-lingual
training - teaching the model broad Ewe semantic alignment, on top of the
curated dataset's 40 domain-specific concept pairs.

Filters to shorter, phrase-like rows first (this is a general 24k-row corpus
of full sentences, not curated for the market domain) and samples a subset -
translating all 24k would take hours against an unofficial, rate-limited
endpoint for no real benefit over a solid sample.

Run:
    <path-to-venv>/python.exe dataset-tools/build_ewe_pairs.py
"""

import csv
import random
import sys
import time
from pathlib import Path

from deep_translator import GoogleTranslator

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = PROJECT_ROOT / "datasets" / "public" / "French_to_ewe_dataset.csv"
OUTPUT_PATH = PROJECT_ROOT / "datasets" / "generated" / "ewe_general_pairs.csv"

SAMPLE_SIZE = 3000
MIN_LENGTH = 8
MAX_LENGTH = 140
RANDOM_STATE = 42
MAX_RETRIES = 4
RETRY_DELAY_SECONDS = 1.5


def translate_with_retry(translator: GoogleTranslator, text: str) -> str | None:
    last_error = None

    for _ in range(MAX_RETRIES):
        try:
            result = translator.translate(text)
            if result:
                return result
        except Exception as error:  # noqa: BLE001 - retry on any transient failure
            last_error = error
        time.sleep(RETRY_DELAY_SECONDS)

    print(f"  SKIPPED (translation failed after {MAX_RETRIES} attempts): {text!r} ({last_error})")
    return None


def main():
    random.seed(RANDOM_STATE)

    with open(SOURCE_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"Loaded {len(rows)} raw French-Ewe rows.")

    candidates = [
        row
        for row in rows
        if row.get("French") and row.get("Ewe") and MIN_LENGTH <= len(row["French"]) <= MAX_LENGTH
    ]
    print(f"{len(candidates)} rows within length bounds ({MIN_LENGTH}-{MAX_LENGTH} chars).")

    sample = random.sample(candidates, min(SAMPLE_SIZE, len(candidates)))
    print(f"Sampled {len(sample)} rows to translate.")

    translator = GoogleTranslator(source="fr", target="en")
    output_rows = []

    for i, row in enumerate(sample):
        french = row["French"].strip()
        ewe = row["Ewe"].strip()

        english = translate_with_retry(translator, french)
        if english is None:
            continue

        output_rows.append({"english": english, "ewe": ewe})

        if (i + 1) % 100 == 0:
            print(f"[{i + 1}/{len(sample)}] translated so far...")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["english", "ewe"])
        writer.writeheader()
        writer.writerows(output_rows)

    print(f"\nDone. Wrote {len(output_rows)} English-Ewe pairs to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
