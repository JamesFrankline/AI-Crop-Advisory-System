import requests


data = {
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 28,
    "humidity": 65,
    "ph": 6.5,
    "rainfall": 200
}

API_BASE_URL = "https://ai-crop-advisory-system-0onl.onrender.com"

response = requests.post(
    f"{API_BASE_URL}/predict",
    json=data
)


print("API Response:")
print(response.json())