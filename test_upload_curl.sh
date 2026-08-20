TOKEN=$(npx tsx test_upload.ts)

echo "Uploading..."
UPLOAD=$(curl -s -X POST http://localhost:3000/api/admin/plant-health/upload-image \
-H "Authorization: Bearer $TOKEN" \
-F "image=@/app/applet/package.json")
echo $UPLOAD

URL=$(echo $UPLOAD | grep -o '"url":"[^"]*' | grep -o '[^"]*$')
echo "URL is $URL"
