#!/bin/bash
# Script para iniciar ambiente de testes

set -e

echo "=== Iniciando Ambiente de Testes ==="
echo ""

# 1. Verificar PostgreSQL
echo "1. Verificando PostgreSQL..."
if docker ps | grep -q "coding-agent-template-postgres"; then
    echo "✅ PostgreSQL está rodando na porta 5434"
else
    echo "❌ PostgreSQL não está rodando"
    exit 1
fi

# 2. Limpar processos antigos
echo ""
echo "2. Limpando processos antigos..."
pkill -9 -f "next dev" 2>/dev/null || true
rm -rf /home/rookie/projects/coding-agent-template/apps/web/.next/dev/lock 2>/dev/null || true

# 3. Iniciar Next.js
echo ""
echo "3. Iniciando servidor Next.js..."
cd /home/rookie/projects/coding-agent-template/apps/web
nohup pnpm dev > /tmp/nextjs-integration-test.log 2>&1 &
SERVER_PID=$!
echo "Servidor iniciado com PID: $SERVER_PID"
echo $SERVER_PID > /tmp/nextjs-integration-test.pid

# 4. Aguardar servidor
echo ""
echo "4. Aguardando servidor inicializar (30 segundos)..."
for i in {1..30}; do
    sleep 1
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Servidor está respondendo!"
        break
    fi
    echo -n "."
done
echo ""

# 5. Testar API
echo ""
echo "5. Testando endpoint /api/agents..."
HTTP_STATUS=$(curl -s -o /tmp/api-test.json -w "%{http_code}" http://localhost:3000/api/agents)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ API está funcionando (HTTP $HTTP_STATUS)"
    cat /tmp/api-test.json | jq '.' 2>/dev/null || cat /tmp/api-test.json
else
    echo "❌ API retornou HTTP $HTTP_STATUS"
    tail -20 /tmp/nextjs-integration-test.log
    exit 1
fi

echo ""
echo "=== Ambiente Pronto! ==="
echo "Servidor rodando: http://localhost:3000"
echo "PID do servidor: $(cat /tmp/nextjs-integration-test.pid)"
echo "Logs: tail -f /tmp/nextjs-integration-test.log"
echo ""
echo "Para parar:"
echo "  kill \$(cat /tmp/nextjs-integration-test.pid)"
