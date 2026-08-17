"""
translate_curated_dataset.py

Fills in the twi/ewe/french columns of datasets/curated/multilingual_phrases.csv
using Google Translate (via deep-translator), so the market_phrases table has
real translations to serve instead of always falling back to the LLM.

Ga is deliberately left blank - it is not in Google Translate's (or
MyMemory's) supported language list at all, unlike Twi ("ak"/Akan) and Ewe
("ee"), which both work. This mirrors the project's existing philosophy of
not faking language support that doesn't exist (see the STT/TTS hybrid
services) rather than silently leaving Ga looking "done".

Run:
    <path-to-venv>/python.exe dataset-tools/translate_curated_dataset.py
"""

import csv
import sys
import time
from pathlib import Path

from deep_translator import GoogleTranslator

# Windows consoles default to cp1252, which can't print Twi/Ewe characters
# like "ɛ" - reconfigure stdout to UTF-8 so progress logging doesn't crash.
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = Path(__file__).resolve().parents[1]
CURATED_DATASET = PROJECT_ROOT / "datasets" / "curated" / "multilingual_phrases.csv"

# DuoConvo language code -> Google Translate language code.
# "ga" (Ga) intentionally omitted - not supported by Google Translate.
TARGET_LANGUAGES = {
    "twi": "ak",
    "ewe": "ee",
    "french": "fr",
}

MAX_RETRIES = 4
RETRY_DELAY_SECONDS = 1.5


def translate_with_retry(translator: GoogleTranslator, text: str) -> str:
    last_error = None

    for attempt in range(MAX_RETRIES):
        try:
            result = translator.translate(text)
            if result:
                return result
        except Exception as error:  # noqa: BLE001 - retry on any transient failure
            last_error = error
        time.sleep(RETRY_DELAY_SECONDS)

    raise RuntimeError(f"Failed to translate {text!r} after {MAX_RETRIES} attempts: {last_error}")


def main():
    with open(CURATED_DATASET, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fieldnames = reader.fieldnames

    translators = {column: GoogleTranslator(source="en", target=code) for column, code in TARGET_LANGUAGES.items()}

    for i, row in enumerate(rows):
        english = row["english"]
        print(f"[{i + 1}/{len(rows)}] {row['concept_code']}: {english}")

        for column, translator in translators.items():
            translated = translate_with_retry(translator, english)
            row[column] = translated
            print(f"  {column}: {translated}")

        row["verification_status"] = "MACHINE_TRANSLATED"
        # "ga" column left as-is (blank) - no Google Translate support.

    with open(CURATED_DATASET, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nDone. Updated {len(rows)} rows in {CURATED_DATASET}")


if __name__ == "__main__":
    main()
