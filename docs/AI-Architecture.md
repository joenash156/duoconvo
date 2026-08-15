# AI Architecture

## Runtime pipeline

```text
Speech (mobile)
  -> Speech-to-Text (backend, ai.service.ts + stt.service.ts)
  -> Sentence/Text
  -> Fine-tuned Sentence Transformer + FAISS (ai-engine/, wired via ai.service.ts)
  -> Confidence Engine
  -> MySQL Knowledge Base (market_phrases, by concept_code)
  -> Translation
  -> Text-to-Speech (hybrid - see below)
  -> Audio Playback (mobile)
```

The Express API (`api/`) is the orchestration layer. AI inference (Sentence Transformer,
FAISS, confidence scoring) is expected to run as its own service and is currently
simulated by `api/src/services/ai.service.ts`'s mock provider - see that file and
`api/.env.example` for how to point it at a real engine once one exists.

## Hybrid Text-to-Speech

Apple/Google ship on-device TTS voices for English and French, but not for Twi, Ga,
or Ewe. Rather than route every language through the backend, TTS is split:

```text
English/French  -> on-device TTS (mobile: expo-speech)
Twi/Ga/Ewe      -> backend TTS   -> audioUrl -> mobile audio player (expo-audio)
```

- **Mobile**: `mobile/src/services/ttsService.ts` exposes a single `speak(text, language, audioUrl?)`
  function. Callers never branch on device-vs-backend - the service does. English/French
  call `expo-speech` directly with no network request. Twi/Ga/Ewe either play an
  `audioUrl` already returned by a `/translate` call, or request one from the backend.
- **Backend**: `api/src/services/tts.service.ts` exports `DEVICE_TTS_LANGUAGES` (`en`, `fr`)
  and `BACKEND_TTS_LANGUAGES` (`tw`, `ga`, `ee`). `synthesize()` short-circuits to `null`
  for device languages so the backend never makes an unnecessary (or costly, once a real
  provider is wired up) TTS call for languages the phone already handles. `TranslationResult.audioUrl`
  in every `/translate/text` and `/translate/audio` response is populated by this same logic.
- **Standalone endpoint**: `POST /tts` (`{ text, language }` -> `{ audioUrl, language, message? }`)
  lets the mobile app request audio independently of a fresh translation - e.g. replaying
  a result from history. When no backend engine is configured (`TTS_PROVIDER=mock`, the
  default) or the language is a device language, `audioUrl` is `null` and `message`
  explains why - this is a real "not available yet" signal, not a fake success.

**Status**: no real Twi/Ga/Ewe TTS engine is wired up yet. `TTS_PROVIDER=mock` is honest
about this (`audioUrl: null`) rather than pretending. Set `TTS_PROVIDER=http` and
`TTS_ENGINE_URL` once one exists; no other code changes are needed on either side.

## Free-tier hosting readiness

The Express API was built stateless and env-driven from the start, so it already meets
the constraints for deploying to a free tier (e.g. Render Free) during development:

- No GPU dependency, background workers, or queues in the API itself.
- AI/STT/TTS/LLM calls are all optional and env-gated (`*_PROVIDER=mock` by default) -
  the API runs with zero paid external services until you deliberately configure one.
- All configuration (`DATABASE_URL`, provider URLs, API keys, CORS origin) comes from
  environment variables (`api/src/configs/env.ts`) - nothing is hard-coded.
- The mobile app already reads its API URL from `EXPO_PUBLIC_API_BASE_URL`
  (`mobile/src/constants/config.ts`), so pointing it at a deployed backend instead of
  `localhost` is a config change, not a code change.

Known limitations to expect on a free tier: cold starts after idle periods, and MySQL
needs its own (separate) free-tier host, since Render Free does not include managed MySQL.
