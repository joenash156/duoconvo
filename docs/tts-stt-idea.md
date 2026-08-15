Absolutely. I’d give your coding AI a prompt that **preserves the existing architecture** and tells it not to rebuild things unnecessarily.

# DuoConvo — Implement Hybrid TTS and Prepare Backend for Free Development Hosting

You are working on the existing **DuoConvo (`marketcomm-ai`)** project. Before making changes, inspect and understand the existing codebase and architecture. **Do not rewrite or replace working parts of the application unnecessarily.**

## Goal

Implement a **hybrid Text-to-Speech (TTS) architecture**:

* **English → on-device TTS**
* **French → on-device TTS**
* **Twi → backend TTS**
* **Ga → backend TTS**
* **Ewe → backend TTS**

The mobile application should have one clean audio/TTS interface so the UI does not need to know how each language is implemented.

The backend should also remain suitable for **free-tier development/deployment**, especially using a service such as Render Free or another appropriate free hosting option.

---

## 1. First inspect the existing project

Before modifying anything, inspect:

* `mobile/`
* `express-api/`
* `ai-engine/`
* existing API routes
* translation response structures
* current audio/TTS implementation, if any
* environment variables
* API configuration
* model inference code
* existing documentation

Understand how the current pipeline works.

The existing intended pipeline is approximately:

```text
Speech
  ↓
STT
  ↓
Sentence/Text
  ↓
Fine-tuned Sentence Transformer
  ↓
Embedding
  ↓
FAISS
  ↓
MySQL Knowledge Base
  ↓
Translation
  ↓
TTS
  ↓
Audio Playback
```

Do not break this pipeline.

---

# 2. Implement a unified TTS interface in the mobile app

Create or adapt a TTS service/helper so the rest of the React Native application can simply request:

```text
speak(text, language)
```

or an equivalent clean interface.

The UI should **not** contain logic such as:

```text
if language === English
else if language === French
else if language === Twi
```

That decision should belong inside the TTS service.

The architecture should look conceptually like:

```text
Mobile UI
   ↓
TTS Service
   ├── English → Device TTS
   ├── French  → Device TTS
   └── Twi/Ga/Ewe → Backend audio
```

Keep the implementation modular so the backend TTS implementation can be improved later without changing the UI.

---

# 3. English and French: use device TTS

For English and French, use the native/device TTS capability available to React Native.

The service should:

1. Receive translated text.
2. Detect that the target language is English or French.
3. Use the device TTS engine.
4. Select an appropriate locale, for example:

   * English → `en-US` or an appropriate English locale
   * French → `fr-FR` or an appropriate French locale
5. Play the speech.

Handle cases where a particular voice/locale is unavailable gracefully.

Do not make an unnecessary backend request for English/French audio.

---

# 4. Twi, Ga and Ewe: use backend audio

For Twi, Ga and Ewe, the mobile app should request audio from the backend.

The backend should expose a clean endpoint, for example:

```text
POST /api/tts
```

or another endpoint consistent with the existing API architecture.

The request should contain the translated text and target language.

Conceptually:

```json
{
  "text": "translated sentence",
  "language": "twi"
}
```

The response should provide a way for the mobile app to retrieve/play the generated audio.

For example:

```json
{
  "audioUrl": "...",
  "language": "twi"
}
```

Use the project's existing response/error conventions if they already exist.

**Do not invent a completely different API style if the project already has one.**

---

# 5. Important: do not fake TTS support

If a proper backend TTS engine for Twi, Ga or Ewe is not currently available, **do not pretend that it exists**.

Instead:

* create the correct backend TTS abstraction/interface,
* clearly identify the missing TTS engine,
* return an appropriate structured response/error,
* keep the mobile implementation ready to consume `audioUrl`.

For example, the backend can conceptually have:

```text
TTS Service
   ├── English
   ├── French
   ├── Twi
   ├── Ga
   └── Ewe
```

but only implement the engines that are actually available.

The architecture must make it easy to add a real Twi/Ga/Ewe TTS engine later.

---

# 6. Keep `audioUrl` as the backend contract

For backend-generated audio, the mobile application should expect something conceptually like:

```json
{
  "audioUrl": "...",
  "language": "twi"
}
```

The mobile app should then play the returned audio.

Do not tightly couple the mobile app to the specific backend TTS provider.

