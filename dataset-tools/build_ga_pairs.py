"""
build_ga_pairs.py

michsethowusu/ghana-chat-corpus-gaa (public, no auth needed) is mostly
paragraph-length news/research articles - too long for sentence-level
semantic training. Each row also carries a short generated_question /
generated_question_gaa pair though, which is naturally phrase-like and
question-structured - a good match for our market-phrase domain (most of
our curated phrases are questions too). This extracts just those, streamed
and capped at SAMPLE_SIZE rather than materializing the full ~200k+ row,
400MB dataset.

Run:
    <path-to-venv>/python.exe dataset-tools/build_ga_pairs.py
"""

import csv
import sys
from pathlib import Path

from datasets import load_dataset

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = PROJECT_ROOT / "datasets" / "generated" / "ga_general_pairs.csv"

SAMPLE_SIZE = 8000
MIN_LENGTH = 4
MAX_LENGTH = 200


def main():
    ds = load_dataset("michsethowusu/ghana-chat-corpus-gaa", split="train", streaming=True)

    seen = set()
    rows = []

    for row in ds:
        english = (row.get("generated_question") or "").strip()
        gaa = (row.get("generated_question_gaa") or "").strip()

        if not english or not gaa:
            continue
        if not (MIN_LENGTH <= len(english) <= MAX_LENGTH):
            continue

        key = (english, gaa)
        if key in seen:
            continue
        seen.add(key)

        rows.append({"english": english, "ga": gaa})

        if len(rows) % 1000 == 0:
            print(f"Collected {len(rows)} pairs so far...")

        if len(rows) >= SAMPLE_SIZE:
            break

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["english", "ga"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"Done. Wrote {len(rows)} English-Ga pairs to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
