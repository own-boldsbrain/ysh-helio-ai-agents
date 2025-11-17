# GitHub Issues Creation Script

Este script cria automaticamente todas as issues do **Production 360° Coverage** no repositório GitHub.

## 📋 Pré-requisitos

1. **GitHub Token** com permissões:
   - `repo` (full control of private repositories)
   - `workflow` (update GitHub Actions workflows)

2. **Node.js 22+** e **pnpm** instalados

## 🔑 Gerar GitHub Token

1. Acesse: https://github.com/settings/tokens/new
2. Selecione os escopos:
   - ✅ `repo` (full control)
   - ✅ `workflow` (GitHub Actions)
3. Clique em "Generate token"
4. **Copie o token** (aparece apenas uma vez!)

## 🚀 Uso

### Opção 1: Exportar variável de ambiente

```bash
# Exportar token
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Executar script
pnpm tsx scripts/create-github-issues.ts
```

### Opção 2: Inline

```bash
GITHUB_TOKEN="ghp_xxxxx" pnpm tsx scripts/create-github-issues.ts
```

### Opção 3: Persistir no shell

```bash
# Adicionar ao ~/.bashrc ou ~/.zshrc
echo 'export GITHUB_TOKEN="ghp_xxxxx"' >> ~/.bashrc
source ~/.bashrc

# Executar script
pnpm tsx scripts/create-github-issues.ts
```

## 📊 O que o script faz

1. **Cria labels** (bug, feature, critical, high, etc.)
2. **Cria milestones** (Phase 0-5 com deadlines)
3. **Cria issues** organizadas por fase:
   - **Phase 0:** Build Fixes (10 issues) - Semana 1
   - **Phase 1:** Observability (17 issues) - Semanas 2-4
   - **Phase 2:** Core Infrastructure (12 issues) - Semanas 4-8
   - **Phase 3:** Security & Compliance (10 issues) - Semanas 8-12
   - **Phase 4:** Performance & Scalability (7 issues) - Semanas 12-16
   - **Phase 5:** Monitoring & Alerting (10 issues) - Semanas 16-20

**Total: 66 issues principais**

## 🎯 Issues Criadas

O script cria uma **amostra representativa** das 192 issues documentadas em `PRODUCTION_COVERAGE_360.md`:

### Phase 0: Build Fixes (CRITICAL)

- P0-001: Fix type error home-page-header.tsx:132
- P0-002: Fix type error home-page-header.tsx:186
- P0-003: Fix type error tasks-list-client.tsx:129
- P0-004-010: Test fixes, strict mode, production build

### Phase 1: Observability

- P1-001: Implement Pino Logger infrastructure
- P1-002: Replace console.log with Pino logger
- P1-011: Implement Prometheus metrics
- P1-031: Implement Jaeger distributed tracing
- + Logging para diferentes módulos

### Phase 2: Core Infrastructure

- P2-001: Implement health checks for sandboxes
- P2-002: Implement timeout handling
- P2-045: Implement database transactions
- P2-051: Implement automated database backups
- + Resource limits, garbage collection

### Phase 3: Security & Compliance

- P3-001: Integrate HashiCorp Vault
- P3-010: Implement MFA
- P3-015: Implement RBAC
- P3-025-028: SQL injection, XSS, CSRF, security headers

### Phase 4: Performance

- P4-001: Implement Redis cache layer
- P4-010: Optimize database queries
- P4-017: Implement rate limiting

### Phase 5: Monitoring

- P5-001: Setup production Prometheus & Grafana
- P5-003: Setup Loki log aggregation
- P5-010-016: Alert rules

## 📈 Progresso Esperado

```tsx
✅ Labels created
✅ Milestones created
✅ 66 issues created

🔗 View issues: https://github.com/own-boldsbrain/ysh-helio-ai-agents/issues
```

## ⚠️ Rate Limiting

O script inclui um **delay de 500ms** entre cada issue para evitar rate limiting do GitHub API.

Tempo estimado: ~35 segundos para 66 issues

## 🔧 Troubleshooting

### Error: GITHUB_TOKEN not set

```bash
export GITHUB_TOKEN="ghp_xxxxx"
```

### Error: Permission denied

Verifique se seu token tem as permissões corretas:
- `repo` (full control)
- `workflow`

### Error: Rate limited

Aguarde 1 hora ou use um token com limite maior (conta Pro/Team)

### Labels já existem

O script detecta labels existentes e pula a criação com mensagem `⏭️ Label already exists`

## 📝 Próximos Passos

Após criar as issues:

1. **Organize no GitHub Projects**
   - Criar board Kanban
   - Adicionar campos customizados (Effort, Status)
   
2. **Assign Issues**
   - Distribuir entre equipe
   - Priorizar Phase 0 (bloqueadores)

3. **Start Development**
   - Começar com P0 (build fixes)
   - Seguir ordem das phases

## 📚 Documentação Relacionada

- [PRODUCTION_COVERAGE_360.md](../PRODUCTION_COVERAGE_360.md) - Lista completa de 192 issues
- [GITHUB_ISSUES_SETUP.md](../GITHUB_ISSUES_SETUP.md) - Guia de setup
- [IMPLEMENTATION_CHECKLIST.md](../IMPLEMENTATION_CHECKLIST.md) - Checklist de implementação

## 🎉 Sucesso!

Se tudo correr bem, você verá:

```
🚀 Creating GitHub Issues for Production 360° Coverage
📦 Repository: own-boldsbrain/ysh-helio-ai-agents

📋 Creating labels...
  ✅ Created label: bug
  ✅ Created label: feature
  ...

🎯 Creating milestones...
  ✅ Created milestone: Phase 0: Build Fixes (1)
  ...

=== PHASE 0: BUILD FIXES (10 issues) ===
  ✅ Created P0-001: Fix type error home-page-header.tsx:132
  ✅ Created P0-002: Fix type error home-page-header.tsx:186
  ...

✅ GitHub issues created successfully!
📊 Total issues created: 66

🔗 View issues at: https://github.com/own-boldsbrain/ysh-helio-ai-agents/issues
```
