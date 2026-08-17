"""
mine_ga_translations.py

No machine translation exists for Ga (confirmed against Google Translate and
MyMemory's actual supported-language lists - see translate_curated_dataset.py),
so this doesn't translate anything. Instead, once the model has been trained
with general Ga alignment (dataset-tools/build_ga_pairs.py's pairs), it uses
the model itself to search the Ga corpus for the closest existing Ga sentence
to each of the 40 curated English concepts (semantic search, not translation).

This is expected to mostly fail to find good matches: the Ga corpus is
news/research Q&A, not market phrases, so there's little topical overlap
with "How much is this?"-style concepts. Only matches above SIMILARITY_THRESHOLD
are written back to the curated dataset - anything lower is left honestly
blank, same principle as the rest of this project's language-support gaps.

Run AFTER retraining (needs the trained model + a Ga sentence pool):
    <path-to-venv>/python.exe dataset-tools/mine_ga_translations.py
"""

import csv
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

AI_ENGINE_DIR = Path(__file__).resolve().parents[1] / "ai-engine"
if str(AI_ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_ENGINE_DIR))

import numpy as np
from config import CURATED_DATASET, GA_GENERAL_PAIRS, MODEL_OUTPUT_DIR
from sentence_transformers import SentenceTransformer, util

SIMILARITY_THRESHOLD = 0.75


def main():
    model = SentenceTransformer(str(MODEL_OUTPUT_DIR))

    with open(CURATED_DATASET, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fieldnames = reader.fieldnames

    with open(GA_GENERAL_PAIRS, newline="", encoding="utf-8") as f:
        ga_pool = list(csv.DictReader(f))

    print(f"Searching {len(ga_pool)} candidate Ga sentences for {len(rows)} concepts...")

    ga_sentences = [row["ga"] for row in ga_pool]
    ga_embeddings = model.encode(ga_sentences, convert_to_numpy=True, show_progress_bar=True, batch_size=64)

    accepted = 0
    for row in rows:
        if row.get("ga") and row["ga"].strip():
            continue  # already has one somehow

        query_embedding = model.encode([row["english"]], convert_to_numpy=True)
        similarities = util.cos_sim(query_embedding, ga_embeddings)[0].numpy()
        best_idx = int(np.argmax(similarities))
        best_score = float(similarities[best_idx])

        if best_score >= SIMILARITY_THRESHOLD:
            row["ga"] = ga_sentences[best_idx]
            print(f"  ACCEPTED {row['concept_code']}: {row['english']!r} -> {ga_sentences[best_idx]!r} (sim {best_score:.3f})")
            accepted += 1
        else:
            print(f"  no good match for {row['concept_code']}: {row['english']!r} (best sim {best_score:.3f})")

    with open(CURATED_DATASET, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nDone. Accepted {accepted}/{len(rows)} Ga matches above similarity {SIMILARITY_THRESHOLD}.")


if __name__ == "__main__":
    main()
