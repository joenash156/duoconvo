# DuoConvo

A multilingual market-phrase translation app for Ghana — English, Twi, Ga, Ewe, and French. A fine-tuned Sentence Transformer + FAISS retrieval engine matches what you say to a curated set of verified phrases, with an LLM fallback for anything it doesn't recognize.

The project has three moving parts that all need to run together:

| Part | What it does | Tech |
|---|---|---|
| `mobile/` | The React Native (Expo) app | Expo Router, NativeWind |
| `api/` | REST API — orchestrates STT, AI retrieval, DB lookups, TTS, LLM fallback | Express, TypeScript, Drizzle ORM, MySQL |
| `ai-engine/` | The AI itself — model training + two inference services | Python, sentence-transformers, FAISS, FastAPI |

---

## Project structure

```
duoconvo/
├── api/                      # Express + TypeScript REST API
│   ├── src/
│   │   ├── configs/          # env.ts, db.ts, audioStorage.ts
│   │   ├── controllers/      # request handlers
│   │   ├── db/               # Drizzle schema + seed script
│   │   ├── middlewares/
│   │   ├── repositories/     # DB queries
│   │   ├── routes/
│   │   ├── services/         # ai/stt/tts/llmFallback/translation services
│   │   ├── types/
│   │   ├── utils/
│   │   └── validators/       # zod schemas
│   ├── uploads/               # generated TTS audio files (gitignored)
│   ├── .env.example
│   └── package.json
│
├── mobile/                   # Expo React Native app
│   └── src/
│       ├── app/               # expo-router screens (tabs, modals, legal)
│       ├── components/ui/
│       ├── contexts/          # theme, etc.
│       ├── hooks/              # react-query hooks
│       ├── services/           # apiClient, translationService, ttsService
│       ├── themes/
│       └── types/
│
├── ai-engine/                 # Everything AI
│   ├── app/                    # FastAPI inference services (run these live)
│   │   ├── ai_server.py         # port 8001 - retrieval + confidence
│   │   ├── stt_server.py        # port 8002 - Twi/Ga/Ewe speech-to-text
│   │   ├── requirements.txt
│   │   └── start_services.bat   # starts both, Windows only
│   ├── training/                # build_pairs.py, train_model.py
│   ├── inference/                # confidence.py, generate_embeddings.py, search.py
│   ├── evaluation/                # accuracy eval scripts + test sets
│   ├── vector-db/                  # FAISS index + embeddings + metadata (git-tracked)
│   ├── models/                      # trained model weights - NOT in git, see below
│   └── config.py                     # all AI-side paths/hyperparameters in one place
│
├── dataset-tools/              # one-off scripts that built/curated the datasets
├── datasets/
│   ├── curated/                  # multilingual_phrases.csv - the 82 verified concepts
│   ├── generated/                 # training pairs, mined corpora (git-tracked)
│   ├── public/                     # raw public datasets used as sources
│   └── raw/
│
└── .venv/                       # single shared Python venv for all of ai-engine/ + dataset-tools/
```

---

## Prerequisites

Install these before anything else:

- **Node.js 20+** and **pnpm** (`npm install -g pnpm`)
- **Python 3.11+**
- **MySQL** (running locally, or a connection string to one)
- **Git**

For the mobile app: the **Expo Go** app on your phone (easiest way to test), and your phone + computer on the **same Wi-Fi network**.

---

## 1. Clone and get your bearings

```bash
git clone https://github.com/joenash156/wiemo.git duoconvo
cd duoconvo
```

## 2. Set up the shared Python environment (`ai-engine/` + `dataset-tools/`)

One venv at the project root covers both the AI services and the dataset-building scripts.

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r ai-engine/app/requirements.txt
pip install -r ai-engine/training/requirements.txt
```

### The trained model is NOT in git

`ai-engine/models/` is gitignored on purpose (model weights are large binary files). Cloning the repo gets you the **code**, not a trained model. You have two options:

- **Get the model files from a teammate** — zip `ai-engine/models/duoconvo-model/` and share it directly (Drive, WeTransfer, etc.), then drop it into the same path in your clone. This is the fast option.
- **Train it yourself** — see [Retraining the model](#retraining-the-model) below. Takes roughly 1-2+ hours on CPU.

Either way, once `ai-engine/models/duoconvo-model/` exists locally, `ai-engine/vector-db/` (the FAISS index + embeddings) is already git-tracked and ready to use, **as long as it was built from the same model you now have**. If in doubt, regenerate it:

```bash
python ai-engine/inference/generate_embeddings.py
python ai-engine/vector-db/build_faiss.py
```

## 3. Set up MySQL + the API

Create an empty database (name it whatever you like, e.g. `duoconvo_db`):

```sql
CREATE DATABASE duoconvo_db;
```

Then:

```bash
cd api
pnpm install
cp .env.example .env
```

Open `.env` and fill in at minimum:

| Variable | What it's for |
|---|---|
| `DATABASE_URL` | `mysql://user:password@localhost:3306/duoconvo_db` |
| `PUBLIC_BASE_URL` | Your machine's **LAN IP** (e.g. `http://192.168.1.23:8000`) — not `localhost`, since your phone needs to reach it. Find yours with `ipconfig` (Windows) / `ifconfig` (Mac/Linux). |

