"""
train_model.py

Fine-tune DuoConvo Sentence Transformer
using sentence-transformers v5.
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
  SENTENCE_PAIRS_DATASET,
)
from sentence_transformers import SentenceTransformer
from sentence_transformers.sentence_transformer.losses import CosineSimilarityLoss
from sentence_transformers.sentence_transformer.trainer import (
  SentenceTransformerTrainer,
)
from sentence_transformers.sentence_transformer.training_args import (
  SentenceTransformerTrainingArguments,
)

from datasets import Dataset


def load_dataset():
  # load dataset from CSV
  df = pd.read_csv(SENTENCE_PAIRS_DATASET)
  
  # rename columns to match expected input for SentenceTransformerTrainer
  df = df.rename(
    columns={
      "sentence_a": "sentence1",
      "sentence_b": "sentence2",
      "label": "score",
    }
  )
  # make labels float type
  df["score"] = df["score"].astype(float)


  # convert to HuggingFace Dataset and return
  return Dataset.from_pandas(df)


def main():

  print("Loading model...")
  # load pre-trained model
  model = SentenceTransformer(BASE_MODEL)
  print("Loading dataset...")

  # load dataset
  train_dataset = load_dataset()
  
  # define loss function
  loss = CosineSimilarityLoss(model)
  
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
