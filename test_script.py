import requests

url = "http://127.0.0.1:3000"

print("E2E Status...")
print("Checking API Health")
res = requests.get(f"{url}/api/health")
print(res.json())

print("Creating mock buyer")
try:
    buyer = requests.post(f"{url}/api/auth/register-buyer", json={
        "email": "buyer.test2@example.com",
        "password": "password123",
        "full_name": "Test Buyer"
    }).json()
    print("Buyer:", buyer)
except Exception as e:
    print(e)
