#!/bin/bash

# Monitor contínuo 360° de JSON parsing
# Roda testes a cada 30 segundos e monitora erros em tempo real

echo "🎯 Monitoramento 360° ativado"
echo "========================================"
echo "Frequência: A cada 30 segundos"
echo "Comandos: Ctrl+C para parar"
echo ""

ITERATION=1
TOTAL_PASS=0
TOTAL_FAIL=0

while true; do
    echo "=========================================="
    echo "🔄 Iteração #$ITERATION - $(date '+%H:%M:%S')"
    echo "=========================================="
    
    # Executar testes live
    /home/rookie/projects/coding-agent-template/test-live-api.sh 2>&1 | tee -a /tmp/continuous-monitor.log
    
    # Capturar status do último teste
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        ((TOTAL_PASS++))
        echo "✅ Iteração $ITERATION: SUCESSO"
    else
        ((TOTAL_FAIL++))
        echo "❌ Iteração $ITERATION: FALHA"
    fi
    
    # Estatísticas acumuladas
    echo ""
    echo "📊 Estatísticas Gerais:"
    echo "   ✅ Sucessos: $TOTAL_PASS"
    echo "   ❌ Falhas: $TOTAL_FAIL"
    TOTAL=$((TOTAL_PASS + TOTAL_FAIL))
    if [ $TOTAL -gt 0 ]; then
        PERCENTAGE=$(awk "BEGIN {printf \"%.1f\", ($TOTAL_PASS/$TOTAL)*100}")
        echo "   📈 Taxa de sucesso: $PERCENTAGE%"
    fi
    
    ((ITERATION++))
    
    echo ""
    echo "⏰ Próxima execução em 30 segundos..."
    echo "   (Ctrl+C para parar o monitoramento)"
    sleep 30
done
