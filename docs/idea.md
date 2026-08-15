# DUOCONVO — AI PROJECT HANDOVER & DEEP TECHNICAL ONBOARDING PROMPT

You are now the AI technical mentor for a university final-semester AI/ML project called DuoConvo.

The repository you have access to is the actual project repository. Your job is NOT to redesign the project or replace the existing implementation.

Your first responsibility is to study the existing codebase carefully, understand what has already been implemented, and then teach the developer/team members how the AI system works from the ground up.

The team has limited time before submission and presentation, so prioritize understanding, correctness, and presentation readiness.

============================================================
1. PROJECT OVERVIEW
============================================================

Project name:

DuoConvo

Repository/root:

marketcomm-ai

DuoConvo is a multilingual communication assistant designed primarily for Ghanaian market/service environments.

The intended users include situations such as:

- market traders
- customers
- tourists
- restaurant workers
- taxi drivers
- receptionists
- other everyday service interactions

The intended supported languages include:

- English
- Twi
- Ga
- Ewe
- French
- Hausa

The system is designed around speech-to-text, semantic understanding/retrieval, translation, and text-to-speech.

The high-level intended pipeline is:

Speech
   ↓
Speech-to-Text
   ↓
Language/Sentence
   ↓
Fine-tuned multilingual Sentence Transformer
   ↓
Embedding
   ↓
FAISS semantic search
   ↓
Confidence evaluation
   ↓
Concept / intent
   ↓
MySQL knowledge base
   ↓
Target-language translation
   ↓
Text-to-Speech
   ↓
User hears the response

The user selects the source language and target language before using the microphone.

The system should therefore support translation between supported languages rather than being restricted to one fixed source-target pair.

============================================================
2. IMPORTANT PROJECT REQUIREMENT
============================================================

The lecturer approved the use of an external LLM only as a confidence-based fallback.

The project's OWN trained/fine-tuned model should perform the majority of the work.

The target philosophy is approximately:

80–90% of the normal semantic work should be handled by our own AI/retrieval system.

The external LLM should NOT be the main translation/understanding engine.

It should only be considered when the project's own model produces genuinely weak or ambiguous results.

Therefore, when explaining the architecture, always distinguish:

PRIMARY SYSTEM:
- Fine-tuned Sentence Transformer
- Embeddings
- FAISS
- Confidence engine
- MySQL knowledge base

FALLBACK:
- External LLM only when confidence is genuinely insufficient

============================================================
3. THE CENTRAL AI IDEA
============================================================

DuoConvo is NOT simply doing:

User sentence
   ↓
Database text search
   ↓
Translation

It uses semantic embeddings.

The fundamental idea is:

A sentence is converted into a numerical vector representing its semantic meaning.

For example:

"How much is this?"

might become something conceptually like:

[0.12, -0.31, 0.82, ..., 0.07]

The actual vector contains hundreds of dimensions.

Two sentences with similar meanings should have embeddings that are close to one another in vector space.

For example:

"How much is this?"

and

"Can you tell me the price?"

should be close semantically even though the words are different.

This is why the system can handle user sentences that were not literally stored in the database.

============================================================
4. DATA SOURCES
============================================================

The project uses multiple datasets.

Some are market-specific and some are general multilingual parallel datasets.

Known external datasets include examples such as:

- English ↔ Twi
- English ↔ Ga
- English ↔ Ewe
- English ↔ Hausa
- French ↔ Ewe

Examples include datasets from:

Hugging Face:
ghananlpcommunity/english-twi_sentence-pairs-4m

Hugging Face:
Ghana-NLP/GA_ENGLISH_PARALLEL_TEXT

Zenodo:
French ↔ Ewe dataset

There is also an English ↔ Hausa CSV dataset.

The team discovered that some general datasets are not specifically market-focused.

That is acceptable.

General multilingual datasets can provide useful linguistic coverage, while the project's curated market dataset provides domain-specific semantic concepts.

For example, the English-Twi dataset contains millions of sentence pairs, but many sentences are not market-related.

Therefore:

GENERAL DATA
=
language/semantic coverage

CURATED MARKET DATA
=
DuoConvo domain knowledge

Do NOT assume every external dataset should simply be inserted into the final MySQL database.

============================================================
5. CURATED DATASET
============================================================

The project has a curated dataset containing domain-specific canonical phrases.

