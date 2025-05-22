from flask import Flask, request, jsonify
import requests
import logging
from datetime import datetime
from flask_cors import CORS
import os
import logstash
import socket

app = Flask(__name__)
CORS(app)

logstash_host = 'logstash' 
logstash_port = 5044
logger = logging.getLogger('python-logstash-logger')
logger.setLevel(logging.INFO)
logger.addHandler(logstash.TCPLogstashHandler(logstash_host, logstash_port, version=1))

log_dir = "logs"
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, f"backend_{datetime.now().strftime('%Y-%m-%d')}.log")

logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

ML_SERVICE_URL = "http://cvss-mlservice:8000"  # Update if using Docker/k8s

def log_request(endpoint, payload):
    logger.info(f"Calling {endpoint} with payload: {payload}")
    logging.info(f"Calling {endpoint} with payload: {payload}")

def log_response(endpoint, response):
    logger.info(f"Response from {endpoint}: {response}")
    logging.info(f"Response from {endpoint}: {response}")

def log_error(endpoint, error):
    logger.error(f"Error in {endpoint}: {error}")
    logging.error(f"Error in {endpoint}: {error}")

@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        user_input = request.json
        log_request("predict", user_input)

        ml_response = requests.post(f"{ML_SERVICE_URL}/predict", json=user_input)
        response_json = ml_response.json()

        log_response("predict", response_json)
        return jsonify(response_json)
    except Exception as e:
        log_error("predict", str(e))
        return jsonify({"error": str(e)}), 500

@app.route("/api/feedback", methods=["POST"])
def feedback():
    try:
        feedback_data = request.json
        log_request("feedback", feedback_data)

        ml_response = requests.post(f"{ML_SERVICE_URL}/feedback", json=feedback_data)
        response_json = ml_response.json()

        log_response("feedback", response_json)
        return jsonify(response_json)
    except Exception as e:
        log_error("feedback", str(e))
        return jsonify({"error": str(e)}), 500

@app.route("/api/retrain", methods=["POST"])
def retrain():
    try:
        log_request("retrain", {})
        ml_response = requests.post(f"{ML_SERVICE_URL}/retrain")
        response_json = ml_response.json()

        log_response("retrain", response_json)
        return jsonify(response_json)
    except Exception as e:
        log_error("retrain", str(e))
        return jsonify({"error": str(e)}), 500

@app.route("/api/reload", methods=["POST"])
def reload_model():
    try:
        log_request("reload", {})
        ml_response = requests.post(f"{ML_SERVICE_URL}/reload")
        response_json = ml_response.json()

        log_response("reload", response_json)
        return jsonify(response_json)
    except Exception as e:
        log_error("reload", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
