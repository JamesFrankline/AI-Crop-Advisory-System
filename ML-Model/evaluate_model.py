import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)


# ================================
# LOAD DATASET
# ================================

data = pd.read_csv("Crop_recommendation.csv")

print("Dataset loaded successfully!")
print("Total records:", len(data))


# ================================
# INPUT AND TARGET
# ================================

X = data[
    [
        "N",
        "P",
        "K",
        "temperature",
        "humidity",
        "ph",
        "rainfall"
    ]
]

y = data["label"]


# ================================
# SPLIT DATA
# ================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# ================================
# LOAD TRAINED MODEL
# ================================

model = joblib.load("crop_model.pkl")

print("Model loaded successfully!")


# ================================
# MAKE PREDICTIONS
# ================================

y_pred = model.predict(X_test)


# ================================
# ACCURACY
# ================================

accuracy = accuracy_score(
    y_test,
    y_pred
)

print("\n==============================")
print("MODEL ACCURACY")
print("==============================")

print(
    "Accuracy:",
    round(accuracy * 100, 2),
    "%"
)


# ================================
# CLASSIFICATION REPORT
# ================================

print("\n==============================")
print("CLASSIFICATION REPORT")
print("==============================")

print(
    classification_report(
        y_test,
        y_pred
    )
)


# ================================
# CONFUSION MATRIX
# ================================

print("\n==============================")
print("CONFUSION MATRIX")
print("==============================")

matrix = confusion_matrix(
    y_test,
    y_pred
)

print(matrix)

# ================================
# SAVE EVALUATION REPORT
# ================================

with open("model_evaluation_report.txt", "w") as file:

    file.write("CROP RECOMMENDATION MODEL EVALUATION\n")
    file.write("====================================\n\n")

    file.write(f"Accuracy: {accuracy * 100:.2f}%\n\n")

    file.write("Classification Report:\n")

    file.write(
        classification_report(y_test, y_pred)
    )

print("\nEvaluation report saved successfully!")