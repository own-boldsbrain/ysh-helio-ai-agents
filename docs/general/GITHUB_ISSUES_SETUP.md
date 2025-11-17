# 🐙 GitHub Issues Setup - Production 360°

**Data:** 17 Nov 2025  
**Objetivo:** Criar 192 issues no GitHub automaticamente

---

## ⚡ QUICK START

### Opção 1: Usar GitHub CLI (Recomendado)

#### 1. Instalar GitHub CLI

```bash
# macOS
brew install gh

# Linux (Debian/Ubuntu)
sudo apt install gh

# Outros sistemas
https://github.com/cli/cli#installation
```

#### 2. Autenticar

```bash
gh auth login
# Selecionar: GitHub.com
# Selecionar: HTTPS
# Autorizar
```

#### 3. Executar script de criação

```bash
cd /home/rookie/projects/coding-agent-template

# Listar repositórios
gh repo list

# Executar script (ajustar OWNER/REPO conforme necessário)
bash create_issues.sh
```

### Opção 2: Usar Python Script

#### 1. Instalar dependências

```bash
pip install requests
```

#### 2. Gerar token GitHub

```plaintext
https://github.com/settings/tokens/new
Permissões: repo, workflow, read:org
```

#### 3. Executar script

```bash
python3 /tmp/create_github_issues.py \
  <seu_token> \
  own-boldsbrain \
  ysh-helio-ai-agents
```

---

## 📋 ISSUES A CRIAR

### Phase 0: Build Fixes (Week 1)

```plaintext
P0-001: Fix type error home-page-header.tsx:132 .......... 1h
P0-002: Fix type error home-page-header.tsx:186 .......... 0.5h
P0-003: Fix type error tasks-list-client.tsx:129 ........ 0.5h
P0-010: Verify production build passes .................. 2h
```

### Phase 1: Observability (Weeks 2-4)

```plaintext
P1-001: Implement Pino Logger infrastructure ............ 8h
P1-002: Replace console.log throughout codebase ........ 20h
P1-011: Implement Prometheus metrics collection ........ 12h
P1-031: Implement Jaeger distributed tracing ........... 8h
```

### Phase 2: Core Infrastructure (Weeks 4-8)

```plaintext
P2-001: Implement health checks for sandboxes ........... 6h
P2-045: Implement database transactions ................ 12h
P2-051: Implement automated database backups ........... 8h
```

### Phase 3: Security & Compliance (Weeks 8-12)

```plaintext
P3-001: Integrate HashiCorp Vault ..................... 16h
P3-025: Implement SQL injection prevention ............ 4h
```

### Phase 4: Performance & Scalability (Weeks 12-16)

```plaintext
P4-001: Implement Redis cache layer .................. 12h
P4-010: Analyze and optimize slow queries ............ 8h
```

### Phase 5: Monitoring & Alerting (Weeks 16-20)

```plaintext
P5-001: Setup production Prometheus & Grafana ........ 12h
P5-010: Create alert for high error rate ............ 2h
```

---

## 🔑 GITHUB TOKEN SETUP

### 1. Criar Token

```plaintext
1. Ir para: https://github.com/settings/tokens/new
2. Selecionar escopos:
   - ☑️ repo (full control)
   - ☑️ workflow (GitHub Actions)
   - ☑️ read:org (read:org)
3. Clicar "Generate token"
4. Copiar token (aparece uma só vez!)
```

### 2. Configurar variável de ambiente

```bash
# Para sessão atual
export GITHUB_TOKEN="ghp_xxxxx..."

# Para persistir (adicionar ao ~/.bashrc ou ~/.zshrc)
echo 'export GITHUB_TOKEN="ghp_xxxxx..."' >> ~/.bashrc
source ~/.bashrc
```

### 3. Testar autenticação

```bash
gh auth status
# Deverá mostrar: Logged in to github.com as [seu_user]
```

---

## 📊 CRIAR ISSUES EM MASSA

### Método 1: Script Shell (Mais Fácil)

```bash
# Executar script
bash /home/rookie/projects/coding-agent-template/create_issues.sh

# Resultado esperado
✅ Created P0-001
✅ Created P0-002
✅ Created P0-003
...
✅ GitHub issues created successfully!
```

### Método 2: Manual via GitHub CLI

```bash
# Criar uma issue
gh issue create \
  --repo own-boldsbrain/ysh-helio-ai-agents \
  --title "P0-001: Fix type error home-page-header.tsx:132" \
  --body "## Problem
error property accessed without type guard

## Solution
Add type guard before property access

## Effort: 1 hour" \
  --label "bug,type-safety,critical"
```

### Método 3: Usar Issues Tracker

```bash
# Converter ISSUES_TRACKER.md para CSV
# Importar em GitHub Projects

1. Abrir GitHub Projects
2. Create custom view
3. Importar de CSV ou usar API
```

---

## ✅ LABELS RECOMENDADAS

Criar labels no GitHub:

