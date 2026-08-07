# Login
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"seller3@example.com","password":"password123"}')
TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
    echo "Login failed, registering..."
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register/seller -H "Content-Type: application/json" -d '{"email":"seller3@example.com","password":"password123","full_name":"Test","business_name":"Test Farm","phone_number":"123","address":"123","location":"123"}')
    TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*' | grep -o '[^"]*$')
fi

# Make sure seller is verified
node -e "
const { Client } = require('pg');
const url = process.env.DATABASE_URL.replace('[irene@2026@NDANGA]', 'irene%402026%40NDANGA');
const client = new Client({ connectionString: url });
client.connect().then(() => client.query(\"UPDATE sellers SET status = 'verified'\")).then(() => client.end());
"

# Get a category
CAT_RES=$(curl -s -X GET http://localhost:3000/api/categories)
CAT_ID=$(echo $CAT_RES | grep -o '"id":"[^"]*' | head -n 1 | grep -o '[^"]*$')

# Create product
PROD_RES=$(curl -s -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"category_id":"'$CAT_ID'","title":"Test Prod","description":"Desc","price":10,"stock_quantity":10,"unit_of_measure":"kg"}')

echo "Product Res: $PROD_RES"
PROD_ID=$(echo $PROD_RES | grep -o '"id":"[^"]*' | grep -o '[^"]*$')

echo "Product ID: $PROD_ID"

# Upload image
echo "fake image content" > dummy.jpg
echo "Uploading image..."
curl -s -X POST http://localhost:3000/api/products/$PROD_ID/images \
  -H "Authorization: Bearer $TOKEN" \
  -F "images=@dummy.jpg"

