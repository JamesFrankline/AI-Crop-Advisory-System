import pandas as pd
import joblib
import matplotlib.pyplot as plt


# ================================
# LOAD MODEL
# ================================

model = joblib.load("crop_model.pkl")


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
# FEATURE IMPORTANCE
# ================================

importance = model.feature_importances_


# ================================
# CREATE DATAFRAME
# ================================

df = pd.DataFrame({
    "Feature": features,
    "Importance": importance * 100
})


# ================================
# SORT FEATURES
# ================================

df = df.sort_values(
    by="Importance",
    ascending=True
)


# ================================
# CREATE GRAPH
# ================================

plt.figure(figsize=(9, 6))

plt.barh(
    df["Feature"],
    df["Importance"]
)

plt.xlabel("Importance (%)")

plt.ylabel("Agricultural Parameter")

plt.title(
    "Random Forest Feature Importance"
)

plt.tight_layout()

plt.savefig(
    "feature_importance.png",
    dpi=300,
    bbox_inches="tight"
)

plt.show()