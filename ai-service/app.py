from datetime import datetime, timezone
import os

from flask import Flask, jsonify, request

from analysis.vote_analyzer import analyze

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify(status="ok")


@app.post("/analyze")
def analyze_route():
    data = request.get_json(silent=True) or {}
    try:
        result = analyze(data.get("results") or [], previous=data.get("previous"))
    except ValueError as err:
        return jsonify(error=str(err)), 400

    return jsonify(
        analysis={
            **result.to_dict(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)))
