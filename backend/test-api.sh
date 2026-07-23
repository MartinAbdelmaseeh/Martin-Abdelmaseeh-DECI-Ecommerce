
BASE="http://localhost:5000/api"
JAR="cookies.txt"
rm -f "$JAR"

echo "== Health check =="
curl -s $BASE/health; echo -e "\n"

echo "== Register a customer (expect 201) =="
curl -s -c "$JAR" -X POST $BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'; echo -e "\n"

echo "== Register with same email again (expect 400, duplicate) =="
curl -s -X POST $BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'; echo -e "\n"

echo "== Login (expect 200, sets cookie) =="
curl -s -c "$JAR" -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'; echo -e "\n"

echo "== Login with wrong password (expect 400) =="
curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpass"}'; echo -e "\n"

echo "== Get current user /me (expect 200, uses cookie) =="
curl -s -b "$JAR" $BASE/auth/me; echo -e "\n"

echo "== Get products, no auth needed (expect 200, array + pagination) =="
PRODUCTS_RESPONSE=$(curl -s "$BASE/products?limit=5&sortBy=price&order=ASC")
echo "$PRODUCTS_RESPONSE"; echo -e "\n"

PRODUCT_ID=$(echo "$PRODUCTS_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$PRODUCT_ID" ]; then
  echo "⚠️  No products found — run schema.sql first (it seeds two sample products)."
  echo "Stopping here since the rest of the script needs a real product ID."
  rm -f "$JAR"
  exit 1
fi
echo "Using PRODUCT_ID=$PRODUCT_ID for the rest of this run"; echo -e "\n"

echo "== Try creating a product as a non-admin (expect 403) =="
curl -s -b "$JAR" -X POST $BASE/products \
  -H "Content-Type: application/json" \
  -d '{"title":"Hacker Product","price":1}'; echo -e "\n"

echo "== Add product to cart (expect 200) =="
curl -s -b "$JAR" -X POST $BASE/cart/add \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":2}"; echo -e "\n"

echo "== Get cart (expect 200, one item, quantity 2) =="
curl -s -b "$JAR" $BASE/cart; echo -e "\n"

echo "== Access cart with no cookie (expect 401) =="
curl -s $BASE/cart; echo -e "\n"

echo "== Place an order from the cart (expect 201) =="
curl -s -b "$JAR" -X POST $BASE/orders \
  -H "Content-Type: application/json"; echo -e "\n"

echo "== Cart should now be empty (expect 200, empty array) =="
curl -s -b "$JAR" $BASE/cart; echo -e "\n"

echo "== Get my orders (expect 200, one order with items) =="
curl -s -b "$JAR" $BASE/orders/my-orders; echo -e "\n"

echo "== Logout (expect 200) =="
curl -s -b "$JAR" -X POST $BASE/auth/logout; echo -e "\n"

echo "== Hit a route that doesn't exist (expect 404) =="
curl -s $BASE/nonsense; echo -e "\n"

rm -f "$JAR"
echo "Done."