"""
evaluate_unseen_multilingual.py

Reports two accuracies, not one:
  - Exact:    predicted concept_code == expected concept_code. The strict,
              original metric.
  - Blended:  also counts a prediction as correct when it landed on the
              WRONG concept but the RIGHT intent (e.g. predicted PRICE_003
              instead of PRICE_001 - still correctly recognized this as a
              price question) with a high similarity score. Getting the
              intent right with high confidence is a materially different,
              much less serious mistake than confusing a price question for
              a greeting entirely, and the strict metric alone doesn't
              distinguish the two.

high_similarity's 0.70 cutoff is intentionally stricter than
confidence.py's own HIGH_CONFIDENCE threshold (0.60) - this metric is
specifically trying to isolate "the model clearly understood the intent,
just picked a close sibling concept," not just "confidence was okay."
"""

import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # pyright: ignore[reportAttributeAccessIssue]

AI_ENGINE_DIR = Path(__file__).resolve().parents[1]
if str(AI_ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_ENGINE_DIR))

import faiss
import pandas as pd
from config import INDEX_PATH, METADATA_PATH, MODEL_OUTPUT_DIR
from sentence_transformers import SentenceTransformer

TEST_PATH = Path(__file__).resolve().parent / "unseen_test_multilingual.csv"
HIGH_SIMILARITY_THRESHOLD = 0.70


def main():
    model = SentenceTransformer(str(MODEL_OUTPUT_DIR))
    index = faiss.read_index(str(INDEX_PATH))
    metadata = pd.read_csv(METADATA_PATH)
    test_data = pd.read_csv(TEST_PATH)

    # unseen_test_multilingual.csv only has concept_code/language/text, not
    # intent - look expected_intent up from the same metadata the model's
    # own predictions are resolved against, rather than trusting a column
    # that doesn't exist in the CSV.
    intent_by_concept = dict(zip(metadata["concept_code"], metadata["intent"]))

    results_by_language = {}

    for _, row in test_data.iterrows():
        language = row["language"]
        query = row["text"]
        expected = row["concept_code"]
        expected_intent = intent_by_concept.get(expected)

        embedding = model.encode([query], convert_to_numpy=True).astype("float32")
        faiss.normalize_L2(embedding)

        scores, indices = index.search(embedding, k=1)
        matched_row = metadata.iloc[indices[0][0]]

        predicted = matched_row["concept_code"]
        predicted_intent = matched_row["intent"]
        score = float(scores[0][0])

        exact_correct = predicted == expected
        intent_correct = predicted_intent == expected_intent
        high_similarity = score >= HIGH_SIMILARITY_THRESHOLD
        # The actual "is this basically fine" verdict: right concept, OR
        # wrong concept but same intent with a high enough score that the
        # model clearly understood what was being asked.
        blended_correct = exact_correct or (intent_correct and high_similarity)

        stats = results_by_language.setdefault(
            language,
            {"exact_correct": 0, "blended_correct": 0, "total": 0},
        )
        stats["total"] += 1
        if exact_correct:
            stats["exact_correct"] += 1
        if blended_correct:
            stats["blended_correct"] += 1

        if not blended_correct:
            print(
                f"  [{language}] WRONG: {query!r} "
                f"-> predicted {predicted} ({predicted_intent}), expected {expected} ({expected_intent}) "
                f"| score: {score:.4f}"
            )
        elif not exact_correct:
            print(
                f"  [{language}] CLOSE (same intent, high score): {query!r} "
                f"-> predicted {predicted}, expected {expected} | score: {score:.4f}"
            )

    print()
    print("=" * 60)
    print("MULTILINGUAL UNSEEN GENERALIZATION EVALUATION")
    print("=" * 60)

    total_exact = 0
    total_blended = 0
    total_count = 0

    for language, stats in results_by_language.items():
        total = stats["total"]
        exact_accuracy = stats["exact_correct"] / total
        blended_accuracy = stats["blended_correct"] / total

        print(f"{language:10s}: Exact={exact_accuracy:.2%} | Blended={blended_accuracy:.2%}")

        total_exact += stats["exact_correct"]
        total_blended += stats["blended_correct"]
        total_count += total

    print("-" * 60)
    print(f"{'overall':10s}: Exact={total_exact / total_count:.2%} | Blended={total_blended / total_count:.2%}")
    print("=" * 60)


if __name__ == "__main__":
    main()
