
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pathlib import Path
import math
import os
import pandas as pd
import joblib
import sqlite3
import psycopg2

from psycopg2 import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash


# =====================================
# APPLICATION CONFIGURATION
# =====================================

BASE_DIR = Path(__file__).resolve().parent

app = Flask(__name__)

DATABASE_PATH = BASE_DIR / "users.db"
DATABASE_URL = os.environ.get("DATABASE_URL")

MODEL_PATH = BASE_DIR / "crop_model.pkl"
CSV_PATH = BASE_DIR / "Crop_recommendation.csv"

app.secret_key = os.environ.get(
    "SECRET_KEY",
    "local-development-only-change-me"
)

# Cross-origin session configuration
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=bool(DATABASE_URL)
)

CORS(
    app,
    origins=["https://jamesfrankline.github.io"],
    supports_credentials=True
)


# =====================================
# DATABASE CONNECTION
# =====================================

def get_db_connection():

    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL)

    return sqlite3.connect(str(DATABASE_PATH))


def init_db():

    conn = get_db_connection()
    cursor = conn.cursor()

    if DATABASE_URL:

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL
            )
        """)

    else:

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL
            )
        """)

    conn.commit()
    cursor.close()
    conn.close()


# =====================================
# LOAD MACHINE LEARNING MODEL
# =====================================

model = joblib.load(MODEL_PATH)

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


# =====================================
# HOME API
# =====================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "AI Crop Advisory ML API is running!",
        "status": "online"
    }), 200


# =====================================
# HEALTH CHECK
# =====================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "healthy",
        "message": "AI Crop Advisory API is working"
    }), 200


# =====================================
# GET AVAILABLE CROPS
# =====================================

@app.route("/crops", methods=["GET"])
def get_crops():

    crops = sorted(
        training_data["label"].dropna().unique().tolist()
    )

    return jsonify({
        "total_crops": len(crops),
        "crops": crops
    }), 200


# =====================================
# CROP PREDICTION
# =====================================

