import pandas as pd
import joblib


# ================================
# LOAD MODEL
# ================================

model = joblib.load("crop_model.pkl")

print("Model loaded successfully!")


# ================================
# FEATURE NAMES
# ================================

features = [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "rainfall"
]


# ================================
# GET FEATURE IMPORTANCE
# ================================

importance = model.feature_importances_


# ================================
# DISPLAY RESULTS
# ================================

print("\n==============================")
print("FEATURE IMPORTANCE")
print("==============================")

for feature, value in zip(features, importance):

    print(
        feature,
        ":",
        round(value * 100, 2),
        "%"
    )