"""
filter_conversational_phrases.py

Same word-boundary keyword-filtering approach as filter_market_phrases.py,
but for the new general-conversation intents (self-introduction, wellbeing,
gratitude, farewell, politeness, affirmation, clarification) instead of
market/commerce ones. Used to pull relevant rows out of the large general
Twi/Ga/Ewe parallel corpora (dataset-tools/build_{twi,ga,ewe}_pairs.py),
same way filter_market_phrases.py's keyword list feeds
filter_general_pairs.py for the market side.

Deliberately excludes very common short words ("yes", "no", "ok") that
would match almost any sentence and defeat the point of filtering - the
curated concepts already cover those directly (see
add_conversational_concepts.py); this filter's job is pulling in *topically
conversational* sentences from generic corpora, not exhaustively matching
every affirmation.
"""

import re

CONVERSATIONAL_KEYWORDS = [
  "name", "names", "named",
  "hello", "hi there",
  "morning", "afternoon", "evening",
  "greet", "greets", "greeting", "greetings",
  "thank", "thanks", "thankful", "grateful",
  "welcome",
  "sorry", "apolog", "excuse me", "pardon",
  "please",
  "goodbye", "bye", "farewell", "see you",
  "how are you", "fine, thank", "i am fine", "i'm fine", "doing well",
  "understand", "understood", "misunderstand",
  "repeat", "slowly", "again please",
  "nice to meet", "meet you", "pleased to meet",
  "my name is", "your name",
  "where are you from", "i am from", "i come from",
  "family",
  "friend", "friends",
  "take care", "safe travels", "safe journey",
]

CONVERSATIONAL_KEYWORD_PATTERN = re.compile(
  r"\b(" + "|".join(re.escape(keyword) for keyword in CONVERSATIONAL_KEYWORDS) + r")\b",
  re.IGNORECASE,
)


def is_conversational_sentence(sentence):
  return bool(CONVERSATIONAL_KEYWORD_PATTERN.search(str(sentence)))


def filter_dataset(df, text_column="english"):
  return df[df[text_column].apply(is_conversational_sentence)]
