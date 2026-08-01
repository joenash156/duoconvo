"""
DuoConvo AI Configuration

This file contains all configurable settings used throughout
the AI training and inference pipeline.
Stores all project settings in one place so that the rest of the project doesn't contain hardcoded values.
"""

from pathlib import Path

# Project Paths
PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASETS_DIR = PROJECT_ROOT / "datasets"
CURATED_DATASET = DATASETS_DIR / "curated" / "multilingual_phrases.csv"
PARAPHRASES_DATASET = DATASETS_DIR / "generated" / "paraphrases.csv"
SENTENCE_PAIRS_DATASET = DATASETS_DIR / "generated" / "sentence_pairs.csv"
MODEL_DIR = PROJECT_ROOT / "ai-engine" / "models"
VECTOR_DB_DIR = PROJECT_ROOT / "ai-engine" / "vector-db"

# Base Model
BASE_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

# Training Hyperparameters
BATCH_SIZE = 16
EPOCHS = 4
LEARNING_RATE = 2e-5
WARMUP_RATIO = 0.1
MAX_SEQ_LENGTH = 128
RANDOM_STATE = 42

# Retrieval
TOP_K = 5
CONFIDENCE_THRESHOLD = 0.85

# Output Files
TRAINED_MODEL_PATH = MODEL_DIR / "duoconvo-model"
FAISS_INDEX_PATH = VECTOR_DB_DIR / "duoconvo.index"