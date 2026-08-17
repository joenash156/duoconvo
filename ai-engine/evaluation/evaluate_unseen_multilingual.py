"""
evaluate_unseen_multilingual.py
"""

import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

AI_ENGINE_DIR = Path(__file__).resolve().parents[1]
if str(AI_ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_ENGINE_DIR))

import faiss
import pandas as pd
from config import INDEX_PATH, METADATA_PATH, MODEL_OUTPUT_DIR
from sentence_transformers import SentenceTransformer

TEST_PATH = Path(__file__).resolve().parent / "unseen_test_multilingual.csv"


def main():
    model = SentenceTransformer(str(MODEL_OUTPUT_DIR))
    index = faiss.read_index(str(INDEX_PATH))
    metadata = pd.read_csv(METADATA_PATH)
    test_data = pd.read_csv(TEST_PATH)

    results_by_language = {}

    for _, row in test_data.iterrows():
        language = row["language"]
        query = row["text"]
        expected = row["concept_code"]

        embedding = model.encode([query], convert_to_numpy=True).astype("float32")
        faiss.normalize_L2(embedding)

        scores, indices = index.search(embedding, k=1)
        predicted = metadata.iloc[indices[0][0]]["concept_code"]
        is_correct = predicted == expected

        results_by_language.setdefault(language, {"correct": 0, "total": 0})
        results_by_language[language]["total"] += 1
        if is_correct:
            results_by_language[language]["correct"] += 1
        else:
            print(f"  [{language}] WRONG: {query!r} -> predicted {predicted}, expected {expected} (score {scores[0][0]:.4f})")

    print()
    print("=" * 60)
    print("MULTILINGUAL UNSEEN GENERALIZATION EVALUATION")
    print("=" * 60)

    total_correct = 0
    total_count = 0

    for language, stats in results_by_language.items():
        accuracy = stats["correct"] / stats["total"]
        print(f"{language:10s}: {stats['correct']}/{stats['total']} ({accuracy:.2%})")
        total_correct += stats["correct"]
        total_count += stats["total"]

    print("-" * 60)
    print(f"{'overall':10s}: {total_correct}/{total_count} ({total_correct / total_count:.2%})")
    print("=" * 60)


if __name__ == "__main__":
    main()