This is important because we may change the TTS engine later.

---

# 7. Error handling

Implement graceful handling for:

### Device TTS failure

If English/French device TTS fails:

* show/log a meaningful error,
* do not crash the application.

### Backend TTS failure

If Twi/Ga/Ewe backend TTS fails:

* show/log a meaningful error,
* do not crash the application,
* make it clear that audio generation failed.

Do not silently pretend audio was generated.

---

# 8. Keep the backend free-tier friendly

The Express backend should be designed so that it can be deployed on a free hosting service during development/testing.

Avoid unnecessarily expensive infrastructure.

Do not introduce:

* paid cloud services unnecessarily,
* GPU-dependent infrastructure unless absolutely required,
* always-running workers,
* expensive queues,
* unnecessary external APIs.

The API should remain stateless where practical.

Use environment variables for:

```text
DATABASE_URL
API_URL
MODEL configuration
TTS configuration
API keys
```

Never hard-code secrets.

---

# 9. Important distinction for the ML model

Do not assume that the entire AI model must run inside the free Express hosting instance.

Inspect the existing architecture first.

The Express API should remain responsible for the API/orchestration layer, while the AI inference/model can remain separated if the current architecture requires it.

The goal is:

```text
Mobile
   ↓
Express API
   ↓
AI / FAISS / Database / Translation
   ↓
TTS
```

while keeping deployment costs at $0 during development wherever realistically possible.

If the existing model is too resource-intensive for a free hosting instance, **do not downgrade or replace the model just to make deployment easier**. Document the deployment limitation instead.

---

# 10. Environment configuration

Inspect the current `.env` / environment configuration.

Add only the variables actually required.

For example, if needed:

```text
TTS_PROVIDER=
TTS_API_KEY=
TTS_BASE_URL=
```

Do not create fake values.

Update `.env.example` with placeholders where appropriate.

Never commit real API keys.

---

# 11. API URL handling

Make sure the mobile application does not contain hard-coded development URLs such as:

```text
http://localhost:3000
```

unless they are already handled through a proper development configuration.

Prepare the project so the API URL can eventually be changed from:

```text
local development
        ↓
free hosted backend
```

through environment/configuration rather than changing application source code.

---

# 12. Preserve the existing DuoConvo architecture

This is extremely important.

Do NOT:

* replace the existing AI model,
* replace FAISS,
* replace the MySQL knowledge base,
* replace the translation architecture,
* add authentication unless already required,
* redesign the entire mobile UI,
* rewrite working API routes,
* introduce unnecessary dependencies.

Only make the changes required to implement the hybrid TTS architecture and improve deployment readiness.

---

# 13. Testing

After implementation, test at least these cases:

### English

```text
Translation → TTS Service → Device TTS → Audio
```

### French

```text
Translation → TTS Service → Device TTS → Audio
```

### Twi

```text
Translation → TTS Service → Backend → audioUrl → Mobile Audio
```

### Ga

```text
Translation → TTS Service → Backend → audioUrl → Mobile Audio
```

### Ewe

```text
Translation → TTS Service → Backend → audioUrl → Mobile Audio
```

Also test:

* unsupported language
* empty text
* backend unavailable
* TTS provider unavailable
* missing voice/locale
* invalid backend response

---

# 14. Documentation

After implementation, update the appropriate project documentation.

Document the architecture clearly:

```text
English/French
    → Device TTS

Twi/Ga/Ewe
    → Backend TTS
    → audioUrl
    → Mobile Audio Player
```

Also document that the backend is designed for free-tier development/deployment, while noting any limitations of free hosting such as cold starts, resource limits, or model-size constraints.

---

# 15. Final report to me

When finished, do NOT just say "done."

Give me:

1. **Files inspected**
2. **Files changed**
3. **What was implemented**
4. **How English TTS works**
5. **How French TTS works**
6. **How Twi/Ga/Ewe backend TTS works**
7. **The backend TTS endpoint**
8. **Any new dependencies**
9. **Any new environment variables**
10. **What is still missing**, especially if a real Twi/Ga/Ewe TTS engine is not yet available
11. **How to test the implementation**
12. **Any deployment limitations for free hosting**

Most importantly, **do not make assumptions about files or architecture. Inspect the existing code first and adapt the implementation to what is actually there.**