Everything else in `.env.example` has a safe default (mock mode) or is optional — see [Environment variables reference](#environment-variables-reference) below for the full picture, including free options for STT/TTS/LLM.

Push the schema and seed the database from the curated dataset:

```bash
pnpm run db:push
pnpm run db:seed
```

## 4. Start everything, in this order

Each of these runs in its own terminal and stays running.

```bash
# 1. AI retrieval service (from project root, with .venv active)
cd ai-engine/app
python -m uvicorn ai_server:app --host 0.0.0.0 --port 8001

# 2. Twi/Ga/Ewe speech-to-text service (only needed if STT_LOCAL_PROVIDER=http)
python -m uvicorn stt_server:app --host 0.0.0.0 --port 8002

# 3. The API (from api/)
pnpm run dev

# 4. The mobile app (from mobile/)
pnpm install
pnpm run start
```

On Windows, steps 1-2 can be launched together with `ai-engine/app/start_services.bat`.

Wait for each service to print its "ready"/"startup complete" message before moving to the next.

## 5. Set up the mobile app's own env

```bash
cd mobile
```

Create `.env.local`:

```
EXPO_PUBLIC_API_BASE_URL=http://<your-lan-ip>:8000/api
```

Same LAN IP as `PUBLIC_BASE_URL` above — `localhost` won't work from a physical phone.

Then scan the QR code from `pnpm run start` with Expo Go (phone and computer must be on the same Wi-Fi).

---

## Environment variables reference (`api/.env`)

Everything defaults to a "mock" mode that runs with zero external accounts, so you can get the app working end-to-end before wiring up any real API keys.

| Feature | Env vars | Free option |
|---|---|---|
| AI retrieval | `AI_ENGINE_URL` (default `http://localhost:8001`) | Always local, no key needed |
| STT (English/French) | `STT_PROVIDER=groq`, `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) — free tier |
| STT (Twi/Ga/Ewe) | `STT_LOCAL_PROVIDER=http`, `STT_ENGINE_URL` | Self-hosted (`stt_server.py`), no key needed |
| TTS (Twi/Ga/Ewe) | `TTS_PROVIDER=ghananlp`, `GHANANLP_API_KEY` | [translation.ghananlp.org](https://translation.ghananlp.org) — free tier, has a call-volume quota |
| LLM fallback | `LLM_FALLBACK_PROVIDER=groq`, reuses `GROQ_API_KEY` | Free — same Groq account as STT, no separate signup |

The LLM fallback only fires when the AI's confidence is LOW, or a matched concept has no verified translation yet for the requested language — it's a safety net, not the primary translation path.

Leave any of these on `mock` and that piece of the pipeline returns placeholder output instead of failing — useful for testing the rest of the app without every key set up.

---

## Common commands

```bash
# API
cd api
pnpm run dev          # start with auto-reload
pnpm run db:studio    # browse the database in Drizzle Studio
pnpm run db:seed      # reseed from datasets/curated/multilingual_phrases.csv (wipes conversation_logs)
pnpm run typecheck

# Mobile
cd mobile
pnpm run start
pnpm run android       # or --ios / --web
pnpm run lint

# AI engine (from project root, .venv active)
python ai-engine/inference/search.py             # interactive REPL to test retrieval by hand
python ai-engine/evaluation/evaluate_unseen_multilingual.py   # accuracy check
```

---

## Retraining the model

Only needed if you're changing the training data or don't have the model files from a teammate. Run from the project root with `.venv` active:

```bash
python ai-engine/training/build_pairs.py     # builds training pairs from datasets/curated + datasets/generated
python ai-engine/training/train_model.py     # fine-tunes the model (CPU-only: 1-2+ hours)
python ai-engine/inference/generate_embeddings.py
python ai-engine/vector-db/build_faiss.py
```

Restart `ai_server.py` afterwards — it loads the model into memory once at startup and won't pick up changes on its own.

To add or change the curated phrases themselves, edit `datasets/curated/multilingual_phrases.csv` (or use the scripts in `dataset-tools/` for translation/filtering), then re-run `pnpm run db:seed` in `api/` **and** the retraining steps above, so the database and the model stay in sync.

---

## Troubleshooting

- **"Network request failed" on the phone**: `PUBLIC_BASE_URL` (api/.env) and `EXPO_PUBLIC_API_BASE_URL` (mobile/.env.local) must both point at your computer's LAN IP, not `localhost`, and both devices must be on the same Wi-Fi.
- **Changed `.env` but nothing happened**: `pnpm run dev`'s auto-reload watches `.ts` files, not `.env` — restart the API process manually.
- **`ai_server.py` still acting like the old model**: it loads the model + FAISS index into memory once at startup — restart it after retraining or reseeding.
- **`EADDRINUSE`**: something's already bound to that port. Find and stop it (`netstat -ano | findstr :8000` on Windows) before restarting.