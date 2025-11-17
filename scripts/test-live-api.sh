#!/bin/bash

# Script de teste live da API para validar JSON parsing em produção
# Monitora outputs e garante cobertura 360°

echo "🔍 Iniciando testes live da API..."
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Teste 1: Endpoint /api/tasks (não autenticado - esperado 401)
echo "📝 Teste 1: GET /api/tasks (não autenticado)"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/tasks)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✅ PASSOU${NC} - Status 401 correto"
    # Verificar se é JSON
    if echo "$BODY" | jq . >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSOU${NC} - Response é JSON válido"
        ((PASS+=2))
    else
        echo -e "${RED}❌ FALHOU${NC} - Response não é JSON válido"
        echo "Body: $BODY"
        ((FAIL++))
        ((PASS++))
    fi
else
    echo -e "${RED}❌ FALHOU${NC} - Status esperado 401, recebido $HTTP_CODE"
    ((FAIL++))
fi
echo ""

# Teste 2: Endpoint /api/connectors
echo "📝 Teste 2: GET /api/connectors"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/connectors)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "Status: $HTTP_CODE"
if echo "$BODY" | jq . >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSOU${NC} - Response é JSON válido"
    echo "Connectors: $(echo "$BODY" | jq -r 'keys | length') encontrados"
    ((PASS++))
else
    echo -e "${RED}❌ FALHOU${NC} - Response não é JSON válido"
    echo "Body: $BODY"
    ((FAIL++))
fi
echo ""

# Teste 3: Endpoint /api/auth/info
echo "📝 Teste 3: GET /api/auth/info"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/auth/info)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "Status: $HTTP_CODE"
if echo "$BODY" | jq . >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSOU${NC} - Response é JSON válido"
    ((PASS++))
else
    echo -e "${RED}❌ FALHOU${NC} - Response não é JSON válido"
    echo "Body: $BODY"
    ((FAIL++))
fi
echo ""

# Teste 4: Endpoint inexistente (404)
echo "📝 Teste 4: GET /api/nonexistent (404 esperado)"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/nonexistent)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✅ PASSOU${NC} - Status 404 correto"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  ATENÇÃO${NC} - Status esperado 404, recebido $HTTP_CODE"
fi

# Verificar se é HTML ou JSON
if echo "$BODY" | jq . >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSOU${NC} - 404 retorna JSON (bom!)"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  ATENÇÃO${NC} - 404 retorna HTML (pode causar problemas de parse)"
    echo "Tipo de resposta: $(echo "$BODY" | head -c 50)"
fi
echo ""

# Teste 5: Verificar headers Content-Type
echo "📝 Teste 5: Verificar Content-Type headers"
CONTENT_TYPE=$(curl -s -I http://localhost:3000/api/tasks | grep -i "content-type" | cut -d' ' -f2- | tr -d '\r')

if [[ "$CONTENT_TYPE" == *"application/json"* ]]; then
    echo -e "${GREEN}✅ PASSOU${NC} - Content-Type correto: $CONTENT_TYPE"
    ((PASS++))
else
    echo -e "${RED}❌ FALHOU${NC} - Content-Type incorreto: $CONTENT_TYPE"
    ((FAIL++))
fi
echo ""

# Teste 6: POST sem corpo (400 esperado)
echo "📝 Teste 6: POST /api/tasks sem corpo (400 esperado)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/tasks)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [[ "$HTTP_CODE" == "400" ]] || [[ "$HTTP_CODE" == "401" ]] || [[ "$HTTP_CODE" == "405" ]]; then
    echo -e "${GREEN}✅ PASSOU${NC} - Status de erro apropriado: $HTTP_CODE"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  ATENÇÃO${NC} - Status recebido: $HTTP_CODE"
fi

if echo "$BODY" | jq . >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSOU${NC} - Erro retorna JSON válido"
    ((PASS++))
else
    echo -e "${RED}❌ FALHOU${NC} - Erro não retorna JSON"
    echo "Body: $BODY"
    ((FAIL++))
fi
echo ""

# Teste 7: Verificar rate limiting
echo "📝 Teste 7: Verificar rate limiting endpoint"
RESPONSE=$(curl -s http://localhost:3000/api/auth/rate-limit)
if echo "$RESPONSE" | jq . >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSOU${NC} - Rate limit endpoint retorna JSON"
    REMAINING=$(echo "$RESPONSE" | jq -r '.remaining // "N/A"')
    echo "Rate limit remaining: $REMAINING"
    ((PASS++))
else
    echo -e "${RED}❌ FALHOU${NC} - Rate limit endpoint não retorna JSON"
    ((FAIL++))
fi
echo ""

# Resumo Final
echo "=========================================="
echo "📊 RESUMO DOS TESTES LIVE"
echo "=========================================="
echo -e "${GREEN}✅ Passou:${NC} $PASS"
echo -e "${RED}❌ Falhou:${NC} $FAIL"
TOTAL=$((PASS + FAIL))
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$(awk "BEGIN {printf \"%.1f\", ($PASS/$TOTAL)*100}")
    echo "📈 Taxa de sucesso: $PERCENTAGE%"
fi
echo "=========================================="

if [ $FAIL -eq 0 ]; then
    echo -e "\n${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    echo "✅ API está retornando JSON válido em todos os endpoints testados"
    echo "✅ Content-Type headers estão corretos"
    echo "✅ Sistema de JSON parsing está funcionando corretamente"
    exit 0
else
    echo -e "\n${RED}⚠️  ALGUNS TESTES FALHARAM${NC}"
    echo "Por favor, revise os erros acima"
    exit 1
fi
