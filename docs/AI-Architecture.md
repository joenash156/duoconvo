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

## Hybrid Speech-to-Text

Whisper (run via Groq's free-tier API) does not have Twi, Ga, or Ewe in its trained
language set - it would guess and transcribe them as the wrong language entirely rather
than fail cleanly. A different, self-hosted model covers exactly those three, so STT is
routed to two independent engines rather than one:

```text
English/French  -> Groq Whisper API (cloud)              -> real transcription
Twi/Ga/Ewe      -> KhayaAI DONDO model (self-hosted, CPU) -> real transcription
```

- **English/French**: `STT_PROVIDER=groq` in `api/.env`. Free tier: 2,000 requests/day
  via `console.groq.com`, no credit card required.
- **Twi/Ga/Ewe**: `ai-engine/app/stt_server.py` wraps KhayaAI's
  `w2v-bert-ada_ewe_fat_fra_gaa_nzi_twi_en` model (part of the DONDO project - open,
  Apache-2.0, https://huggingface.co/KhayaAI) in a small FastAPI service. The inference
  logic (language-prefix conditioning, forward pass) is copied verbatim from the actual
  working implementation at https://huggingface.co/spaces/Ghana-NLP/Southern-Ghana-ASR,
  not reconstructed from the model card - audio decoding uses PyAV instead of torchaudio
  (no compatible torchaudio build for this project's Python version) or a system ffmpeg
  binary (not installed on this machine).

  Run it (first run downloads ~0.6B params from Hugging Face):
  ```
  cd ai-engine/app
  <path-to-venv>/python.exe -m uvicorn stt_server:app --host 0.0.0.0 --port 8002
  ```
  Then set `STT_LOCAL_PROVIDER=http` in `api/.env` and restart the backend. Both engines
  are independently toggled (`STT_PROVIDER` for Groq, `STT_LOCAL_PROVIDER` for this one) -
  `api/src/services/stt.service.ts` routes each request by language, not by a single
  global switch, since both need to be active simultaneously.
- CPU inference (no GPU required, but expect a few seconds per utterance - much slower
  than Groq's cloud inference). The model must stay loaded in memory between requests
  (the FastAPI process loads it once at startup), so keep this service running rather
  than restarting it per request.

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