@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json(silent=True)

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

    # =================================
    # INPUT RANGE VALIDATION
    # =================================

    numeric_ranges = {
        "N": (N, 0, 140),
        "P": (P, 5, 145),
        "K": (K, 5, 205),
        "Temperature": (temperature, 8.83, 43.68),
        "Humidity": (humidity, 14.26, 99.98),
        "Soil pH": (ph, 3.50, 9.94),
        "Rainfall": (rainfall, 20.21, 298.56)
    }

    for field, (value, minimum, maximum) in numeric_ranges.items():

        if not math.isfinite(value) or not minimum <= value <= maximum:

            return jsonify({
                "error": f"{field} must be between {minimum} and {maximum}"
            }), 400

    if not math.isfinite(land_area) or land_area <= 0:

        return jsonify({
            "error": "Land area must be greater than 0 acres"
        }), 400

    if (
        not math.isfinite(soil_moisture)
        or not 0 <= soil_moisture <= 100
    ):

        return jsonify({
            "error": "Soil moisture must be between 0 and 100%"
        }), 400

    allowed_soils = [
        "alluvial",
        "black",
        "red",
        "loamy",
        "sandy",
        "clay"
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

    # =================================
    # PREPARE ML MODEL INPUT
    # =================================

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

        # =================================
        # ML PREDICTION
        # =================================

        prediction = model.predict(input_data)

        probabilities = model.predict_proba(input_data)

        predicted_crop = str(prediction[0])

        confidence = float(max(probabilities[0])) * 100

        print("Predicted crop:", predicted_crop)
        print(
            "Class probabilities:",
            dict(zip(model.classes_, probabilities[0]))
        )

        # =================================
        # FIELD SUITABILITY ESTIMATION
        # =================================

        crop_data = training_data[
            training_data["label"] == predicted_crop
        ]

        if crop_data.empty:
            raise ValueError("Crop data not found")

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

            crop_min = float(crop_data[feature].min())
            crop_max = float(crop_data[feature].max())

            value = input_values[feature]

            range_size = crop_max - crop_min

            if crop_min <= value <= crop_max:

                score = 100

            elif range_size == 0:

                score = 0

            elif value < crop_min:

                distance = crop_min - value

                score = max(
                    0,
                    100 - (distance / range_size * 100)
                )

            else:

                distance = value - crop_max

                score = max(
                    0,
                    100 - (distance / range_size * 100)
                )

            scores.append(score)

        suitability = sum(scores) / len(scores)

        # =================================
        # API RESPONSE
        # =================================

        return jsonify({

            "recommended_crop": predicted_crop,

            "confidence": round(confidence, 2),

            "suitability": round(suitability, 2)

        }), 200

    except Exception as e:

        print("Prediction error:", str(e))

        return jsonify({
            "error": "ML prediction failed",
            "details": str(e)
        }), 500


# =====================================
# IOT SENSOR DATA
# =====================================

latest_iot_data = {}


@app.route("/iot-data", methods=["POST"])
def receive_iot_data():

    global latest_iot_data

    data = request.get_json(silent=True)

    if not data:

        return jsonify({
            "error": "No sensor data received"
        }), 400

    try:

        temperature = float(data["temperature"])
        humidity = float(data["humidity"])
        soil_moisture = float(data["soilMoisture"])
        soil_raw = int(data["soilRaw"])

        values = [
            temperature,
            humidity,
            soil_moisture
        ]

        if not all(math.isfinite(value) for value in values):
            raise ValueError("Invalid sensor values")

        if not -40 <= temperature <= 80:
            raise ValueError("Invalid temperature")

        if not 0 <= humidity <= 100:
            raise ValueError("Invalid humidity")

        if not 0 <= soil_moisture <= 100:
            raise ValueError("Invalid soil moisture")

        if not 0 <= soil_raw <= 4095:
            raise ValueError("Invalid soil raw value")

    except (KeyError, TypeError, ValueError):

        return jsonify({
            "error": "Invalid sensor data"
        }), 400

    latest_iot_data = {
        "temperature": temperature,
        "humidity": humidity,
        "soilMoisture": soil_moisture,
        "soilRaw": soil_raw
    }

    print("Received IoT Data:", latest_iot_data)

    return jsonify({
        "message": "IoT data received successfully",
        "sensor_data": latest_iot_data
    }), 200


@app.route("/iot-data", methods=["GET"])
def get_iot_data():

    if not latest_iot_data:

        return jsonify({
            "message": "No IoT data available"
        }), 404

    return jsonify(latest_iot_data), 200


# =====================================
# USER REGISTRATION
# =====================================

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:

        return jsonify({
            "error": "All fields are required."
        }), 400

    if len(password) < 8:

        return jsonify({
            "error": "Password must be at least 8 characters."
        }), 400

    conn = None
    cursor = None

    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        if DATABASE_URL:

            query = """
                INSERT INTO users (name, email, password_hash)
                VALUES (%s, %s, %s)
            """

        else:

            query = """
                INSERT INTO users (name, email, password_hash)
                VALUES (?, ?, ?)
            """

        cursor.execute(
            query,
            (
                name,
                email,
                generate_password_hash(password)
            )
        )

        conn.commit()

        return jsonify({
            "message": "Account created successfully!"
        }), 201

    except (sqlite3.IntegrityError, IntegrityError):

        if conn:
            conn.rollback()

        return jsonify({
            "error": "This email is already registered."
        }), 409

    except Exception as e:

        if conn:
            conn.rollback()

        print("Registration database error:", str(e))

        return jsonify({
            "error": "Database error. Please try again."
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# =====================================
# USER LOGIN
# =====================================

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:

        return jsonify({
            "error": "Email and password are required."
        }), 400

    conn = None
    cursor = None

    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        if DATABASE_URL:
            query = """
                SELECT id, name, password_hash
                FROM users
                WHERE email = %s
            """
        else:
            query = """
                SELECT id, name, password_hash
                FROM users
                WHERE email = ?
            """

        cursor.execute(query, (email,))

        user = cursor.fetchone()

        if user and check_password_hash(user[2], password):

            session.clear()
            session["user_id"] = user[0]

            return jsonify({
                "message": "Login successful!",
                "name": user[1]
            }), 200

        return jsonify({
            "error": "Invalid email or password."
        }), 401

    except Exception as e:

        print("Login database error:", str(e))

        return jsonify({
            "error": "Database error. Please try again."
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# =====================================
# CHECK USER SESSION
# =====================================

@app.route("/check-session", methods=["GET"])
def check_session():

    if "user_id" not in session:

        return jsonify({
            "logged_in": False
        }), 401

    conn = None
    cursor = None

    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        if DATABASE_URL:

            query = """
                SELECT name
                FROM users
                WHERE id = %s
            """

        else:

            query = """
                SELECT name
                FROM users
                WHERE id = ?
            """

        cursor.execute(
            query,
            (session["user_id"],)
        )

        user = cursor.fetchone()

        if user is None:

            session.clear()

            return jsonify({
                "logged_in": False
            }), 401

        return jsonify({
            "logged_in": True,
            "name": user[0]
        }), 200

    except Exception as e:

        print("Session database error:", str(e))

        return jsonify({
            "error": "Database error. Please try again."
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# =====================================
# USER LOGOUT
# =====================================

@app.route("/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({
        "message": "Logout successful!"
    }), 200


# =====================================
# INITIALIZE DATABASE
# =====================================

init_db()


# =====================================
# RUN APPLICATION
# =====================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )
