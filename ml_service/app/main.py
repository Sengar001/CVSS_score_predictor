from flask import Flask, request, jsonify
import torch
import numpy as np
import pandas as pd
import os
import json
import threading

from model import MultiInputModel
from utils import text_to_sequence, load_vocab_scaler
from retrain_model import retrain_from_feedback

app = Flask(__name__)

vocab, scaler = load_vocab_scaler()
struct_features = [
    "access_complexity", "impact_availability", "impact_confidentiality", "impact_integrity",
    "access_vector_ADJACENT_NETWORK", "access_vector_LOCAL", "access_vector_NETWORK",
    "access_authentication_MULTIPLE", "access_authentication_NONE", "access_authentication_SINGLE"
]
num_struct_features = len(struct_features)

def load_model():
    global model
    model = MultiInputModel(vocab_size=len(vocab), struct_dim=num_struct_features)
    model.load_state_dict(torch.load("model/cvss_model.pt", map_location=torch.device('cpu')))
    model.eval()

load_model()

@app.route("/predict", methods=["POST"])
def predict_cvss():
    input_data = request.json
    summary = input_data["summary"]
    seq = text_to_sequence(summary, vocab).unsqueeze(0)

    struct = np.array([[input_data[f] for f in struct_features]])
    struct_scaled = scaler.transform(struct)
    struct_tensor = torch.tensor(struct_scaled, dtype=torch.float)

    with torch.no_grad():
        prediction = model(seq, struct_tensor).item()

    return jsonify({"cvss_score": round(prediction, 2)})

@app.route("/feedback", methods=["POST"])
def receive_feedback():
    feedback = request.json
    feedback_buffer_path = "dataset/feedback.json"
    data_csv_path = "dataset/cve111.csv"

    if os.path.exists(feedback_buffer_path):
        with open(feedback_buffer_path, "r") as f:
            feedback_buffer = json.load(f)
    else:
        feedback_buffer = []

    feedback_buffer.append(feedback)

    with open(feedback_buffer_path, "w") as f:
        json.dump(feedback_buffer, f)

    if len(feedback_buffer) >= 500:
        print("500 feedback entries reached. Appending to CSV and retraining.")

        feedback_df = pd.DataFrame([{
            "summary": fb["summary"],
            "access_complexity": fb["access_complexity"],
            "impact_availability": fb["impact_availability"],
            "impact_confidentiality": fb["impact_confidentiality"],
            "impact_integrity": fb["impact_integrity"],
            "access_vector": fb["access_vector"],
            "access_authentication": fb["access_authentication"],
            "cwe_name": fb["cwe_name"],
            "cwe_code": fb["cwe_code"],
            "cvss": fb["cvss"]
        } for fb in feedback_buffer])

        if os.path.exists(data_csv_path):
            existing_df = pd.read_csv(data_csv_path)
            updated_df = pd.concat([existing_df, feedback_df], ignore_index=True)
        else:
            updated_df = feedback_df

        # Save back to CSV
        updated_df.to_csv(data_csv_path, index=False)

        # Clear feedback buffer
        with open(feedback_buffer_path, "w") as f:
            json.dump([], f)

        # Retrain model on updated CSV
        # retrain_from_feedback(data_csv_path)
        thread = threading.Thread(target=retrain_task)
        thread.start()

        return jsonify({"status": "500 feedback received. Model retrained."})

    return jsonify({"status": "Feedback stored", "current_count": len(feedback_buffer)})

@app.route("/reload", methods=["POST"])
def reload_model():
    load_model()
    return jsonify({"status": "Model reloaded"})

def retrain_task():
    retrain_from_feedback("dataset/cve111.csv")

@app.route("/retrain", methods=["POST"])
def retrain_model():
    # retrain_from_feedback("dataset/cve111.csv")
    thread = threading.Thread(target=retrain_task)
    thread.start()

    return jsonify({"status": "500 feedback received. Model retraining started."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
