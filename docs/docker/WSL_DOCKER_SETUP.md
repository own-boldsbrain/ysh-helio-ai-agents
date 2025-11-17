# WSL Docker Environment Guide

Este guia explica como padronizar e configurar o ambiente de desenvolvimento WSL com Docker para este projeto.

## 📋 Pré-requisitos

- **Windows 10/11** com WSL 2 habilitado
- **Ubuntu** ou outra distribuição Linux no WSL
- **Docker Desktop** (com integração WSL 2) OU Docker instalado diretamente no WSL
- **Node.js 20.x** ou superior
- **pnpm 9.15.0** ou superior

## 🐳 Configuração Inicial

### Opção 1: Script Automático (Recomendado)

Execute o script de setup automático dentro do WSL:

```bash
cd /home/rookie/projects/coding-agent-template
bash scripts/wsl-docker-setup.sh
```

Este script irá:

- ✅ Verificar se está rodando no WSL
- ✅ Instalar Docker (se necessário)
- ✅ Iniciar os containers do Docker
- ✅ Configurar PostgreSQL
- ✅ Verificar e reinstalar node_modules se necessário (compatibilidade WSL)

### Opção 2: Configuração Manual

#### 1. Verificar se está no WSL

```bash
grep -qi microsoft /proc/version && echo "✓ Running in WSL" || echo "✗ Not in WSL"
```

#### 2. Instalar Docker no WSL (se necessário)

```bash
# Atualizar pacotes
sudo apt-get update

# Instalar dependências
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Adicionar chave GPG do Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Adicionar repositório
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Reiniciar para aplicar permissões
# (ou execute: newgrp docker)
```

#### 3. Iniciar Docker

```bash
sudo service docker start
```

#### 4. Verificar instalação

```bash
docker --version
docker compose version
```

## 🚀 Uso Diário

### Iniciar o ambiente

```bash
# Navegar para o projeto
cd /home/rookie/projects/coding-agent-template

# Iniciar containers
docker-compose up -d

# Ou usar o arquivo de desenvolvimento estendido
docker-compose -f docker-compose.dev.yml up -d
```

### Verificar status

```bash
docker-compose ps
```

### Ver logs

```bash
# Todos os containers
docker-compose logs -f

# Apenas PostgreSQL
docker-compose logs -f postgres
```

### Parar containers

```bash
docker-compose down
```

### Reiniciar containers

```bash
docker-compose restart
```

## 🗄️ PostgreSQL

### Informações de Conexão

```
Host:     localhost
Port:     5433
Database: coding_agent
User:     postgres
Password: password
```

### Connection String

```
postgresql://postgres:password@localhost:5433/coding_agent
```

### Acessar PostgreSQL via CLI

```bash
# Executar psql no container
docker-compose exec postgres psql -U postgres -d coding_agent

# Ou conectar de fora do container
psql -h localhost -p 5433 -U postgres -d coding_agent
```

## 📦 Gerenciamento de Dependências

### Problema: node_modules do Windows no WSL

Se você instalou `node_modules` no Windows e tentou usar no WSL, pode encontrar erros com binários nativos (como `lightningcss`).

**Solução:**

```bash
# Remover node_modules do Windows
rm -rf node_modules .pnpm .pnpm-store

# Reinstalar no WSL
pnpm install
```

### Verificar compatibilidade

```bash
# Procurar por binários do Windows (não deveria existir no WSL)
find node_modules -name "*.win32-x64-msvc.node" 2>/dev/null

# Procurar por binários Linux (deveria existir)
find node_modules -name "*.linux-x64-gnu.node" 2>/dev/null
```

## 🔧 Scripts Disponíveis

```bash
# Setup completo do ambiente WSL + Docker
bash scripts/wsl-docker-setup.sh

# Bootstrap do projeto (instalar deps, build, etc)
bash scripts/ds-bootstrap.sh

# Migrations do banco de dados
pnpm db:push
pnpm db:migrate

# Seeds do banco de dados
pnpm db:seeds

# Iniciar servidor de desenvolvimento
pnpm dev

# Iniciar apenas o web app
pnpm --filter @repo/web dev
```

## 🏗️ Estrutura Docker

### Arquivos Docker

```
.
├── docker-compose.yml          # Configuração básica (apenas PostgreSQL)
├── docker-compose.dev.yml      # Configuração estendida (com app container)
├── Dockerfile.dev              # Imagem de desenvolvimento (opcional)
└── scripts/
    └── wsl-docker-setup.sh     # Script de setup automático
```

### docker-compose.yml

Configuração básica com apenas PostgreSQL. Use este para desenvolvimento local onde você executa o app diretamente no WSL.

```bash
docker-compose up -d
```

### docker-compose.dev.yml

Configuração estendida que inclui um container opcional para o app. Útil para isolar completamente o ambiente.

```bash
docker-compose -f docker-compose.dev.yml up -d
```

## ⚠️ Problemas Comuns

### 1. Docker não inicia

```bash
# Verificar status do serviço
sudo service docker status

# Iniciar manualmente
sudo service docker start

# Se usar Docker Desktop, verifique se está rodando e se a integração WSL está habilitada
```

### 2. Permissão negada ao executar docker

```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Aplicar mudanças (ou faça logout/login)
newgrp docker
```

### 3. PostgreSQL não conecta

```bash
# Verificar se o container está rodando
docker-compose ps

# Ver logs do PostgreSQL
docker-compose logs postgres

# Verificar se a porta 5433 está livre
sudo lsof -i :5433
```

### 4. Erros com lightningcss ou outros binários nativos

```bash
# Reinstalar dependências no WSL
rm -rf node_modules .pnpm .pnpm-store
pnpm install
```

### 5. ENOENT errors para pacotes

Geralmente causado por `node_modules` instalado no Windows. Execute no WSL:

```bash
rm -rf node_modules .pnpm .pnpm-store
pnpm install
```

## 🎯 Boas Práticas

1. **Sempre instale dependências dentro do WSL**, nunca no Windows
2. **Use o script de setup** para configuração inicial
3. **Inicie o Docker antes** de rodar `pnpm dev`
4. **Verifique logs** regularmente com `docker-compose logs`
5. **Mantenha containers atualizados** com `docker-compose pull`

## 🔐 Segurança

⚠️ **IMPORTANTE**: O `docker-compose.yml` atual usa credenciais de desenvolvimento padrão:

- User: `postgres`
- Password: `password`

**Para produção:**

1. Use variáveis de ambiente
2. Configure senhas fortes
3. Use secrets do Docker
4. Não commite credenciais no git

## 📚 Referências

- [WSL 2 Documentation](https://docs.microsoft.com/en-us/windows/wsl/)
- [Docker Desktop WSL 2 Backend](https://docs.docker.com/desktop/windows/wsl/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs -f`
2. Verifique o status: `docker-compose ps`
3. Reinicie os containers: `docker-compose restart`
4. Reconstrua do zero: `docker-compose down -v && docker-compose up -d`

---

**Última atualização:** 11 de novembro de 2025
