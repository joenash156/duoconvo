/**
 * Placeholder knowledge base used only while AI_PROVIDER=mock (see
 * services/ai.service.ts) and to seed the database (see db/seed.ts).
 *
 * Concept codes and intents follow docs/Intent-Catalog.md and
 * datasets/curated/multilingual_phrases.csv. Only "english" is populated
 * here, mirroring the current state of that CSV (translations are still
 * being verified by the team) - translateAudio/translateText fall back to
 * the LLM fallback service whenever a matched concept has no verified
 * translation for the requested target language.
 *
 * Replace this file's role entirely by setting AI_PROVIDER=http once the
 * real Sentence Transformer + FAISS pipeline is wrapped in an HTTP service.
 */

export type MockConcept = {
  conceptCode: string;
  intentName: string;
  intentDescription: string;
  english: string;
  keywords: string[];
};

export const MOCK_KNOWLEDGE_BASE: MockConcept[] = [
  // Greeting
  {
    conceptCode: "GREETING_001",
    intentName: "GREETING",
    intentDescription: "Opening a conversation.",
    english: "Good morning",
    keywords: ["good", "morning", "hello", "hi"],
  },
  {
    conceptCode: "GREETING_002",
    intentName: "GREETING",
    intentDescription: "Opening a conversation.",
    english: "How are you?",
    keywords: ["how", "are", "you"],
  },

  // Price Inquiry
  {
    conceptCode: "PRICE_001",
    intentName: "PRICE_INQUIRY",
    intentDescription: "Asking about the price of an item.",
    english: "How much is this?",
    keywords: ["how", "much", "price", "cost"],
  },
  {
    conceptCode: "PRICE_002",
    intentName: "PRICE_INQUIRY",
    intentDescription: "Asking about the price of an item.",
    english: "What's the price of this item?",
    keywords: ["price", "item", "what"],
  },

  // Negotiation
  {
    conceptCode: "NEGOTIATION_001",
    intentName: "NEGOTIATION",
    intentDescription: "Requesting a discount or negotiating a better price.",
    english: "Can you reduce the price?",
    keywords: ["reduce", "discount", "cheaper", "lower"],
  },
  {
    conceptCode: "NEGOTIATION_002",
    intentName: "NEGOTIATION",
    intentDescription: "Requesting a discount or negotiating a better price.",
    english: "That's too expensive.",
    keywords: ["expensive", "too", "much"],
  },

  // Product Availability
  {
    conceptCode: "AVAILABILITY_001",
    intentName: "PRODUCT_AVAILABILITY",
    intentDescription: "Checking whether a product is available.",
    english: "Do you have tomatoes?",
    keywords: ["have", "tomatoes", "available"],
  },
  {
    conceptCode: "AVAILABILITY_002",
    intentName: "PRODUCT_AVAILABILITY",
    intentDescription: "Checking whether a product is available.",
    english: "Is this available?",
    keywords: ["available", "is", "this"],
  },

  // Payment
  {
    conceptCode: "PAYMENT_001",
    intentName: "PAYMENT",
    intentDescription: "Conversations relating to payment.",
    english: "I want to pay.",
    keywords: ["pay", "payment"],
  },
  {
    conceptCode: "PAYMENT_002",
    intentName: "PAYMENT",
    intentDescription: "Conversations relating to payment.",
    english: "Do you accept Mobile Money?",
    keywords: ["mobile", "money", "accept"],
  },

  // Appreciation
  {
    conceptCode: "APPRECIATION_001",
    intentName: "APPRECIATION",
    intentDescription: "Expressing thanks.",
    english: "Thank you.",
    keywords: ["thank", "thanks"],
  },
  {
    conceptCode: "APPRECIATION_002",
    intentName: "APPRECIATION",
    intentDescription: "Expressing thanks.",
    english: "I appreciate it.",
    keywords: ["appreciate"],
  },

  // Directions
  {
    conceptCode: "DIRECTIONS_001",
    intentName: "DIRECTIONS",
    intentDescription: "Asking how to get somewhere.",
    english: "Where is the station?",
    keywords: ["where", "station"],
  },
  {
    conceptCode: "DIRECTIONS_002",
    intentName: "DIRECTIONS",
    intentDescription: "Asking how to get somewhere.",
    english: "Which way is the hospital?",
    keywords: ["which", "way", "hospital"],
  },

  // Food Ordering
  {
    conceptCode: "FOOD_ORDERING_001",
    intentName: "FOOD_ORDERING",
    intentDescription: "Ordering food.",
    english: "I would like fried rice.",
    keywords: ["fried", "rice", "like", "want", "order"],
  },
  {
    conceptCode: "FOOD_ORDERING_002",
    intentName: "FOOD_ORDERING",
    intentDescription: "Ordering food.",
    english: "I'll take the banku.",
    keywords: ["banku", "take"],
  },
];
