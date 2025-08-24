# Sample Chatbot Backend (Flask)

## Endpoints
- GET /health: Health check
- GET /flow: Returns chatbot flow JSON (server-driven)
- POST /next: Server decides the next node based on vars
- GET /assets/<filename>: Serves static assets (image.jpg, sample.pdf, video.mp4)
- GET /subjects: Sample subjects (legacy)
- GET /download-url/<filename>: Demo PDF redirect

## Assets
On first run, the server downloads:
- assets/image.jpg (Unsplash sample)
- assets/sample.pdf (W3C dummy PDF)
- assets/video.mp4 (sample-videos.com)

You can replace these with your own files in `backend/assets/`.

## Flow placeholders
- The sample flow uses `{{base}}` to reference the backend URL. At runtime, set the classroom URL in the app to your deployed backend URL and include `/flow`, e.g. `https://your-app.onrender.com/flow`.
- The app derives the base URL (without `/flow`) to resolve `{{base}}`.

## Run locally
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Expose locally for devices:
- `ngrok http 8000` then use the HTTPS URL + `/flow` in the app settings.

## Customize
- Edit `sample_flow.json` to define nodes/messages/buttons, conditions, and actions.
- Implement your logic in `/next` to branch dynamically.