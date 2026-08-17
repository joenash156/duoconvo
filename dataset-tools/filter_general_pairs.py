"""
filter_general_pairs.py

The Twi/Ga/Ewe general pairs (build_twi_pairs.py, build_ga_pairs.py,
build_ewe_pairs.py) came from generic news/research/literary corpora, unlike
the English training data which only ever used market-domain content (the
40 curated concepts + their market-specific paraphrases). Filters each
general-pairs file down to rows whose English side is market-relevant,
reusing filter_market_phrases.py's exact MARKET_KEYWORDS list (not a
reimplementation) so "market-relevant" means the same thing for every
language. Without this, the much larger volume of generic cross-lingual
pairs would dilute/genericize what the model learns instead of sharpening
market-phrase discrimination.

Run:
    <path-to-venv>/python.exe dataset-tools/filter_general_pairs.py
"""

import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
from filter_market_phrases import is_market_sentence  # noqa: E402

PROJECT_ROOT = Path(__file__).resolve().parent.parent
GENERATED_DIR = PROJECT_ROOT / "datasets" / "generated"

FILES = [
    ("twi_general_pairs.csv", "twi_market_pairs.csv"),
    ("ga_general_pairs.csv", "ga_market_pairs.csv"),
    ("ewe_general_pairs.csv", "ewe_market_pairs.csv"),
]


def main():
    for source_filename, output_filename in FILES:
        source_path = GENERATED_DIR / source_filename
        output_path = GENERATED_DIR / output_filename

        df = pd.read_csv(source_path)
        filtered = df[df["english"].apply(is_market_sentence)]

        print(f"{source_filename}: {len(df)} -> {len(filtered)} rows after market-keyword filtering.")

        # Written to a new file, not overwriting the source - keeps the
        # (expensive to regenerate, especially Ewe's translation pass)
        # unfiltered general pairs available in case the filter needs tuning.
        filtered.to_csv(output_path, index=False)


if __name__ == "__main__":
    main()
