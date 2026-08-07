# Login
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"seller3@example.com","password":"password123"}')
TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*' | grep -o '[^"]*$')

# Get a category
CAT_RES=$(curl -s -X GET http://localhost:3000/api/categories)
CAT_ID=$(echo $CAT_RES | grep -o '"id":"[^"]*' | head -n 1 | grep -o '[^"]*$')

# Create product
PROD_RES=$(curl -s -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"category_id":"'$CAT_ID'","title":"Test Multiple","description":"Desc","price":20,"stock_quantity":5,"unit_of_measure":"kg"}')

PROD_ID=$(echo $PROD_RES | grep -o '"id":"[^"]*' | grep -o '[^"]*$')
echo "Product ID: $PROD_ID"

# Upload images
echo "fake image 1" > dummy1.jpg
echo "fake image 2" > dummy2.jpg

curl -s -X POST http://localhost:3000/api/products/$PROD_ID/images \
  -H "Authorization: Bearer $TOKEN" \
  -F "images=@dummy1.jpg" \
  -F "images=@dummy2.jpg"

