DuoConvo Database Design Specification for ER Diagram
Overview
The database for DuoConvo is designed to support the application's runtime functionality rather than the model training process. The Artificial Intelligence model is trained separately using curated datasets stored within the project's datasets directory. After training, the final model is deployed together with a FAISS vector index and a MySQL database.
The MySQL database is therefore responsible for storing validated multilingual phrases, application logs, and supporting information that the backend requires during inference. It is not intended to store the training dataset used during model development.
The database should therefore contain the following entities.

Entity 1: Intents
The Intents entity stores the communication categories used throughout the system. Although the application no longer predicts intents during runtime, intents remain important because they organise the multilingual phrases into logical groups and assist in dataset management, evaluation, reporting, and future expansion.
Each intent represents a single communication purpose.
Examples include:
Greeting
Price Inquiry
Negotiation
Product Availability
Payment
Appreciation
Directions
Food Ordering
Attributes
id (Primary Key)
intent_name
description
Relationship
One intent can be associated with many market phrases.
This represents a One-to-Many (1:N) relationship between Intents and Market Phrases.

Entity 2: Market Phrases
The Market Phrases table is the core knowledge base of the application.
Each record represents one multilingual phrase containing translations in all supported languages. Every phrase has a unique database identifier which is also associated with its corresponding embedding inside the FAISS vector index.
During runtime, when the AI model generates an embedding for a user's sentence, FAISS performs semantic similarity search and returns the ID of the closest matching phrase. The backend then queries this table using that ID to retrieve the multilingual translations.
This table therefore acts as the bridge between semantic retrieval and the translated response presented to the user.
Attributes
id (Primary Key)
english_text
twi_text
ga_text
ewe_text
french_text
intent_id (Foreign Key)
is_active
created_at
updated_at
Relationship
Each market phrase belongs to exactly one intent.
One intent can contain many market phrases.
This forms a Many-to-One (N:1) relationship from Market Phrases to Intents.

Entity 3: Conversation Logs
The Conversation Logs entity stores the history of translations performed by the application.
This table serves as the application's audit trail and demonstration evidence. It allows users and lecturers to verify whether a translation originated from DuoConvo's trained AI model or from the external LLM fallback.
Every translation request should create a log entry.
Information stored includes the original user input, the speech-to-text result, the phrase selected by the AI, the similarity score returned after semantic retrieval, the translation source, response time, and timestamp.
This table also powers the "AI Evidence Card" within the application.
Attributes
id (Primary Key)
input_text
speech_to_text_output
predicted_phrase_id (Foreign Key referencing Market Phrases)
similarity_score
translation_source
response_time_ms
created_at
Relationship
One market phrase can appear in many conversation logs.
Each conversation log references one market phrase.
This forms a One-to-Many (1:N) relationship between Market Phrases and Conversation Logs.

Entity 4: Unknown Phrases
The Unknown Phrases entity stores user inputs that the AI model could not confidently match to any phrase in the knowledge base.
Whenever the semantic similarity score falls below the configured confidence threshold, the application invokes the external LLM fallback. At the same time, the original user sentence is stored in this table for later human review.
Approved phrases can subsequently be added to the training dataset and included during future model retraining. This supports a controlled continuous-learning workflow while ensuring that new knowledge is verified by humans before becoming part of the AI model.
Attributes
id (Primary Key)
input_text
language
similarity_score
status
created_at
Relationship
This entity is independent and does not require a mandatory foreign key relationship with the other tables.

Entity 5: Model Versions
The Model Versions entity stores metadata describing every AI model deployed within DuoConvo.
Although the application normally uses only one active model, maintaining version information allows future comparison between different training runs, datasets, and evaluation results. It also improves reproducibility during demonstrations and future development.
Attributes
id (Primary Key)
model_name
dataset_version
training_date
accuracy
notes
Relationship
This entity is independent and serves as administrative metadata for the deployed AI models.

Overall Relationships
The database contains the following relationships:
One Intent can be associated with Many Market Phrases.
Each Market Phrase belongs to One Intent.
One Market Phrase can appear in Many Conversation Logs.
Each Conversation Log references One Market Phrase.
Unknown Phrases is an independent table used to support future retraining after human review.
Model Versions is an independent table used to document deployed AI models.
The AI training dataset, sentence pairs, and other machine learning artefacts are intentionally not stored in the application database. They remain within the project's datasets/ directory and are used only during model development and fine-tuning. After training, the application uses only the trained Sentence Transformer model, the FAISS vector index, and this relational database during inference.
This separation keeps the system modular, reduces unnecessary data duplication, and reflects standard machine learning deployment practices.

