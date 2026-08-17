"""
add_conversational_concepts.py

Adds general-conversation concepts (self-introduction, wellbeing, gratitude,
farewell, politeness, affirmation, clarification) to the curated dataset,
deliberately out of scope of the two existing market intents (PRICE_INQUIRY,
GREETING). These are the "basic conversation... asking of name and all
that" phrases the app was missing - common exchanges that happen around a
market interaction but aren't themselves price negotiation.

Appends to datasets/curated/multilingual_phrases.csv (english only - the
twi/ga/ewe/french columns stay blank here and get filled by
translate_curated_dataset.py and populate_ga_column.py, both of which now
skip already-translated rows) and datasets/generated/paraphrases.csv.

Run:
    <path-to-venv>/python.exe dataset-tools/add_conversational_concepts.py
"""

import csv
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = Path(__file__).resolve().parents[1]
CURATED_DATASET = PROJECT_ROOT / "datasets" / "curated" / "multilingual_phrases.csv"
PARAPHRASES_DATASET = PROJECT_ROOT / "datasets" / "generated" / "paraphrases.csv"

DOMAIN = "Social"

# (concept_code, intent, english, [paraphrases...])
NEW_CONCEPTS = [
    # SELF_INTRODUCTION
    ("INTRO_001", "SELF_INTRODUCTION", "What is your name?", [
        "What's your name?", "May I know your name?", "Can you tell me your name?",
    ]),
    ("INTRO_002", "SELF_INTRODUCTION", "My name is Kofi.", [
        "My name's Kofi.", "I am called Kofi.", "They call me Kofi.",
    ]),
    ("INTRO_003", "SELF_INTRODUCTION", "Nice to meet you.", [
        "Pleased to meet you.", "It's nice to meet you.", "Good to meet you.",
    ]),
    ("INTRO_004", "SELF_INTRODUCTION", "Where are you from?", [
        "Where do you come from?", "Which place are you from?", "Where is home for you?",
    ]),
    ("INTRO_005", "SELF_INTRODUCTION", "I am from Accra.", [
        "I'm from Accra.", "I come from Accra.", "My home is Accra.",
    ]),
    ("INTRO_006", "SELF_INTRODUCTION", "What do you do for work?", [
        "What is your job?", "What kind of work do you do?", "What do you do for a living?",
    ]),
    ("INTRO_007", "SELF_INTRODUCTION", "I am a trader.", [
        "I'm a trader.", "I work as a trader.", "I sell goods for a living.",
    ]),
    ("INTRO_008", "SELF_INTRODUCTION", "How old are you?", [
        "What is your age?", "May I ask your age?", "How many years old are you?",
    ]),
    # WELLBEING_CHECK
    ("WELLBEING_001", "WELLBEING_CHECK", "How are you?", [
        "How are you doing?", "How's it going?", "How have you been?",
    ]),
    ("WELLBEING_002", "WELLBEING_CHECK", "I am fine, thank you.", [
        "I'm fine, thank you.", "I'm doing fine, thanks.", "I am good, thank you.",
    ]),
    ("WELLBEING_003", "WELLBEING_CHECK", "And you?", [
        "How about you?", "What about you?", "And how are you?",
    ]),
    ("WELLBEING_004", "WELLBEING_CHECK", "I am doing well.", [
        "I'm doing well.", "Things are going well for me.", "I am well.",
    ]),
    ("WELLBEING_005", "WELLBEING_CHECK", "How is your family?", [
        "How is your family doing?", "How are your people?", "Is your family well?",
    ]),
    ("WELLBEING_006", "WELLBEING_CHECK", "I am a little tired today.", [
        "I'm a bit tired today.", "I feel tired today.", "I'm feeling worn out today.",
    ]),
    ("WELLBEING_007", "WELLBEING_CHECK", "I am very happy today.", [
        "I'm very happy today.", "I feel great today.", "Today is a good day for me.",
    ]),
    ("WELLBEING_008", "WELLBEING_CHECK", "Not too bad.", [
        "Not bad at all.", "Could be worse.", "I'm managing.",
    ]),
    # GRATITUDE
    ("THANKS_001", "GRATITUDE", "Thank you.", [
        "Thanks.", "Thank you so much.", "I thank you.",
    ]),
    ("THANKS_002", "GRATITUDE", "Thank you very much.", [
        "Thank you so much.", "Many thanks.", "I really thank you.",
    ]),
    ("THANKS_003", "GRATITUDE", "You're welcome.", [
        "You are welcome.", "It's my pleasure.", "No problem at all.",
    ]),
    ("THANKS_004", "GRATITUDE", "I really appreciate it.", [
        "I truly appreciate that.", "I appreciate it a lot.", "That means a lot to me.",
    ]),
    ("THANKS_005", "GRATITUDE", "Thanks for your help.", [
        "Thank you for helping me.", "Thanks for helping me out.", "I appreciate your help.",
    ]),
    ("THANKS_006", "GRATITUDE", "No problem.", [
        "It's no trouble.", "Don't worry about it.", "No worries at all.",
    ]),
    # FAREWELL
    ("FAREWELL_001", "FAREWELL", "Goodbye.", [
        "Bye.", "Goodbye for now.", "Farewell.",
    ]),
    ("FAREWELL_002", "FAREWELL", "See you later.", [
        "See you soon.", "Catch you later.", "I'll see you later.",
    ]),
    ("FAREWELL_003", "FAREWELL", "Take care.", [
        "Take care of yourself.", "Look after yourself.", "Stay safe.",
    ]),
    ("FAREWELL_004", "FAREWELL", "See you tomorrow.", [
        "I'll see you tomorrow.", "Until tomorrow.", "See you again tomorrow.",
    ]),
    ("FAREWELL_005", "FAREWELL", "Have a good day.", [
        "Have a nice day.", "Enjoy your day.", "Have a great day.",
    ]),
    ("FAREWELL_006", "FAREWELL", "Safe travels.", [
        "Travel safely.", "Have a safe journey.", "Safe journey home.",
    ]),
    # POLITENESS
    ("POLITE_001", "POLITENESS", "I'm sorry.", [
        "I am sorry.", "My apologies.", "I apologize.",
    ]),
    ("POLITE_002", "POLITENESS", "Excuse me.", [
        "Pardon me.", "Excuse me, please.", "Sorry, excuse me.",
    ]),
    ("POLITE_003", "POLITENESS", "Please.", [
        "Please, if you don't mind.", "If you please.", "Kindly.",
    ]),
    ("POLITE_004", "POLITENESS", "Please help me.", [
        "Can you please help me?", "Please, help me out.", "I need your help, please.",
    ]),
    ("POLITE_005", "POLITENESS", "Sorry to bother you.", [
        "Sorry for the trouble.", "Sorry to disturb you.", "I don't mean to bother you.",
    ]),
    ("POLITE_006", "POLITENESS", "It's okay, no worries.", [
        "It's fine, don't worry.", "That's alright.", "No worries, it's fine.",
    ]),
    # AFFIRMATION
    ("AFFIRM_001", "AFFIRMATION", "Yes.", [
        "Yes, that's right.", "Yes, correct.", "Yeah.",
    ]),
    ("AFFIRM_002", "AFFIRMATION", "No.", [
        "No, that's not right.", "No, not that.", "Nope.",
    ]),
    ("AFFIRM_003", "AFFIRMATION", "Maybe.", [
        "Perhaps.", "Maybe so.", "Possibly.",
    ]),
    # CLARIFICATION
    ("CLARIFY_001", "CLARIFICATION", "I understand.", [
        "I get it.", "I understand you.", "Okay, I understand.",
    ]),
    ("CLARIFY_002", "CLARIFICATION", "I don't understand.", [
        "I don't get it.", "I do not understand you.", "Sorry, I don't understand.",
    ]),
    ("CLARIFY_003", "CLARIFICATION", "Could you repeat that, please?", [
        "Can you say that again?", "Please repeat that.", "Could you say that one more time?",
    ]),
    ("CLARIFY_004", "CLARIFICATION", "Can you speak slowly, please?", [
        "Please speak more slowly.", "Could you slow down, please?", "Speak slowly, please.",
    ]),
    ("CLARIFY_005", "CLARIFICATION", "I don't speak the language well.", [
        "I don't speak it very well.", "My understanding of the language is limited.", "I'm still learning the language.",
    ]),
]


