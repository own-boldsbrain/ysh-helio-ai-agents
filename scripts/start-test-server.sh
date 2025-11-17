#!/bin/bash
cd /home/rookie/projects/coding-agent-template/apps/web
nohup pnpm dev > /tmp/nextjs-test-server.log 2>&1 &
echo $! > /tmp/nextjs-test-server.pid
echo "Servidor iniciado com PID: $(cat /tmp/nextjs-test-server.pid)"
echo "Aguardando servidor inicializar..."
sleep 15
echo "Testando API..."
curl -s http://localhost:3000/api/agents | head -20
