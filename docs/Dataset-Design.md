# Dataset Design Document

## Project

**DuoConvo – AI-Powered Multilingual Market Communication Assistant**

---

# 1. Purpose

The purpose of the DuoConvo dataset is to train a multilingual semantic retrieval model capable of understanding common conversations in Ghanaian markets and service environments.

Unlike traditional phrasebook applications, DuoConvo does not rely on exact sentence matching. Instead, the AI learns semantic relationships between sentences so that it can recognise different ways of expressing the same meaning.

For example:

* "How much is this?"
* "What's the price?"
* "Can you tell me how much this costs?"

Although these sentences use different words, they communicate the same intent. The model should therefore generate similar embeddings for them.

---

# 2. Dataset Objectives

The dataset should enable the AI model to:

* Learn semantic similarity between related sentences.
* Generalise to unseen user inputs.
* Support multilingual translation retrieval.
* Understand common Ghanaian market conversations.
* Reduce dependence on external LLMs.

---

# 3. Supported Languages

The initial version of DuoConvo supports five languages:

* English
* Twi
* Ga
* Ewe
* French

Future versions may introduce additional Ghanaian languages.

---

# 4. Dataset Structure

The project uses several datasets during development.

## 4.1 Raw Dataset

Location:

```text
datasets/raw/
```

Purpose:

Contains phrases collected from interviews, online resources, public datasets and manual entry before cleaning.

---

## 4.2 Curated Dataset

Location:

```text
datasets/curated/
```

Purpose:

Contains validated multilingual phrases that have been reviewed for correctness.

This becomes the primary dataset used for importing into the application database and generating semantic embeddings.

Recommended columns:

* id
* english
* twi
* ga
* ewe
* french
* intent

---

## 4.3 Generated Dataset

Location:

```text
datasets/generated/
```

Purpose:

Contains automatically or manually generated paraphrases and sentence pairs used during model training.

Examples include:

* Semantic paraphrases
* Positive sentence pairs
* Negative sentence pairs

---

## 4.4 Public Dataset

Location:

```text
datasets/public/
```

Purpose:

Stores publicly available datasets collected from research papers, GitHub repositories, Kaggle and other open sources.

These datasets should always be reviewed before inclusion in the curated dataset.

---

# 5. Intent Categories

Every phrase should belong to one communication category.

Initial categories include:

* Greeting
* Farewell
* Price Inquiry
* Negotiation
* Product Availability
* Quantity Request
* Payment
* Appreciation
* Directions
* Food Ordering
* Service Request
* Confirmation
* Clarification
* Emergency
* General Conversation

Additional categories may be introduced as the dataset grows.

---

# 6. Data Collection Sources

The dataset will be created using multiple sources.

## Manual Collection

Team members will write realistic market conversations based on everyday experiences.

---

## Native Speaker Validation

Native speakers of Twi, Ga, Ewe and French will verify translations to improve linguistic quality.

---

## Public Resources

Open multilingual datasets may be incorporated where licences permit.

Examples include:

* Kaggle
* GitHub
* Research publications
* Open language resources

---

## AI-Assisted Generation

Large Language Models may be used only to generate candidate paraphrases or translations.

Every generated example must be reviewed by a human before being added to the curated dataset.

---

# 7. Data Quality Guidelines

Every dataset entry should satisfy the following requirements:

* Grammatically correct.
* Natural wording.
* Appropriate for Ghanaian markets.
* Accurate translation across all supported languages.
* No duplicate records.
* Consistent spelling.
* Consistent punctuation.

---

# 8. Paraphrase Strategy

The AI should learn semantic meaning rather than exact wording.

Each important sentence should therefore have multiple paraphrases.

Example:

Original:

How much is this?

Possible paraphrases:

* What's the price?
* How much does it cost?
* Can I know the cost?
* What's your price?
* Tell me the price.

These paraphrases should share similar semantic meaning while varying their wording.

---

# 9. Training Pair Generation

Sentence pairs will be generated for supervised fine-tuning.

Positive pairs represent sentences with similar meanings.

Example:

Sentence A:

How much is this?

Sentence B:

What's the price?

Label:

1

Negative pairs represent unrelated meanings.

Example:

Sentence A:

Good morning.

Sentence B:

Can you reduce the price?

Label:

0

These labelled sentence pairs form the training data for the semantic similarity model.

---

# 10. Dataset Split

The dataset should be divided into three subsets.

Training Set:

70%

Validation Set:

15%

Testing Set:

15%

The testing dataset must contain examples that are not used during training.

---

# 11. Human Review

Unknown user inputs should never become training data automatically.

Instead, the workflow is:

Unknown Phrase

↓

Human Review

↓

Approved

↓

Added to Curated Dataset

↓

Model Retraining

This ensures the knowledge base grows while maintaining translation quality.

---

# 12. Expected Outcome

The final dataset should allow the fine-tuned Sentence Transformer to produce embeddings that accurately represent the semantic meaning of Ghanaian market conversations.

These embeddings will later be indexed using FAISS, allowing DuoConvo to retrieve the correct multilingual phrase from the application's knowledge base with high confidence.
