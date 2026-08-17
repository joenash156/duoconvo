"""
train_model.py

Fine-tune DuoConvo Sentence Transformer using sentence-transformers v5.

Uses MultipleNegativesRankingLoss (MNRL) on anchor/positive pairs, not
CosineSimilarityLoss on labeled pairs (the original recipe, still built by
build_pairs.py as sentence_pairs.csv for comparison). Two prior experiments
both regressed accuracy with CosineSimilarityLoss (hard-negative mining;
then a full multilingual retrain that dropped English 68.42%->57.89% and
left Twi/Ewe at ~10%) - MNRL is the standard loss for retrieval-style
sentence embeddings and was never actually tried before.

Uses the *symmetric* variant (query_to_doc + doc_to_query, computed per
direction) rather than the default query-only direction. The curated
cross-lingual pairs are always built as (english, translation) - under the
default asymmetric MNRL, only the "given an English query, find the right
translation" direction gets trained; "given a Twi/Ga/Ewe query, find the
right English concept" (i.e. local-language-to-English retrieval, reported
as noticeably weaker in practice) is exactly the direction the asymmetric
loss does NOT explicitly train. The symmetric variant trains both.
"""

# Allow this script to be run directly from the project root.
import sys
from pathlib import Path

AI_ENGINE_DIR = Path(__file__).resolve().parents[1]
if str(AI_ENGINE_DIR) not in sys.path:
  sys.path.insert(0, str(AI_ENGINE_DIR))

# import necessary libraries
import pandas as pd
from config import (
  BASE_MODEL,
  BATCH_SIZE,
  EPOCHS,
  MODEL_OUTPUT_DIR,
  SENTENCE_PAIRS_MNRL_DATASET,
)
from sentence_transformers import SentenceTransformer
from sentence_transformers.sentence_transformer.losses import MultipleNegativesRankingLoss
from sentence_transformers.sentence_transformer.trainer import (
  SentenceTransformerTrainer,
)
from sentence_transformers.sentence_transformer.training_args import (
  BatchSamplers,
  SentenceTransformerTrainingArguments,
)

from datasets import Dataset


def load_dataset():
  # load the anchor/positive-only dataset (no labels - MNRL uses in-batch
  # negatives instead of explicit negative pairs)
  df = pd.read_csv(SENTENCE_PAIRS_MNRL_DATASET)

  # convert to HuggingFace Dataset and return
  return Dataset.from_pandas(df)


def main():

  print("Loading model...")
  # load pre-trained model
  model = SentenceTransformer(BASE_MODEL)
  print("Loading dataset...")

  # load dataset
  train_dataset = load_dataset()

  # symmetric: train both english->translation and translation->english
  # retrieval directions (see module docstring) - the asymmetric default
  # only trains the former.
  loss = MultipleNegativesRankingLoss(
    model,
    directions=("query_to_doc", "doc_to_query"),
    partition_mode="per_direction",
  )

  # define training arguments
  args = SentenceTransformerTrainingArguments(
    output_dir=str(MODEL_OUTPUT_DIR),
    num_train_epochs=EPOCHS,
    per_device_train_batch_size=BATCH_SIZE,
    learning_rate=2e-5,
    warmup_ratio=0.1,
    fp16=False,
    bf16=False,
    logging_steps=10,
    # Recommended for MultipleNegativesRankingLoss - ensures no in-batch
    # negative is accidentally a duplicate of the anchor/positive, which
    # would give the model a false "negative" that's actually correct.
    batch_sampler=BatchSamplers.NO_DUPLICATES,
    # "no", not "epoch" - main() already calls model.save() with the final
    # weights below. Per-epoch checkpoints aren't used for anything in this
    # workflow (no training resumption, no mid-training eval) and previously
    # accumulated to 20+GB of unused ~1.4GB checkpoints per training run.
    save_strategy="no",
    eval_strategy="no",
  )

  # define trainer
  trainer = SentenceTransformerTrainer(
    model=model,
    args=args,
    train_dataset=train_dataset,
    loss=loss,
  )

  print("Training...")
  
  # train the model
  trainer.train()

  print("Saving model...")
  
  # save the model
  print(f"Saving model to: {MODEL_OUTPUT_DIR.resolve()}")
  MODEL_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
  model.save(str(MODEL_OUTPUT_DIR))

  print("Done.")


if __name__ == "__main__":
  main()
