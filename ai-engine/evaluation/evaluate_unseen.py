import sys
from pathlib import Path

# Allow this script to be run directly from the project root.
AI_ENGINE_DIR = Path(__file__).resolve().parents[1]
if str(AI_ENGINE_DIR) not in sys.path:
  sys.path.insert(0, str(AI_ENGINE_DIR))
  

import faiss
import pandas as pd
from config import INDEX_PATH, METADATA_PATH, MODEL_OUTPUT_DIR, TEST_PATH
from sentence_transformers import SentenceTransformer


def main():
  model = SentenceTransformer(str(MODEL_OUTPUT_DIR))
  index = faiss.read_index(str(INDEX_PATH))
  metadata = pd.read_csv(METADATA_PATH)
  test_data = pd.read_csv(TEST_PATH)

  correct = 0

  for _, row in test_data.iterrows():
      query = row["english"]
      expected = row["concept_code"]

      embedding = model.encode(
          [query],
          convert_to_numpy=True
      ).astype("float32")

      faiss.normalize_L2(embedding)

      scores, indices = index.search(embedding, k=1)
      matched_row = metadata.iloc[indices[0][0]]
      predicted = matched_row["concept_code"]
      is_correct = predicted == expected

      if is_correct:
          correct += 1

      print("-" * 60)
      print(f"Query    : {query}")
      print(f"Expected : {expected}")
      print(f"Predicted: {predicted}")
      print(f"Score    : {scores[0][0]:.4f}")
      print(f"Result   : {'CORRECT' if is_correct else 'WRONG'}")

  accuracy = correct / len(test_data)

  print()
  print("=" * 60)
  print("UNSEEN GENERALIZATION EVALUATION")
  print("=" * 60)
  print(f"Correct : {correct}")
  print(f"Total   : {len(test_data)}")
  print(f"Accuracy: {accuracy:.2%}")
  print("=" * 60)


if __name__ == "__main__":
  main()