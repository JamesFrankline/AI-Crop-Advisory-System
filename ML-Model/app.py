from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pathlib import Path
import math
import os
import pandas as pd
import joblib
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = Path(__file__).resolve().parent

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "local-development-only-change-me")

CORS(app, supports_credentials=True)

DATABASE_PATH = BASE_DIR / "users.db"
MODEL_PATH = BASE_DIR / "crop_model.pkl"
CSV_PATH = BASE_DIR / "Crop_recommendation.csv"

# ================================
# USER DATABASE SETUP
# ================================
def init_db():
    conn = sqlite3.connect(str(DATABASE_PATH))
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()



# Load trained ML model
model = joblib.load(MODEL_PATH)

# ================================
# LOAD TRAINING DATA
# ================================

training_data = pd.read_csv(CSV_PATH)

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
        "rainfall",
        "landArea",
        "location",
        "soilType",
        "soilMoisture"
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
        land_area = float(data["landArea"])
        soil_moisture = float(data["soilMoisture"])

        location = str(data["location"]).strip().lower()
        soil_type = str(data["soilType"]).strip().lower()

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
    # ADDITIONAL FIELD INPUT VALIDATION
    # ================================

    if not math.isfinite(land_area) or land_area <= 0:
        return jsonify({
            "error": "Land area must be greater than 0 acres"
        }), 400

    if not math.isfinite(soil_moisture) or not (0 <= soil_moisture <= 100):
        return jsonify({
            "error": "Soil moisture must be between 0 and 100%"
        }), 400

    allowed_soils = [
        "alluvial", "black", "red",
        "loamy", "sandy", "clay"
    ]

    if soil_type not in allowed_soils:
        return jsonify({
            "error": "Invalid soil type"
        }), 400

    allowed_locations = [
        "nagapattinam",
        "thanjavur",
        "tiruvarur",
        "mayiladuthurai",
        "coimbatore",
        "madurai",
        "other"
    ]

    if location not in allowed_locations:
        return jsonify({
            "error": "Invalid location"
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

        print("Predicted crop:", prediction[0])
        print("Class probabilities:", model.predict_proba(input_data)[0])

        probabilities = model.predict_proba(input_data)

        confidence = max(probabilities[0]) * 100
        
        print("Predicted crop:", prediction[0])
        print("Class probabilities:", dict(zip(model.classes_, probabilities[0])))

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

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required."}), 400

    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400

    try:
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (name, email, generate_password_hash(password))
        )

        conn.commit()
        conn.close()

        return jsonify({"message": "Account created successfully!"}), 201

    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "This email is already registered."}), 409

    except sqlite3.Error:
        conn.close()
        return jsonify({"error": "Database error. Please try again."}), 500


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "error": "Email and password are required."
        }), 400

    conn = sqlite3.connect("users.db")

    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, name, password_hash FROM users WHERE email = ?",
            (email,)
        )
        user = cursor.fetchone()

        if user and check_password_hash(user[2], password):
            session["user_id"] = user[0]
            return jsonify({
                "message": "Login successful!",
                "name": user[1]
            }), 200

        return jsonify({
            "error": "Invalid email or password."
        }), 401

    finally:
        conn.close()




@app.route("/check-session", methods=["GET"])
def check_session():
    if "user_id" not in session:
        return jsonify({"logged_in": False}), 401

    conn = sqlite3.connect("users.db")
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT name FROM users WHERE id = ?",
            (session["user_id"],)
        )
        user = cursor.fetchone()

        if user is None:
            session.clear()
            return jsonify({"logged_in": False}), 401

        return jsonify({
            "logged_in": True,
            "name": user[0]
        }), 200
    finally:
        conn.close()



@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logout successful!"}), 200


init_db()

if __name__ == "__main__":
    app.run(debug=True)
