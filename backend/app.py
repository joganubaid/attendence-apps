from flask import Flask, jsonify, redirect
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