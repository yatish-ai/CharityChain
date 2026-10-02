from flask import Flask, request, jsonify
import numpy as np
from sklearn.ensemble import IsolationForest

app = Flask(__name__)
model = IsolationForest(contamination=0.1, random_state=42)
# Baseline demo data: transaction amount, frequency, interval_hours
baseline = np.array([
    [500, 2, 24], [750, 3, 20], [1000, 2, 36], [1200, 4, 18],
    [1500, 3, 24], [2000, 2, 48], [2500, 4, 12], [3000, 3, 24],
    [4000, 2, 36], [5000, 3, 24]
], dtype=float)
model.fit(baseline)

@app.get("/health")
def health():
    return jsonify({"ok": True, "model": "IsolationForest"})

@app.post("/analyze")
def analyze():
    payload = request.get_json(silent=True) or {}
    amount = float(payload.get("amount", 0))
    frequency = float(payload.get("frequency", 1))
    interval = float(payload.get("intervalHours", 24))
    x = np.array([[amount, frequency, interval]], dtype=float)
    pred = int(model.predict(x)[0])
    score = float(model.decision_function(x)[0])
    anomaly = pred == -1
    risk = "high" if anomaly else "normal"
    return jsonify({"risk":"HIGH" if anomaly else "NORMAL","isAnomaly":anomaly,"score":score,"message":"Review recommended" if anomaly else "No anomaly detected in this prototype model."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
