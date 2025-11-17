#!/bin/bash

echo "=== Diagnóstico do Erro 500 ==="
echo ""

# 1. Verificar logs do Next.js
echo "1. Últimos erros do Next.js:"
if [ -f /tmp/nextjs-integration-test.log ]; then
    grep -i "error\|exception\|failed" /tmp/nextjs-integration-test.log | tail -20
elif [ -f /tmp/nextjs-dev.log ]; then
    grep -i "error\|exception\|failed" /tmp/nextjs-dev.log | tail -20
fi

echo ""
echo "2. Status do PostgreSQL:"
docker exec coding-agent-template-postgres-1 psql -U postgres -d coding_agent -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';" 2>&1

echo ""
echo "3. Verificar constraint de tasks:"
docker exec coding-agent-template-postgres-1 psql -U postgres -d coding_agent -c "\d tasks" 2>&1 | head -30

echo ""
echo "4. Testar criação manual de task:"
cat <<'EOF' | docker exec -i coding-agent-template-postgres-1 psql -U postgres -d coding_agent
SELECT 
    COUNT(*) as total_tasks,
    MAX(created_at) as last_task
FROM tasks;
EOF

echo ""
echo "5. Verificar usuários no sistema:"
docker exec coding-agent-template-postgres-1 psql -U postgres -d coding_agent -c "SELECT id, email, name FROM users LIMIT 5;" 2>&1

echo ""
echo "=== Fim do Diagnóstico ==="
