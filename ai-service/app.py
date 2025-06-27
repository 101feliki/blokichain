from flask import Flask, request, jsonify
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
from datetime import datetime

app = Flask(__name__)

# Load or create model
try:
    model = joblib.load('models/vote_model.pkl')
except:
    model = IsolationForest(contamination=0.1)
    joblib.dump(model, 'models/vote_model.pkl')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    
    # Convert votes to features
    votes = np.array(data['results']).reshape(1, -1)
    
    # Anomaly detection
    anomaly_score = model.decision_function(votes)[0]
    is_anomaly = model.predict(votes)[0] == -1
    
    # Basic statistics
    total = sum(data['results'])
    percentages = [round(v/total*100, 2) for v in data['results']]
    
    return jsonify({
        "analysis": {
            "total_votes": total,
            "percentages": percentages,
            "anomaly_score": float(anomaly_score),
            "is_anomaly": bool(is_anomaly),
            "timestamp": datetime.utcnow().isoformat()
        }
    })

if __name__ == '__main__':
    app.run(port=5001)