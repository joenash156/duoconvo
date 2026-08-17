"""
filter_general_conversational_pairs.py

Mirrors filter_general_pairs.py, but pulls out general-conversation-relevant
rows (see filter_conversational_phrases.py) instead of market-relevant ones,
from the same raw Twi/Ga/Ewe parallel corpora. Produces a second, separate
filtered slice of the same source files - the market and conversational
training signals stay distinct rather than merged, so each can be
oversampled/capped independently in build_pairs.py.

Run:
    <path-to-venv>/python.exe dataset-tools/filter_general_conversational_pairs.py
"""

import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
from filter_conversational_phrases import is_conversational_sentence  # noqa: E402

PROJECT_ROOT = Path(__file__).resolve().parent.parent
GENERATED_DIR = PROJECT_ROOT / "datasets" / "generated"

FILES = [
    ("twi_general_pairs.csv", "twi_conversational_pairs.csv"),
    ("ga_general_pairs.csv", "ga_conversational_pairs.csv"),
    ("ewe_general_pairs.csv", "ewe_conversational_pairs.csv"),
]


def main():
    for source_filename, output_filename in FILES:
        source_path = GENERATED_DIR / source_filename
        output_path = GENERATED_DIR / output_filename

        df = pd.read_csv(source_path)
        filtered = df[df["english"].apply(is_conversational_sentence)]

        print(f"{source_filename}: {len(df)} -> {len(filtered)} rows after conversational-keyword filtering.")

        filtered.to_csv(output_path, index=False)


if __name__ == "__main__":
    main()
