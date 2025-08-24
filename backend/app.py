from flask import Flask, jsonify, redirect, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.get('/health')
def health():
	return jsonify({ 'status': 'ok' })

@app.get('/flow')
def flow():
	with open('sample_flow.json', 'r') as f:
		data = json.load(f)
	return jsonify(data)

@app.post('/next')
def next_node():
	payload = request.get_json(silent=True) or {}
	vars = payload.get('vars') or {}
	node_id = payload.get('nodeId')
	# Simple demo logic: if we just asked name and have userName, go to greet; otherwise welcome
	if vars.get('userName'):
		return jsonify({ 'nextNodeId': 'greet' })
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
	app.run(host='0.0.0.0', port=8000)