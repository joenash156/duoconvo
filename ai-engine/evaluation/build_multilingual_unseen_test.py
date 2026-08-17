"""
build_multilingual_unseen_test.py
"""

import csv
import sys
import time
from pathlib import Path

from deep_translator import GoogleTranslator

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ENGLISH_UNSEEN_PATH = PROJECT_ROOT / "ai-engine" / "evaluation" / "unseen_test.csv"
OUTPUT_PATH = PROJECT_ROOT / "ai-engine" / "evaluation" / "unseen_test_multilingual.csv"

TARGET_LANGUAGES = {
    "twi": "ak",
    "ewe": "ee",
    "french": "fr",
}

MAX_RETRIES = 4
RETRY_DELAY_SECONDS = 1.5


def translate_with_retry(translator: GoogleTranslator, text: str) -> str | None:
    last_error = None

    for _ in range(MAX_RETRIES):
        try:
            result = translator.translate(text)
            if result:
                return result
        except Exception as error:  # noqa: BLE001
            last_error = error
        time.sleep(RETRY_DELAY_SECONDS)

    print(f"  SKIPPED (failed after {MAX_RETRIES} attempts): {text!r} ({last_error})")
    return None


def main():
    with open(ENGLISH_UNSEEN_PATH, newline="", encoding="utf-8") as f:
        english_rows = list(csv.DictReader(f))

    print(f"Loaded {len(english_rows)} held-out English paraphrases.")

    translators = {lang: GoogleTranslator(source="en", target=code) for lang, code in TARGET_LANGUAGES.items()}
    output_rows = []

    # English itself stays in the multilingual test set too, as a baseline.
    for row in english_rows:
        output_rows.append({"concept_code": row["concept_code"], "language": "english", "text": row["english"]})

    for lang, translator in translators.items():
        print(f"Translating to {lang}...")
        for row in english_rows:
            translated = translate_with_retry(translator, row["english"])
            if translated is None:
                continue
            output_rows.append({"concept_code": row["concept_code"], "language": lang, "text": translated})

    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["concept_code", "language", "text"])
        writer.writeheader()
        writer.writerows(output_rows)

    print(f"\nDone. Wrote {len(output_rows)} rows ({len(english_rows)} per language) to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
