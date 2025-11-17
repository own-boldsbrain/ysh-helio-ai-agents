# 🐳 Docker Quick Reference

Comandos rápidos para gerenciar o ambiente Docker do projeto.

## 🚀 Setup Inicial

```bash
# WSL: Setup automático completo
bash scripts/wsl-docker-setup.sh

# Ou manualmente
docker-compose up -d
pnpm install
pnpm db:push
```

## 📦 Comandos Principais

### Usando docker-compose diretamente

```bash
# Iniciar containers
docker-compose up -d

# Parar containers
docker-compose down

# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Reiniciar
docker-compose restart
```

### Usando o helper script (recomendado)

```bash
# Ver todos os comandos disponíveis
bash scripts/docker-helper.sh help

# Iniciar
bash scripts/docker-helper.sh start

# Parar
bash scripts/docker-helper.sh stop

# Status
bash scripts/docker-helper.sh status

# Logs
bash scripts/docker-helper.sh logs

# Limpar tudo
bash scripts/docker-helper.sh clean

# Rebuild completo
bash scripts/docker-helper.sh rebuild
```

## 🗄️ PostgreSQL

### Conexão

```
Host:     localhost
Port:     5433
Database: coding_agent
User:     postgres
Password: password

Connection String:
postgresql://postgres:password@localhost:5433/coding_agent
```

### Comandos úteis

```bash
# Abrir psql
bash scripts/docker-helper.sh psql
# ou
docker-compose exec postgres psql -U postgres -d coding_agent

# Backup do banco
bash scripts/docker-helper.sh backup

# Restore do banco
bash scripts/docker-helper.sh restore backup_20251111_231500.sql

# Shell no container
bash scripts/docker-helper.sh shell
```

## 🔧 Troubleshooting

### Container não inicia

```bash
# Verificar Docker
sudo service docker status
sudo service docker start

# Ver logs de erro
docker-compose logs postgres
```

### Erros com node_modules

```bash
# Reinstalar no WSL
rm -rf node_modules .pnpm .pnpm-store
pnpm install
```

### Porta 5433 em uso

```bash
# Ver o que está usando a porta
sudo lsof -i :5433

# Mudar a porta no docker-compose.yml
# "5434:5432" ao invés de "5433:5432"
```

### Limpar e recomeçar

```bash
# Opção 1: Apenas parar
docker-compose down

# Opção 2: Parar e remover volumes (PERDE DADOS!)
docker-compose down -v

# Opção 3: Rebuild completo
bash scripts/docker-helper.sh rebuild
```

## 📝 Variáveis de Ambiente

Arquivo `.env.local`:

```bash
POSTGRES_URL=postgresql://postgres:password@localhost:5433/coding_agent
# ... outras variáveis
```

## 🎯 Workflow Típico

```bash
# 1. Iniciar Docker (uma vez)
bash scripts/docker-helper.sh start

# 2. Verificar se está rodando
bash scripts/docker-helper.sh status

# 3. Rodar migrations (primeira vez)
pnpm db:push

# 4. Iniciar dev server
pnpm dev

# 5. Quando terminar
bash scripts/docker-helper.sh stop
```

## 📚 Documentação Completa

- [WSL Docker Setup Guide](./WSL_DOCKER_SETUP.md) - Guia completo
- [README.md](../README.md) - Documentação geral do projeto
