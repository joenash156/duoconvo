"""
populate_ga_column.py

Google Translate and MyMemory both confirmed to have zero Ga support (see
translate_curated_dataset.py). GhanaNLP's (Khaya AI) cloud translation API
does support Ga ("gaa") though - verified directly against the live API,
not just documentation. Fills in the previously-blank ga column for all 40
curated concepts using it.

Reads GHANANLP_API_KEY straight out of api/.env rather than duplicating the
secret - this script has no other dependency on the Node backend.

Run:
    <path-to-venv>/python.exe dataset-tools/populate_ga_column.py
"""

import csv
import re
import sys
import time
from pathlib import Path

import requests

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = Path(__file__).resolve().parents[1]
CURATED_DATASET = PROJECT_ROOT / "datasets" / "curated" / "multilingual_phrases.csv"
API_ENV_PATH = PROJECT_ROOT / "api" / ".env"

TRANSLATE_URL = "https://translation-api.ghananlp.org/v1/translate"
MAX_RETRIES = 4
RETRY_DELAY_SECONDS = 2


def load_api_key() -> str:
    content = API_ENV_PATH.read_text(encoding="utf-8")
    match = re.search(r"^GHANANLP_API_KEY=(.+)$", content, re.MULTILINE)
    if not match:
        raise RuntimeError(f"GHANANLP_API_KEY not found in {API_ENV_PATH}")
    return match.group(1).strip()


def translate_with_retry(api_key: str, text: str) -> str | None:
    headers = {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": api_key,
    }
    payload = {"in": text, "lang": "en-gaa"}

    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.post(TRANSLATE_URL, json=payload, headers=headers, timeout=15)
            response.raise_for_status()
            # The API returns the translation as a bare JSON string, e.g. "Enyiɛ enɛ ji?"
            result = response.json()
            if isinstance(result, str) and result.strip():
                return result.strip()
            last_error = f"Unexpected response shape: {result!r}"
        except Exception as error:  # noqa: BLE001
            last_error = error
        time.sleep(RETRY_DELAY_SECONDS)

    print(f"  SKIPPED (failed after {MAX_RETRIES} attempts): {text!r} ({last_error})")
    return None


def main():
    api_key = load_api_key()

    with open(CURATED_DATASET, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fieldnames = reader.fieldnames

    filled = 0
    for i, row in enumerate(rows):
        english = row["english"]
        print(f"[{i + 1}/{len(rows)}] {row['concept_code']}: {english}")

        translated = translate_with_retry(api_key, english)
        if translated is not None:
            row["ga"] = translated
            print(f"  ga: {translated}")
            filled += 1

    with open(CURATED_DATASET, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nDone. Filled {filled}/{len(rows)} Ga translations in {CURATED_DATASET}")


if __name__ == "__main__":
    main()