| Label           | Cor    | Descrição       |
| --------------- | ------ | --------------- |
| `bug`           | d73a4a | Bug/Erro        |
| `feature`       | a2eeef | Nova feature    |
| `refactor`      | fbca04 | Refatoração     |
| `task`          | cccccc | Tarefa genérica |
| `type-safety`   | 5319e7 | Type safety     |
| `critical`      | ff0000 | Bloqueador      |
| `high`          | ff6600 | Alta prioridade |
| `logging`       | 0e8a16 | Logging         |
| `docker`        | 0075ca | Docker          |
| `database`      | fbca04 | Database        |
| `security`      | ff0000 | Security        |
| `performance`   | 1f883d | Performance     |
| `observability` | 0075ca | Observability   |

Criar labels:

```bash
# Settings > Labels > New label
# Ou via CLI
gh label create bug -c d73a4a -d "Bug/Erro"
gh label create feature -c a2eeef -d "Nova feature"
gh label create critical -c ff0000 -d "Bloqueador"
# ... etc
```

---

## 🎯 MILESTONES

Criar milestones no GitHub:

1. **Phase 0: Build Fixes** (Deadline: Week 1)
2. **Phase 1: Observability** (Deadline: Week 4)
3. **Phase 2: Core Infrastructure** (Deadline: Week 8)
4. **Phase 3: Security** (Deadline: Week 12)
5. **Phase 4: Performance** (Deadline: Week 16)
6. **Phase 5: Monitoring** (Deadline: Week 20)

Criar milestones:

```bash
# Settings > Milestones > New milestone
# Ou via CLI (não suportado nativamente)
```

---

## 📝 TEMPLATES DISPONÍVEIS

### Issue Template

```markdown
## Description

[O que este issue resolve?]

## Acceptance Criteria

- [ ] Critério 1
- [ ] Critério 2

## Effort

[Horas estimadas]

## References

[Links relevantes]
```

### Pull Request Template

```markdown
## Description

[O que muda?]

## Fixes

Fixes #[issue_number]

## Testing

[Como testar?]

## Checklist

- [ ] Tests adicionados
- [ ] Documentação atualizada
- [ ] Sem breaking changes
```

---

## 🔗 LINKS IMPORTANTES

- **Issues Created:** https://github.com/own-boldsbrain/ysh-helio-ai-agents/issues
- **GitHub CLI Docs:** https://cli.github.com/
- **GitHub API Issues:** https://docs.github.com/en/rest/reference/issues
- **GitHub Projects:** https://github.com/features/project-management/

---

## 🚀 PRÓXIMOS PASSOS

### Após criar as issues:

1. **Organize em Projects**

   ```plaintext
   Settings > Projects > New project
   Selecionar "Table" view
   Adicionar campos: Effort, Phase, Status
   ```

2. **Setup Automation**

   ```plaintext
   Use GitHub Actions para auto-assign issues
   Setup status checks
   Configure deploys automáticos
   ```

3. **Connect ao Slack**

   ```
   /github subscribe own-boldsbrain/ysh-helio-ai-agents
   issues,pulls
   ```

4. **Monitorar Progress**
   ```
   Dashboard das métricas
   Burn-down charts
   Velocity tracking
   ```

---

## 📞 TROUBLESHOOTING

### Erro: "Not Found"

```
gh auth logout
gh auth login
# Selecionar opções corretas
```

### Erro: "Permission Denied"

```
# Token não tem permissões suficientes
1. Gerar novo token com escopos corretos
2. https://github.com/settings/tokens/new
```

### Erro: "Rate Limited"

```
# Aguardar 1 hora ou upgrade da conta
# Ou criar issues manualmente em pequenos lotes
```

### Issues não aparecem

```
# Aguardar 5-10 segundos
# Refresh a página do GitHub
# Verificar se não foram criadas em outro branch
```

---

## ✨ EXEMPLO COMPLETO

```bash
#!/bin/bash

# 1. Login
gh auth login

# 2. Criar labels
gh label create critical -c ff0000 -d "Bloqueador" --repo own-boldsbrain/ysh-helio-ai-agents

# 3. Criar primeira issue
gh issue create \
  --repo own-boldsbrain/ysh-helio-ai-agents \
  --title "P0-001: Fix build errors" \
  --label "bug,critical" \
  --body "Fix type errors blocking production build"

# 4. Ver issues
gh issue list --repo own-boldsbrain/ysh-helio-ai-agents

# 5. Fechar issue
gh issue close 1 --repo own-boldsbrain/ysh-helio-ai-agents
```

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- [PRODUCTION_COVERAGE_360.md](./PRODUCTION_COVERAGE_360.md) - Detalhes das issues
- [ISSUES_TRACKER.md](./ISSUES_TRACKER.md) - Lista completa em formato spreadsheet
- [SKILLS_TOOLS_REFERENCES.md](./SKILLS_TOOLS_REFERENCES.md) - Referências de ferramentas

---

**Status:** ✅ Ready to Execute  
**Tempo Estimado:** 5-10 minutos  
**Recursos Necessários:** GitHub Token + GitHub CLI (ou Python)