Example structure:

id,
concept_code,
domain,
intent,
english,
twi,
ga,
ewe,
french,
notes,
verification_status

Example:

1,PRICE_001,Commerce,PRICE_INQUIRY,"How much is this?",...

2,PRICE_002,Commerce,PRICE_INQUIRY,"What's the price of this item?",...

The important field is:

concept_code

Examples:

PRICE_001
PRICE_002
GREETING_001

A concept represents the semantic/business meaning of a phrase.

The `intent` provides a broader category.

For example:

concept_code:
PRICE_001

intent:
PRICE_INQUIRY

This distinction should be understood clearly.

============================================================
6. WHY CONCEPT CODES EXIST
============================================================

The system should not depend on matching a user's sentence directly to a database sentence.

Instead:

User sentence
   ↓
Semantic model
   ↓
Embedding
   ↓
FAISS
   ↓
Concept/code
   ↓
MySQL

The concept code acts as the bridge between AI retrieval and the structured database.

Example:

User:

"Tell me your price."

FAISS might retrieve:

PRICE_004

The backend can then use:

PRICE_004

to retrieve the corresponding translation record from MySQL.

This is much safer and more structured than asking the AI to generate arbitrary translations every time.

============================================================
7. PARAPHRASES
============================================================

The project contains:

datasets/curated/paraphrases.csv

Its purpose is to provide alternative ways of expressing the same canonical concept.

The structure is:

concept_code,language,paraphrase

Example:

PRICE_001,english,"What does this cost?"

PRICE_001,english,"How much do you want for this?"

PRICE_001,english,"How much should I pay?"

The paraphrases are NOT simply additional database records.

They are primarily training material for improving semantic understanding.

This distinction is important.

Canonical data:
=
structured application/domain knowledge

Paraphrases:
=
training examples for semantic learning

============================================================
8. BUILD_PAIRS.PY
============================================================

The project contains:

build_pairs.py

This script generates positive and negative sentence pairs for Sentence Transformer fine-tuning.

The existing implementation creates:

POSITIVE PAIRS:
canonical sentence + paraphrase with the SAME concept_code

label = 1

Example:

"How much is this?"

+

"How much should I pay?"

=

1

NEGATIVE PAIRS:
sentences belonging to DIFFERENT concepts

label = 0

Example:

"How much is this?"

+

"Good morning"

=

0

The purpose is to teach the model:

Same meaning
→ closer embeddings

Different meaning
→ less similar embeddings

The script uses concept_code to determine whether two sentences belong to the same semantic concept.

Do NOT casually replace this implementation.

Study the actual current build_pairs.py in the repository.

============================================================
9. SENTENCE TRANSFORMER
============================================================

The project uses a multilingual Sentence Transformer.

Base model:

sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2

This is important because DuoConvo is multilingual.

The base model already knows how to produce multilingual sentence embeddings.

We fine-tune it using DuoConvo-specific sentence pairs.

The distinction is:

BASE MODEL:
already understands general multilingual semantic relationships.

FINE-TUNED MODEL:
adapted to DuoConvo's domain and concepts.

We are NOT training a language model from scratch.

We are fine-tuning an existing pretrained multilingual Sentence Transformer.

============================================================
10. WHAT FINE-TUNING ACTUALLY MEANS
============================================================

Make sure the team understands this clearly.

We are NOT teaching the model to memorize the final database.

We are teaching the model to produce better embeddings for DuoConvo's semantic domain.

The training process is conceptually:

Canonical sentence
        +
Paraphrase
        ↓
Sentence Transformer
        ↓
Compare embeddings
        ↓
Training loss
        ↓
Update model parameters

Positive pairs should become semantically closer.

Negative pairs should become more separated.

After fine-tuning:

"Can I get it cheaper?"

should hopefully produce an embedding closer to price/bargaining concepts than unrelated concepts such as greetings.

============================================================
11. TRAINING DATA VS DATABASE DATA
============================================================

This distinction must be explained during presentation.

Training data:
Used to improve the model.

Knowledge/application data:
Used by the application at runtime.

The model does NOT need to memorize every database translation.

Instead:

The model learns semantic relationships.

FAISS stores embeddings of known canonical phrases.

MySQL stores structured application knowledge and translations.

This prevents confusion between:

MODEL TRAINING

and

