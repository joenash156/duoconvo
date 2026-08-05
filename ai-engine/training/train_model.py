"""
train_model.py

Fine-tune DuoConvo Sentence Transformer
using sentence-transformers v5.
"""

# import necessary libraries
import pandas as pd
from config import (
  BASE_MODEL,
  BATCH_SIZE,
  EPOCHS,
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

OUTPUT_MODEL_PATH = "../models/duoconvo-model"


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
    output_dir=OUTPUT_MODEL_PATH,
    num_train_epochs=EPOCHS,
    per_device_train_batch_size=BATCH_SIZE,
    learning_rate=2e-5,
    warmup_ratio=0.1,
    fp16=False,
    bf16=False,
    logging_steps=10,
    save_strategy="epoch",
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
  model.save(OUTPUT_MODEL_PATH)

  print("Done.")


if __name__ == "__main__":
  main()
