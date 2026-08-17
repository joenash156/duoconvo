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
FAISS, confidence scoring) runs as its own service, `ai-engine/app/ai_server.py` - a
FastAPI wrapper around the exact retrieval logic in `ai-engine/inference/search.py` and
`confidence.py` (imports `calculate_confidence` directly rather than reimplementing it).
There is no mock fallback for this one - `api/src/services/ai.service.ts` always calls
the real engine, since fake semantic matching defeats the point of the app.

Run both `ai_server.py` (port 8001) and `stt_server.py` (port 8002, see Hybrid
Speech-to-Text below) together with one command:
```
ai-engine/app/start_services.bat
```
This opens each in its own window so you can see their logs independently. Or run them
manually if you'd rather (loads the fine-tuned model + FAISS index into memory once at
startup, so keep it running rather than restarting per request):
```
cd ai-engine/app
<path-to-venv>/python.exe -m uvicorn ai_server:app --host 0.0.0.0 --port 8001
```
No Node-side code changes are needed to point at it - the JSON contract `ai.service.ts`
expects was designed before the real engine existed, and `ai_server.py` matches it
exactly.

**Model training status (current, honest numbers)**: the model was retrained on a genuinely
multilingual pair set (curated English<->Twi/Ewe/French concept pairs + market-filtered
general corpora - see `training/build_pairs.py` and `dataset-tools/build_{twi,ga,ewe}_pairs.py`),
replacing the earlier English-only training that had never actually verified cross-lingual
retrieval at all. Measured on `evaluate_unseen.py` (English) and
`evaluate_unseen_multilingual.py` (per-language): English 57.89%, French 52.63%, Twi
10.53%, Ewe 10.53% - a real regression from the prior English-only 68.42%, and Twi/Ewe are
not yet reliable. Working theory: `CosineSimilarityLoss` (binary-labeled positive/negative
pairs) is likely the wrong loss for this retrieval-style task -
`MultipleNegativesRankingLoss` is the field-standard choice for aligning pairs like these
and hasn't been tried yet. A separate hard-negative-mining experiment
(`generate_hard_negative_pairs()` in `training/build_pairs.py`, unused by default) also
regressed accuracy earlier (63.16% -> 57.89%) for the same small-dataset reason. Per current
direction from the user, the app is wired to show the model's real output regardless of
confidence (see `api/src/services/translation.service.ts`) rather than mask a weak model
behind fallback text - the numbers above are what to expect until training is revisited.

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

  Run it (first run downloads ~0.6B params from Hugging Face) - or use
  `ai-engine/app/start_services.bat` to start this and `ai_server.py` together:
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
