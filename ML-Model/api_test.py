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


response = requests.post(
    "http://127.0.0.1:5000/predict",
    json=data
)


print("API Response:")
print(response.json())