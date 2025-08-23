# Sample Chatbot Backend (Flask)

## Endpoints
- GET /health: Health check
- GET /flow: Returns chatbot flow JSON
- GET /subjects: Returns sample subjects (for legacy Chatbot.js)
- GET /download-url/<filename>: Redirects to a public sample PDF

## Run locally
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Server runs at http://localhost:8000

## Deploy tips
- On Render/Heroku, set start command: `python app.py`
- Ensure `sample_flow.json` is present in the repo