def append_curated_rows():
    with open(CURATED_DATASET, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fieldnames = reader.fieldnames

    existing_codes = {row["concept_code"] for row in rows}
    next_id = max(int(row["id"]) for row in rows) + 1

    added = 0
    for concept_code, intent, english, _paraphrases in NEW_CONCEPTS:
        if concept_code in existing_codes:
            print(f"  SKIP (already exists): {concept_code}")
            continue

        rows.append({
            "id": str(next_id),
            "concept_code": concept_code,
            "domain": DOMAIN,
            "intent": intent,
            "english": english,
            "twi": "",
            "ga": "",
            "ewe": "",
            "french": "",
            "notes": "",
            "verification_status": "",
        })
        next_id += 1
        added += 1

    with open(CURATED_DATASET, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Added {added} new concepts to {CURATED_DATASET} ({len(rows)} total).")


def append_paraphrase_rows():
    with open(PARAPHRASES_DATASET, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fieldnames = reader.fieldnames

    existing = {(row["concept_code"], row["paraphrase"]) for row in rows}

    added = 0
    for concept_code, _intent, _english, paraphrases in NEW_CONCEPTS:
        for paraphrase in paraphrases:
            key = (concept_code, paraphrase)
            if key in existing:
                continue
            rows.append({"concept_code": concept_code, "language": "English", "paraphrase": paraphrase})
            existing.add(key)
            added += 1

    with open(PARAPHRASES_DATASET, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Added {added} new paraphrases to {PARAPHRASES_DATASET} ({len(rows)} total).")


def main():
    append_curated_rows()
    append_paraphrase_rows()


if __name__ == "__main__":
    main()
