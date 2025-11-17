#!/bin/bash

# Dashboard de monitoramento 360° em tempo real

clear
echo "═══════════════════════════════════════════════════════════════"
echo "   🎯 DASHBOARD DE MONITORAMENTO JSON PARSING - 360° COVERAGE"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Verificar se o monitor está rodando
MONITOR_PID=$(ps aux | grep "monitor-json-parsing.sh" | grep -v grep | awk '{print $2}')

if [ -z "$MONITOR_PID" ]; then
    echo "❌ Monitor NÃO está rodando!"
    echo ""
    echo "Para iniciar o monitor:"
    echo "   nohup ./monitor-json-parsing.sh > /tmp/monitor-output.log 2>&1 &"
    exit 1
fi

echo "✅ Monitor ATIVO (PID: $MONITOR_PID)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 ÚLTIMOS RESULTADOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -f /tmp/continuous-monitor.log ]; then
    echo "⚠️  Aguardando primeira execução..."
    exit 0
fi

# Mostrar últimas 100 linhas do log
tail -100 /tmp/continuous-monitor.log | grep -E "(Iteração|PASSOU|FALHOU|Taxa de sucesso|RESUMO|Todos|Passou|Falhou)" | tail -30

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 ESTATÍSTICAS ACUMULADAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Contar sucessos e falhas
TOTAL_SUCCESS=$(grep -c "🎉 TODOS OS TESTES PASSARAM!" /tmp/continuous-monitor.log 2>/dev/null || echo "0")
TOTAL_RUNS=$(grep -c "Iteração #" /tmp/monitor-output.log 2>/dev/null || echo "0")

echo "Total de execuções: $TOTAL_RUNS"
echo "Sucessos: $TOTAL_SUCCESS"
echo "Falhas: $((TOTAL_RUNS - TOTAL_SUCCESS))"

if [ $TOTAL_RUNS -gt 0 ]; then
    PERCENTAGE=$(awk "BEGIN {printf \"%.1f\", ($TOTAL_SUCCESS/$TOTAL_RUNS)*100}")
    echo "Taxa de sucesso: $PERCENTAGE%"
    
    if [ $(echo "$PERCENTAGE == 100" | bc -l) -eq 1 ]; then
        echo ""
        echo "🎉🎉🎉 100% DE COBERTURA ALCANÇADA! 🎉🎉🎉"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 COMANDOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Ver log completo:     tail -f /tmp/continuous-monitor.log"
echo "Ver output do script: tail -f /tmp/monitor-output.log"
echo "Parar monitor:        kill $MONITOR_PID"
echo "Limpar logs:          rm /tmp/continuous-monitor.log /tmp/monitor-output.log"
echo ""
echo "═══════════════════════════════════════════════════════════════"
