# GitHub Project Setup Guide

## Visão Geral

Este guia explica como criar e configurar um GitHub Project (v2) board Kanban para gerenciar as 248 issues da cobertura 360°.

## Pré-requisitos

### 1. Token do GitHub com Scope "project"

O token atual pode não ter permissão para criar Projects. Você precisa:

1. Acessar: https://github.com/settings/tokens
2. Encontrar o token existente ou criar um novo
3. **Marcar as seguintes permissões:**
   - ✅ `repo` (Full control)
   - ✅ `project` (Full control) ← **IMPORTANTE**
   - ✅ `workflow` (opcional)

4. Regenerar o token se necessário
5. Copiar o novo token

### 2. Configurar o Token

```bash
export GITHUB_TOKEN='ghp_seu_novo_token_aqui'
```

## Executar o Script

```bash
pnpm tsx scripts/create-github-project.ts
```

## O Que o Script Faz

### 1. Cria o Project Board

- **Nome**: "Production 360° Coverage"
- **Descrição**: Roadmap completo para infraestrutura production-grade
- **Tipo**: Project v2 (novo formato do GitHub)

### 2. Configura Campos Customizados

#### Status (padrão do GitHub)

- 📋 Backlog
- 🏗️ Todo
- 🚧 In Progress
- 👀 In Review
- ✅ Done

#### Priority (custom)

- 🔴 Critical
- 🟠 High
- 🟡 Medium
- 🟢 Low

#### Phase (custom)

- Phase 0: Build Fixes
- Phase 1: Observability
- Phase 2: Core Infrastructure
- Phase 3: Security & Compliance
- Phase 4: Performance & Scalability
- Phase 5: Monitoring & Alerting

#### Category (custom)

- Build & Type Safety
- Logging & Observability
- Docker Sandbox
- Auth & Authorization
- Database & Data
- Security & Compliance
- Performance & Scalability
- Monitoring & Alerting

#### Effort (hours) (custom)

- Campo numérico para tracking de horas

### 3. Adiciona Todas as Issues ao Project

O script automaticamente:

- Busca todas as 248+ issues do repositório
- Adiciona cada uma ao Project board
- Preserva labels, milestones e assignees existentes

## Próximos Passos (Manual)

Após executar o script, você precisa configurar manualmente no GitHub:

### 1. Acessar o Project

Abra: https://github.com/own-boldsbrain/ysh-helio-ai-agents/projects

### 2. Configurar Views

#### View 1: Kanban Board (padrão)

- Já criada automaticamente
- Organizada por Status (Backlog → Done)
- Recomendado: Agrupar por Phase

#### View 2: Table View

1. Clicar em "+" ao lado de "Board"
2. Selecionar "New table view"
3. Mostrar colunas:
   - Title
   - Status
   - Priority
   - Phase
   - Category
   - Effort (hours)
   - Assignee
   - Labels

#### View 3: Roadmap View

1. Clicar em "+" ao lado de views
2. Selecionar "New roadmap view"
3. Configurar:
   - Group by: Phase
   - Timeline: Milestones
   - Zoom: Months

### 3. Configurar Automações

GitHub Projects v2 permite automações via workflows. Exemplos:

#### Auto-move para "In Progress" quando issue atribuída

```yaml
# .github/workflows/project-automation.yml
name: Project Automation

on:
  issues:
    types: [assigned]

jobs:
  move-to-in-progress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v7
        with:
          script: |
            // Move issue to "In Progress" status
```

#### Auto-move para "Done" quando issue fechada

- GitHub já faz isso automaticamente!

### 4. Filtros Recomendados

#### Ver apenas Phase 0 (crítico)

```tsx
phase:"Phase 0: Build Fixes"
```

#### Ver apenas Critical/High priority

```tsx
priority:Critical OR priority:High
```

#### Ver issues sem assignee

```tsx
no:assignee
```

## Estrutura do Board Recomendada

### Coluna "Backlog"

- Issues não priorizadas
- Aguardando mais informações
- Baixa prioridade (Low)

### Coluna "Todo"

- Issues prontas para começar
- Todas as dependências resolvidas
- Assignee pode estar vazio

### Coluna "In Progress"

- Issues com assignee
- Trabalho ativo acontecendo
- Máximo 3-5 issues por pessoa

### Coluna "In Review"

- PR aberto
- Aguardando code review
- Aguardando testes

### Coluna "Done"

- Issue fechada
- PR merged
- Testes passando

## Dicas de Uso

### 1. Daily Standup

Use a view Kanban filtrada por assignee:

```
assignee:@me status:"In Progress"
```

### 2. Sprint Planning

Use a view Table ordenada por:

1. Priority (desc)
2. Effort (asc)

### 3. Burndown Chart

GitHub Projects v2 tem insights nativos!

- Acessar: Project → Insights
- Ver: Issues closed over time

### 4. Velocity Tracking

Criar custom field "Story Points" e trackear:

- Completed story points por semana
- Average velocity por sprint

## Troubleshooting

### Erro: "Resource not accessible by personal access token"

**Solução**: Token precisa do scope `project`. Regenere o token.

### Erro: "Project already exists"

**Solução**: Abra o project existente manualmente e adicione issues.

### Issues não aparecem no board

**Solução**:

1. Verifique se as issues estão abertas (open)
2. Use o filtro `is:open` na view
3. Remova filtros de Phase/Category

### Campos customizados não aparecem

**Solução**: Refresh da página. GitHub Projects v2 tem cache.

## Alternativa: Criação Manual

Se o script falhar, você pode criar manualmente:

### 1. Criar Project

1. Ir para https://github.com/own-boldsbrain/ysh-helio-ai-agents
2. Clicar em "Projects"
3. Clicar em "New project"
4. Escolher "Board" template
5. Nomear: "Production 360° Coverage"

### 2. Adicionar Issues

1. Na view Board, clicar em "+"
2. Pesquisar issues por número ou título
3. Adicionar uma por uma (ou usar bulk select)

### 3. Criar Campos Customizados

1. Clicar em "+" ao lado dos campos
2. Escolher tipo (Single select, Number, etc.)
3. Adicionar opções
4. Salvar

## Links Úteis

- **GitHub Projects Docs**: https://docs.github.com/en/issues/planning-and-tracking-with-projects
- **GraphQL API Explorer**: https://docs.github.com/en/graphql/overview/explorer
- **Project Automation**: https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project

---

**Preparado por**: GitHub Copilot  
**Data**: 17 Nov 2025  
**Status**: ✅ Pronto para execução
