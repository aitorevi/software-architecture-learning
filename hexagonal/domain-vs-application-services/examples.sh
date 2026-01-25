#!/bin/bash

# Domain vs Application Services - Ejemplos de Uso
# By El Profe Millo

set -e

BASE_URL="http://localhost:3000"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║      💰 DOMAIN VS APPLICATION SERVICES - EJEMPLOS                    ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Función helper para hacer requests
function api_call() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📡 $1"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Comando:"
  echo "$2"
  echo ""
  echo "Respuesta:"
  eval "$2" | jq '.' 2>/dev/null || eval "$2"
  echo ""
}

# Verificar que el servidor está corriendo
if ! curl -s "$BASE_URL/health" > /dev/null 2>&1; then
  echo "❌ Error: El servidor no está corriendo"
  echo ""
  echo "Por favor, ejecuta primero:"
  echo "  npm run dev"
  echo ""
  exit 1
fi

echo "✅ Servidor detectado en $BASE_URL"
echo ""

# 1. Ver estado inicial de las cuentas
api_call "1. Ver cuentas iniciales (seed data)" \
  "curl -s $BASE_URL/accounts"

# 2. Transferencia exitosa
api_call "2. Transferir 100 EUR de account-1 a account-2" \
  "curl -s -X POST $BASE_URL/transfers \
    -H 'Content-Type: application/json' \
    -d '{\"fromAccountId\":\"account-1\",\"toAccountId\":\"account-2\",\"amount\":100}'"

# 3. Ver cuentas después de transferencia
api_call "3. Ver cuentas después de la transferencia" \
  "curl -s $BASE_URL/accounts"

# 4. Intentar transferencia con fondos insuficientes
api_call "4. Intentar transferencia con fondos insuficientes (debería fallar)" \
  "curl -s -X POST $BASE_URL/transfers \
    -H 'Content-Type: application/json' \
    -d '{\"fromAccountId\":\"account-2\",\"toAccountId\":\"account-1\",\"amount\":9999}'"

# 5. Intentar transferencia a la misma cuenta
api_call "5. Intentar transferencia a la misma cuenta (debería fallar)" \
  "curl -s -X POST $BASE_URL/transfers \
    -H 'Content-Type: application/json' \
    -d '{\"fromAccountId\":\"account-1\",\"toAccountId\":\"account-1\",\"amount\":50}'"

# 6. Crear nueva cuenta
api_call "6. Crear nueva cuenta" \
  "curl -s -X POST $BASE_URL/accounts \
    -H 'Content-Type: application/json' \
    -d '{\"holderName\":\"Carlos López\",\"initialBalance\":2000,\"currency\":\"EUR\"}'"

# 7. Ver todas las cuentas
api_call "7. Ver todas las cuentas (incluyendo la nueva)" \
  "curl -s $BASE_URL/accounts"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║  🎯 PUNTOS CLAVE DEMOSTRADOS                                         ║"
echo "║                                                                      ║"
echo "║  ✅ MoneyTransferService (Domain Service)                            ║"
echo "║     - Valida las reglas de negocio                                   ║"
echo "║     - Ejecuta la transferencia                                       ║"
echo "║     - SIN I/O (no guarda, no notifica)                               ║"
echo "║                                                                      ║"
echo "║  ✅ TransferMoneyUseCase (Application Service)                       ║"
echo "║     - Obtiene cuentas del repositorio (I/O)                          ║"
echo "║     - Llama al Domain Service (delega lógica)                        ║"
echo "║     - Guarda cambios (I/O)                                           ║"
echo "║     - Publica eventos (I/O - si configurado)                         ║"
echo "║     - Envía notificaciones (I/O - si configurado)                    ║"
echo "║                                                                      ║"
echo "║  🧪 TESTING                                                          ║"
echo "║     - Domain Service: testeado SIN mocks                             ║"
echo "║     - Application Service: testeado CON mocks                        ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "💡 Tip: Ejecuta 'npm test' para ver los tests en acción"
echo ""
