from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib


app = Flask(__name__)
CORS(app)


# Load trained ML model
model = joblib.load("crop_model.pkl")

# ================================
# LOAD TRAINING DATA
# ================================

training_data = pd.read_csv("Crop_recommendation.csv")

feature_columns = [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "rainfall"
]


@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No input data received"
        }), 400

    required_fields = [
        "N",
        "P",
        "K",
        "temperature",
        "humidity",
        "ph",
        "rainfall"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "error": f"Missing input: {field}"
            }), 400

    try:
        N = float(data["N"])
        P = float(data["P"])
        K = float(data["K"])
        temperature = float(data["temperature"])
        humidity = float(data["humidity"])
        ph = float(data["ph"])
        rainfall = float(data["rainfall"])

    except (TypeError, ValueError):
        return jsonify({
            "error": "All inputs must be valid numbers"
        }), 400

    # ================================
    # INPUT RANGE VALIDATION
    # ================================

    if not (0 <= N <= 140):
        return jsonify({
            "error": "Nitrogen (N) must be between 0 and 140"
        }), 400

    if not (5 <= P <= 145):
        return jsonify({
            "error": "Phosphorus (P) must be between 5 and 145"
        }), 400

    if not (5 <= K <= 205):
        return jsonify({
            "error": "Potassium (K) must be between 5 and 205"
        }), 400

    if not (8.83 <= temperature <= 43.68):
        return jsonify({
            "error": "Temperature must be between 8.83 and 43.68°C"
        }), 400

    if not (14.26 <= humidity <= 99.98):
        return jsonify({
            "error": "Humidity must be between 14.26 and 99.98%"
        }), 400

    if not (3.50 <= ph <= 9.94):
        return jsonify({
            "error": "Soil pH must be between 3.50 and 9.94"
        }), 400

    if not (20.21 <= rainfall <= 298.56):
        return jsonify({
            "error": "Rainfall must be between 20.21 and 298.56 mm"
        }), 400


    # ================================
    # PREPARE MODEL INPUT
    # ================================

    input_data = pd.DataFrame([{
        "N": N,
        "P": P,
        "K": K,
        "temperature": temperature,
        "humidity": humidity,
        "ph": ph,
        "rainfall": rainfall
    }])

    try:

        # ================================
        # ML PREDICTION
        # ================================

        prediction = model.predict(input_data)

        probabilities = model.predict_proba(input_data)

        confidence = max(probabilities[0]) * 100

        predicted_crop = prediction[0]


        # ================================
        # CALCULATE FIELD SUITABILITY
        # ================================

        crop_data = training_data[
            training_data["label"] == predicted_crop
        ]


        input_values = {
            "N": N,
            "P": P,
            "K": K,
            "temperature": temperature,
            "humidity": humidity,
            "ph": ph,
            "rainfall": rainfall
        }


        scores = []


        for feature in feature_columns:

            crop_min = crop_data[feature].min()
            crop_max = crop_data[feature].max()

            value = input_values[feature]


            # Value is inside the crop's dataset range
            if crop_min <= value <= crop_max:

                score = 100


            # Value is below the crop's range
            elif value < crop_min:

                distance = crop_min - value
                range_size = crop_max - crop_min

                score = max(
                    0,
                    100 - (distance / range_size * 100)
                )


            # Value is above the crop's range
            else:

                distance = value - crop_max
                range_size = crop_max - crop_min

                score = max(
                    0,
                    100 - (distance / range_size * 100)
                )


            scores.append(score)


        suitability = sum(scores) / len(scores)


        # ================================
        # API RESPONSE
        # ================================

        return jsonify({

            "recommended_crop": predicted_crop,

            "confidence": round(
                confidence,
                2
            ),

            "suitability": round(
                suitability,
                2
            )

        })


    except Exception as e:

        return jsonify({

            "error": "ML prediction failed",

            "details": str(e)

        }), 500


@app.route("/")
def home():
    return "AI Crop Advisory ML API is running!"


if __name__ == "__main__":
    app.run(debug=True)