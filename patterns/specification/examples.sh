#!/bin/bash

# Script de ejemplos para demostrar el Specification Pattern
# Asegúrate de que el servidor esté corriendo: npm run dev

BASE_URL="http://localhost:3000"

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║         🎯 SPECIFICATION PATTERN - EJEMPLOS                      ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

echo "📦 Creando productos de ejemplo..."
echo ""

# Crear productos
echo "1. iPhone 15 Pro (electronics, 1199, stock: 50)"
curl -s -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "price": 1199,
    "category": "electronics",
    "stock": 50,
    "tags": ["apple", "smartphone", "5G", "premium"]
  }' | jq '.'

echo ""
echo "2. Samsung Galaxy S24 (electronics, 899, stock: 30)"
curl -s -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Samsung Galaxy S24",
    "price": 899,
    "category": "electronics",
    "stock": 30,
    "tags": ["samsung", "smartphone", "android"]
  }' | jq '.'

echo ""
echo "3. Mesa de oficina (furniture, 250, stock: 0)"
curl -s -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mesa de oficina",
    "price": 250,
    "category": "furniture",
    "stock": 0,
    "tags": ["office", "wood"]
  }' | jq '.'

echo ""
echo "4. Silla ergonómica (furniture, 350, stock: 15)"
curl -s -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Silla ergonómica",
    "price": 350,
    "category": "furniture",
    "stock": 15,
    "tags": ["office", "ergonomic"]
  }' | jq '.'

echo ""
echo "5. MacBook Pro (electronics, 2499, stock: 20)"
curl -s -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro",
    "price": 2499,
    "category": "electronics",
    "stock": 20,
    "tags": ["apple", "laptop", "premium"]
  }' | jq '.'

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo ""
echo "🔍 EJEMPLOS DE BÚSQUEDA CON ESPECIFICACIONES"
echo ""

echo "1️⃣  Todos los productos electrónicos:"
echo "   Specification: CategorySpecification('electronics')"
echo ""
curl -s "$BASE_URL/products/search?category=electronics" | jq '.products[] | {name, price, category}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "2️⃣  Productos con precio menor a 1000:"
echo "   Specification: PriceLessThanSpecification(1000)"
echo ""
curl -s "$BASE_URL/products/search?maxPrice=1000" | jq '.products[] | {name, price}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "3️⃣  Solo productos en stock:"
echo "   Specification: InStockSpecification()"
echo ""
curl -s "$BASE_URL/products/search?inStock=true" | jq '.products[] | {name, stock}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "4️⃣  Electrónicos baratos en stock (composición AND):"
echo "   Specification: CategorySpec('electronics')"
echo "                  .and(PriceLessThanSpec(1000))"
echo "                  .and(InStockSpec())"
echo ""
curl -s "$BASE_URL/products/search?category=electronics&maxPrice=1000&inStock=true" | jq '.products[] | {name, price, stock}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "5️⃣  Productos que contengan 'Pro' en el nombre:"
echo "   Specification: NameContainsSpecification('Pro')"
echo ""
curl -s "$BASE_URL/products/search?name=Pro" | jq '.products[] | {name}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "6️⃣  Productos con tag 'premium':"
echo "   Specification: HasTagSpecification('premium')"
echo ""
curl -s "$BASE_URL/products/search?tag=premium" | jq '.products[] | {name, tags}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "7️⃣  Rango de precio: entre 300 y 1000:"
echo "   Specification: PriceGreaterThanSpec(300)"
echo "                  .and(PriceLessThanSpec(1000))"
echo ""
curl -s "$BASE_URL/products/search?minPrice=300&maxPrice=1000" | jq '.products[] | {name, price}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "8️⃣  Búsqueda compleja: Electrónicos premium en stock"
echo "   Specification: CategorySpec('electronics')"
echo "                  .and(HasTagSpec('premium'))"
echo "                  .and(InStockSpec())"
echo ""
curl -s "$BASE_URL/products/search?category=electronics&tag=premium&inStock=true" | jq '.products[] | {name, price, tags, stock}'

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo ""
echo "✨ Mira tú cómo cada búsqueda usa especificaciones diferentes"
echo "   que se combinan dinámicamente. Eso es la magia del patrón."
echo ""
echo "💡 La misma lógica funciona en memoria, en BD, en validación..."
echo "   ¡Reutilización al máximo, mi niño!"
echo ""
echo "🚀 Próximo paso: Abre el código y ve cómo están implementadas."
echo ""
echo "-- El Profe Millo"
echo ""
