import pandas as pd
import joblib


# Load trained model
model = joblib.load("crop_model.pkl")


# Test input
input_data = pd.DataFrame([{
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 28,
    "humidity": 65,
    "ph": 6.5,
    "rainfall": 200
}])


# Make prediction
prediction = model.predict(input_data)


print("Recommended Crop:", prediction[0])