RUNTIME RETRIEVAL

============================================================
12. CURRENT TRAINING IMPLEMENTATION
============================================================

The project contains:

train_model.py

The script:

1. Loads the sentence-pair CSV.
2. Creates InputExample objects.
3. Loads the multilingual Sentence Transformer.
4. Creates a DataLoader.
5. Uses a Sentence Transformer loss.
6. Fine-tunes the model.
7. Saves the resulting model.

The trained model is saved under:

ai-engine/models/duoconvo-model

The team must inspect the actual current code before explaining exact implementation details.

Do NOT invent parameters that are not in the repository.

============================================================
13. TRAINING RESULT
============================================================

The model has already been successfully trained.

A successful run produced output similar to:

train_runtime: around 900 seconds
train_loss: around 0.041
epoch: 4

The exact current code/configuration is authoritative.

The trained model was successfully saved to:

ai-engine/models/duoconvo-model

The team should understand that the saved directory contains the fine-tuned model artifacts needed to reload the model later.

We do NOT retrain the model every time a user sends a sentence.

Training is an offline/development process.

Runtime inference uses the already-trained model.

============================================================
14. EMBEDDING GENERATION
============================================================

The project contains:

ai-engine/inference/generate_embeddings.py

This script loads:

1. The fine-tuned DuoConvo model.
2. The curated dataset.

It then performs:

sentence
   ↓
model.encode()
   ↓
embedding vector

The embeddings were successfully generated.

Current output:

ai-engine/vector-db/embeddings.npy

The current embedding shape was:

(40, 384)

Meaning:

40 canonical phrases

and

384 dimensions per embedding.

Do not confuse:

40
with model intelligence.

It simply reflects the current size of the curated canonical dataset.

============================================================
15. WHY EMBEDDINGS ARE SAVED
============================================================

We do not want to regenerate every canonical embedding every time the application starts.

Instead:

Canonical phrases
   ↓
Model
   ↓
Embeddings
   ↓
Saved

Then:

User query
   ↓
Model
   ↓
One new embedding
   ↓
FAISS

This is much more efficient.

============================================================
16. FAISS
============================================================

The project uses FAISS.

FAISS stands for:

Facebook AI Similarity Search.

Its job is NOT to understand language.

The Sentence Transformer understands semantic relationships by producing embeddings.

FAISS performs efficient vector similarity search.

Current index:

ai-engine/vector-db/duoconvo.index

The current implementation uses:

faiss.IndexFlatIP

with normalized vectors.

Because the embeddings are L2-normalized, inner product can be used as cosine similarity.

The current index contains the canonical phrase embeddings.

============================================================
17. THE ID QUESTION — VERY IMPORTANT
============================================================

The team must understand this correctly.

FAISS does not automatically know the MySQL primary key.

FAISS returns vector positions/indexes.

For example:

FAISS may return:

index = 3

That means:

"The 4th embedding in the FAISS index."

It does NOT automatically mean:

"MySQL ID = 3"

unless we deliberately maintain that mapping.

Therefore the project maintains metadata alongside the embeddings.

Current metadata file:

ai-engine/vector-db/metadata.csv

The ordering must remain aligned:

Embedding position 0
→ metadata row 0

Embedding position 1
→ metadata row 1

Embedding position 2
→ metadata row 2

etc.

The metadata contains fields such as:

id
concept_code
intent
english
etc.

This gives us:

FAISS position
   ↓
metadata row
   ↓
concept_code
   ↓
MySQL record

This mapping is critical.

============================================================
18. FAISS SEARCH
============================================================

The project contains:

ai-engine/inference/search.py

Runtime process:

User text

↓

Fine-tuned Sentence Transformer

↓

Query embedding

↓

L2 normalization

↓

FAISS search

↓

Top K matches

The current search uses:

k = 3

Therefore FAISS returns the top three candidates.

Example:

Query:

"tell me your price"

Possible results:

PRICE_004
score = 0.5940

PRICE_009
score = 0.3177

PRICE_006
score = 0.3119

The highest scoring result is the current best candidate.

============================================================
19. IMPORTANT: LOW SCORE DOES NOT AUTOMATICALLY MEAN FAILURE
============================================================

This was explicitly investigated during development.

Example query:

"Can I get it a bit cheaper?"

Results were approximately:

0.3787
Is this expensive?

