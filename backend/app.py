from flask import Flask, jsonify, redirect, request, send_from_directory
from flask_cors import CORS
import json
import os
import pathlib
import requests

BASE_DIR = pathlib.Path(__file__).parent.resolve()
ASSETS_DIR = BASE_DIR / 'assets'

app = Flask(__name__)
CORS(app)


def ensure_assets():
	ASSETS_DIR.mkdir(parents=True, exist_ok=True)
	samples = [
		('image.jpg', 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=1200&q=60'),
		('sample.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
		('video.mp4', 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4')
	]
	for name, url in samples:
		path = ASSETS_DIR / name
		if not path.exists():
			try:
				r = requests.get(url, timeout=20)
				r.raise_for_status()
				with open(path, 'wb') as f:
					f.write(r.content)
			except Exception as e:
				print(f"Failed to download {name} from {url}: {e}")


@app.get('/health')
def health():
	return jsonify({ 'status': 'ok' })


@app.get('/assets/<path:filename>')
def serve_asset(filename):
	return send_from_directory(ASSETS_DIR, filename)


@app.get('/flow')
def flow():
	with open(BASE_DIR / 'sample_flow.json', 'r') as f:
		data = json.load(f)
	return jsonify(data)


@app.post('/next')
def next_node():
	payload = request.get_json(silent=True) or {}
	vars = payload.get('vars') or {}
	node_id = payload.get('nodeId')
	# Demo branching: if userName set, go to greet; if also wantsSyllabus == 'yes', go to syllabus card; else attendance
	if vars.get('userName'):
		if str(vars.get('wantsSyllabus', '')).lower() in ['yes', 'y', 'true']:
			return jsonify({ 'nextNodeId': 'syllabus' })
		return jsonify({ 'nextNodeId': 'attendance' })
	return jsonify({ 'nextNodeId': 'welcome' })


@app.get('/subjects')
def subjects():
	return jsonify({
		'theory': ['Mathematics', 'Physics', 'Chemistry', 'CS'],
		'labs': ['PhysicsLab', 'CSELab']
	})


@app.get('/download-url/<path:filename>')
def download_url(filename):
	# For demo, redirect to a public sample PDF regardless of filename
	return redirect('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', code=302)


if __name__ == '__main__':
	ensure_assets()
	app.run(host='0.0.0.0', port=8000)