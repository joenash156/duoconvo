# Frontend Development – DuoConvo Mobile Application

You are acting as the Lead Mobile Frontend Engineer for this project.

Your responsibility is to design and implement the React Native (Expo) mobile application for **DuoConvo**, an AI-powered multilingual communication assistant designed for Ghanaian markets.

The frontend should be modern, intuitive, scalable, and built with clean software engineering principles. The application should appear production-ready while remaining modular enough for future backend integration.

---

# Project Overview

DuoConvo is an AI-powered multilingual communication assistant that helps traders, tourists, restaurant workers, taxi drivers, receptionists and customers communicate despite language barriers.

Unlike conventional translation apps, DuoConvo primarily relies on our own fine-tuned AI model to understand the meaning of conversations before retrieving the correct multilingual translation.

The backend AI pipeline includes:

* Speech-to-Text
* Fine-Tuned Sentence Transformer
* Semantic Embedding Generation
* FAISS Semantic Search
* Confidence Evaluation
* MySQL Knowledge Base Retrieval
* Optional LLM Fallback
* Text-to-Speech

The frontend should not implement any AI logic.

Instead, it should communicate with backend APIs and display the returned results.

---

# Primary Objective

Design an elegant native mobile experience that feels fast, professional and simple enough for users in busy market environments.

The interface should minimise typing and prioritise voice interaction.

The application should be usable by both literate and non-literate users.

---

# Technology Stack

Use:

* React Native (Expo)
* TypeScript
* Expo Router (preferred)
* NativeWind (preferred)
* React Query (prepare for API integration)
* React Hook Form where forms are needed
* Expo Speech / Speech APIs only as placeholders until backend integration
* React Native Reanimated for animations
* React Native Gesture Handler if needed

Do not build backend functionality.

Design every screen assuming data will come from API responses.

---

# Design Philosophy

The UI should feel:

* Modern
* Minimal
* Clean
* Friendly
* Professional
* Fast
* Accessible

Avoid clutter.

Large touch targets should be used because many users may be walking, shopping or carrying goods.

Animations should be smooth but subtle.

The interface should resemble a polished commercial application rather than a student project.

---

# Colour Palette

Suggested colours:

Primary:
Deep Blue (#2563EB)

Secondary:
Emerald Green (#10B981)

Background:
White

Cards:
Very Light Grey

Text:
Dark Slate

Use colour primarily to indicate interaction rather than decoration.

---

# Application Flow

The application should initially launch without authentication.

Future authentication support should be easy to add, but authentication is intentionally excluded from the MVP.

The initial user flow is:

Splash Screen

↓

Home Screen

↓

Select Spoken Language

↓

Select Target Language

↓

Tap Listen Button

↓

Listening State

↓

Processing State

↓

Translation Result

↓

Play Translation Audio

↓

Switch Languages

↓

Continue Conversation

---

# Core Screens

## 1. Splash Screen

Display:

* DuoConvo logo
* App name
* Simple loading animation

Navigate automatically to Home.

---

## 2. Home Screen

This is the primary conversation screen.

Include:

* Spoken Language selector
* Target Language selector
* Swap Languages button
* Large microphone button
* Text input option
* Recent conversation preview
* Translate button (for typed input)
* Status indicators

The microphone button should visually resemble applications such as Shazam.

---

## 3. Listening Screen

Display:

Animated microphone.

Listening waveform.

Current recording duration.

Cancel button.

Stop button.

---

## 4. Processing Screen

Display:

Animated loading indicator.

Messages such as:

"Understanding your sentence..."

"Finding the best translation..."

This screen should prepare for asynchronous backend responses.

---

## 5. Translation Result Screen

Display:

Original speech.

Speech-to-text result.

Translated text.

Detected intent (returned by backend if available).

Similarity score.

Translation source:

* AI Model
* LLM Fallback

Play Audio button.

Copy Translation button.

New Conversation button.

This screen should consume API responses rather than generate its own data.

---

## 6. Conversation History

Display previous conversations.

Each card should include:

* Date
* Time
* Input language
* Output language
* Original sentence
* Translation

Prepare for pagination.

---

## 7. AI Evidence Screen

This screen is extremely important.

It exists to demonstrate that DuoConvo's own AI is performing the translation.

Each translation should appear as a clean card rather than a table.

Each card should display:

* Timestamp
* User input
* Speech-to-text output
* Similarity score
* Translation source (Model or LLM)
* Intent (if provided by backend)

This screen should simply render backend data without performing any AI calculations.

---

# Backend Integration

Assume the backend exposes REST APIs.

The frontend should prepare service layers, hooks and API interfaces rather than hardcoding business logic.

The UI should gracefully handle:

* Loading
* Success
* Error
* Retry
* Empty states

Mock data may be used temporarily, but all components should be designed for straightforward replacement with backend responses.

---

# Architecture

Organise the project into reusable components.

Separate:

* Screens
* Components
* Hooks
* Services
* Types
* Utilities

Avoid placing business logic inside UI components.

Create reusable UI elements wherever possible.

---

# Accessibility

Support:

* Large buttons
* Clear typography
* High colour contrast
* Screen-reader-friendly controls where practical

---

# Future Expansion

Structure the project so future features can be added without major refactoring, including:

* User authentication
* Favourite phrases
* Offline translation
* Downloadable language packs
* User settings
* AI model updates
* Push notifications
* Admin dashboard integration

---

# Final Goal

Produce a polished, native-quality React Native application that is fully prepared to integrate with the DuoConvo AI backend.

The frontend should focus on excellent user experience, modular architecture and maintainability while remaining independent of the AI implementation details. Every screen should anticipate structured backend responses and present them clearly to the user.