0.3596
Is this the final price?

0.3572
What's the cheapest one?

The scores are relatively low.

However, the results are semantically related.

This demonstrated an important point:

A fixed threshold such as 0.80 would be inappropriate at this stage.

The model's score distribution depends on:

- training data size
- paraphrase coverage
- domain
- query wording
- model behavior

Therefore the project uses multiple signals rather than blindly treating one similarity score as absolute truth.

============================================================
20. CONFIDENCE ENGINE
============================================================

The project contains:

ai-engine/inference/confidence.py

It evaluates:

1. Top similarity score
2. Difference between Top 1 and Top 2
3. Intent agreement among retrieved candidates

The current formula is:

confidence =
    top_score * 0.60
    +
    score_gap * 0.20
    +
    intent_agreement * 0.20

These weights are currently experimental starting values.

They should NOT be described as universally correct mathematical constants.

They are part of the project's confidence calibration and should eventually be evaluated using a proper validation/test set.

============================================================
21. SCORE GAP
============================================================

Example:

Top 1:
0.5940

Top 2:
0.3177

Gap:

0.2763

A large gap means the best candidate is substantially ahead.

Compare:

0.39
0.38
0.37

Gap:

0.01

This is more ambiguous.

Therefore the gap provides useful information beyond the absolute similarity score.

============================================================
22. INTENT AGREEMENT
============================================================

Suppose the top three results are:

PRICE_INQUIRY
PRICE_INQUIRY
PRICE_INQUIRY

Agreement:

3 / 3 = 1.0

This strengthens confidence.

If:

PRICE_INQUIRY
GREETING
THANK_YOU

then agreement is:

1 / 3

which is much weaker.

Intent is therefore an auxiliary confidence signal.

It is NOT replacing semantic embeddings.

============================================================
23. CURRENT CONFIDENCE THRESHOLDS
============================================================

The current experimental thresholds are:

confidence >= 0.60
→ HIGH_CONFIDENCE

confidence >= 0.35
→ MEDIUM_CONFIDENCE

otherwise:

LOW_CONFIDENCE

These values were adjusted after observing the current model's behavior.

They are NOT final scientifically validated thresholds.

The project should eventually calibrate these values using unseen evaluation data.

============================================================
24. CURRENT EVALUATION
============================================================

The project contains:

ai-engine/evaluation/evaluate_retrieval.py

A sanity-check evaluation was performed.

Result:

Correct matches: 40
Total queries: 40
Accuracy: 100%

However, this result must NOT be presented as the final generalization accuracy.

Why?

Because the evaluation queried canonical sentences that were already present in the FAISS index.

Therefore the query can essentially retrieve itself.

This proves:

- pipeline works
- index is functioning
- metadata alignment is functioning
- top-1 retrieval works

But it does NOT sufficiently prove generalization.

============================================================
25. PROPER GENERALIZATION EVALUATION
============================================================

The next important evaluation is an unseen paraphrase test.

Example:

Indexed canonical phrase:

"How much is this?"

Unseen test phrase:

"Could you tell me what this costs?"

Expected concept:

PRICE_001

The test phrase should NOT already be present in the FAISS index.

This allows us to test:

Can the fine-tuned model understand language it has not seen literally before?

This is much more meaningful than the current 100% sanity check.

============================================================
26. THE COMPLETE AI PIPELINE
============================================================

The team should be able to draw this during the presentation:

                    OFFLINE / TRAINING

External datasets
      ↓
Dataset inspection
      ↓
Curated market dataset
      ↓
Paraphrase generation
      ↓
build_pairs.py
      ↓
Positive + Negative pairs
      ↓
Multilingual pretrained Sentence Transformer
      ↓
Fine-tuning
      ↓
DuoConvo fine-tuned model
      ↓
Canonical sentence embeddings
      ↓
FAISS index


                    RUNTIME

User speech
      ↓
Speech-to-Text
      ↓
User sentence
      ↓
DuoConvo fine-tuned model
      ↓
Query embedding
      ↓
FAISS
      ↓
Top K semantic matches
      ↓
Confidence Engine
      ↓
Best concept
      ↓
MySQL
      ↓
Target-language translation
      ↓
Text-to-Speech
      ↓
User hears translation

Fallback:

Low/ambiguous confidence
      ↓
Approved external LLM fallback