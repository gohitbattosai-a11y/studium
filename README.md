# Studium — Agenda collaborativa di classe

Frontend: React 19 + Vite + Tailwind v4 (Node.js 20+).
Backend: FastAPI (Python 3.11+) + MongoDB.

## 1. Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # imposta MONGO_URL se Mongo non è in locale
python seed.py                  # crea il gruppo demo "3°B Liceo" (password 1234)
uvicorn server:app --port 8001 --reload
```

## 2. Frontend
```bash
cd frontend
npm install        # oppure yarn
npm run dev        # http://localhost:3000  (inoltra /api → localhost:8001)
```

Build di produzione: `npm run build` → cartella `frontend/dist`. Servila dallo stesso dominio del backend, con `/api/*` inoltrato a FastAPI (es. Nginx).

## Accesso demo
Gruppo `3°B Liceo`, password `1234`, nickname a scelta + PIN di 4-6 cifre.
Membri già presenti: Giulia/1234, Marco/1111, Sara/2222, Luca/3333, Elena/4444.
