# API Credentials Setup Guide

Este guia fornece instruções detalhadas sobre como configurar as credenciais de API para o projeto Coding Agent Template.

## 📋 Índice

1. [Variáveis de Ambiente Obrigatórias](#variáveis-de-ambiente-obrigatórias)
2. [Configuração de API Keys](#configuração-de-api-keys)
3. [Validação de Credenciais](#validação-de-credenciais)
4. [Serviços Configurados](#serviços-configurados)
5. [Solução de Problemas](#solução-de-problemas)

## 🔒 Variáveis de Ambiente Obrigatórias

As seguintes variáveis são **obrigatórias** para o funcionamento básico do projeto:

```bash
# Database
POSTGRES_URL=postgresql://postgres:password@localhost:5433/coding_agent

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=changeme_32b

# Encryption
JWE_SECRET=6DWf03ze0qRLr9pl9Zl5JI+XIqvlot0ybechhR5NmrM=
ENCRYPTION_KEY=C182A9026D890EE67B1BD282387D0F28FDA7AC3B191D7A47A124EB8933B08CDD

# Authentication
NEXT_PUBLIC_AUTH_PROVIDERS=github

# Sandbox Provider
SANDBOX_PROVIDER=docker
```

## 🔑 Configuração de API Keys

### 1. OpenAI API

**Como obter:**

1. Acesse [OpenAI Platform](https://platform.openai.com/api-keys)
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave e adicione ao `.env.local`

**Configuração:**

```bash
OPENAI_API_KEY=sk-proj-...
```

**Modelos disponíveis:** GPT-4, GPT-3.5-turbo, etc.

---

### 2. Groq API

**Como obter:**

1. Acesse [Groq Console](https://console.groq.com/)
2. Crie uma conta
3. Navegue até "API Keys"
4. Gere uma nova chave

**Configuração:**

```bash
GROQ_API_KEY=gsk_...
```

**Modelos disponíveis:** Llama 3, Mixtral, etc.

---

### 3. Google Gemini API

**Como obter:**

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"

**Configuração:**

```bash
GEMINI_API_KEY=AIzaSy...
```

**Modelos disponíveis:** Gemini Pro, Gemini Pro Vision

---

### 4. NVIDIA API

**Como obter:**

1. Acesse [NVIDIA NGC](https://ngc.nvidia.com/)
2. Crie uma conta
3. Navegue até "Generate Personal API Key"

**Configuração:**

```bash
NVIDIA_API_KEY=nvapi-...
```

---

### 5. OpenRouter API

**Como obter:**

1. Acesse [OpenRouter](https://openrouter.ai/keys)
2. Faça login
3. Gere uma nova chave

**Configuração:**

```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

**Vantagem:** Acesso a múltiplos modelos de IA através de uma única API.

---

### 6. GitHub OAuth & App

**OAuth - Como obter:**

1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Clique em "New OAuth App"
3. Preencha os dados:
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copie Client ID e Client Secret

**GitHub App - Como obter:**

1. Acesse [GitHub Apps](https://github.com/settings/apps)
2. Clique em "New GitHub App"
3. Configure as permissões necessárias
4. Gere uma chave privada
5. Salve o arquivo `.pem` no projeto

**Configuração:**

```bash
NEXT_PUBLIC_GITHUB_CLIENT_ID=Iv23li...
GITHUB_CLIENT_SECRET=07d326...
GITHUB_APP_ID=2197713
GITHUB_PRIVATE_KEY_PATH=/path/to/private-key.pem
```

---

### 7. Docker Hub

**Como obter:**

1. Acesse [Docker Hub](https://hub.docker.com/)
2. Faça login
3. Navegue até Account Settings > Security
4. Clique em "New Access Token"

**Configuração:**

```bash
DOCKER_USERNAME=ownboldsbrainai
DOCKER_PASSWORD=dckr_pat_...
```

---

### 8. Vercel AI Gateway

**Como obter:**

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Navegue até seu projeto
3. Settings > Environment Variables
4. Gere um token de API

**Configuração:**

```bash
AI_GATEWAY_API_KEY=vck_...
```

---

### 9. Hugging Face

**Como obter:**

1. Acesse [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Clique em "New token"
3. Escolha as permissões (read recomendado)

**Configuração:**

```bash
HF_TOKEN=hf_...
HUGGINGFACE_API_KEY=hf_...
```

---

### 10. Facebook/Meta Commerce

**Como obter:**

1. Acesse [Meta for Developers](https://developers.facebook.com/)
2. Crie um App
3. Adicione "Marketing API" ou "Commerce"
4. Gere um Access Token

**Configuração:**

```bash
FACEBOOK_TOKEN=EAAUz...
FACEBOOK_APP_ID=1463820658272259
FACEBOOK_APP_SECRET=03c1ba...
FACEBOOK_CATALOG_ID=716960371408497
```

---

### 11. AWS Credentials

**Como obter:**

1. Acesse [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Navegue até "Users"
3. Selecione seu usuário
4. Clique em "Security credentials"
5. Crie "Access key"

**Configuração:**

```bash
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=GZhlF...
```

---

## 🔍 Validação de Credenciais

### Executar Script de Validação

Criamos um script automatizado para validar todas as credenciais configuradas:

```bash
# Tornar o script executável (se necessário)
chmod +x scripts/validate-api-credentials.ts

# Executar validação
pnpm tsx scripts/validate-api-credentials.ts
```

**O script irá:**

- ✅ Verificar todas as variáveis de ambiente obrigatórias
- ✅ Testar conexão com APIs configuradas
- ✅ Validar formato de credenciais
- ✅ Reportar status de cada serviço

**Saída esperada:**

```
🔍 Validating API Credentials...

📊 Validation Results:

✓ Required Variables          All required environment variables are set
✓ OpenAI                       API key is valid
✓ Groq                         API key is valid
✓ Google Gemini                API key is valid
✓ GitHub OAuth                 Client ID format is correct
○ Vercel AI Gateway            Token not configured
✓ Hugging Face                 Token is valid (User: username)
✓ Docker Hub                   Credentials are valid
✓ AWS                          Credential format is correct

📈 Summary: 8 valid, 0 invalid, 0 errors, 1 skipped

✅ All configured credentials are valid!
```

---

## 📦 Serviços Configurados

### Serviços de IA

| Serviço       | Status         | Propósito                          |
| ------------- | -------------- | ---------------------------------- |
| OpenAI        | ✅ Configurado | Modelos GPT para geração de código |
| Groq          | ✅ Configurado | LLMs de alta performance           |
| Google Gemini | ✅ Configurado | Modelos multimodais do Google      |
| NVIDIA        | ✅ Configurado | Modelos especializados NVIDIA      |
| OpenRouter    | ✅ Configurado | Acesso unificado a múltiplos LLMs  |

### Serviços de Infraestrutura

| Serviço    | Status         | Propósito                   |
| ---------- | -------------- | --------------------------- |
| Docker Hub | ✅ Configurado | Gerenciamento de containers |
| Vercel     | ✅ Configurado | Deploy e AI Gateway         |
| AWS        | ✅ Configurado | Cloud services              |

### Serviços de Desenvolvimento

| Serviço      | Status         | Propósito                    |
| ------------ | -------------- | ---------------------------- |
| GitHub       | ✅ Configurado | Autenticação e versionamento |
| Hugging Face | ✅ Configurado | Modelos e datasets ML        |
| GitLens      | ✅ Configurado | Visualização de código       |

### Serviços de Negócio

| Serviço           | Status         | Propósito            |
| ----------------- | -------------- | -------------------- |
| Facebook/Meta     | ✅ Configurado | Commerce e marketing |
| ASAAS             | ✅ Configurado | Gateway de pagamento |
| Microsoft Clarity | ✅ Configurado | Analytics e heatmaps |

### Serviços Especializados

| Serviço          | Status         | Propósito               |
| ---------------- | -------------- | ----------------------- |
| NREL SAM         | ✅ Configurado | Análise solar           |
| EDELTEC          | ✅ Configurado | Distribuição de energia |
| Cesium Ion       | ✅ Configurado | Mapeamento 3D           |
| Telegram         | ✅ Configurado | Bot e notificações      |
| Context7 MCP     | ✅ Configurado | Contexto e memória      |
| Pydantic Logfire | ✅ Configurado | Logging estruturado     |

---

## 🔧 Solução de Problemas

### Erro: "API key is invalid"

**Solução:**

1. Verifique se a chave foi copiada corretamente (sem espaços)
2. Confirme se a chave não expirou
3. Verifique se tem permissões adequadas
4. Tente gerar uma nova chave

### Erro: "Missing required environment variables"

**Solução:**

1. Copie `.env.example` para `.env.local`
2. Preencha todas as variáveis obrigatórias
3. Reinicie o servidor de desenvolvimento

### Erro: "Cannot connect to database"

**Solução:**

1. Verifique se o PostgreSQL está rodando:
   ```bash
   docker ps | grep postgres
   ```
2. Verifique a string de conexão no `POSTGRES_URL`
3. Teste a conexão manualmente:
   ```bash
   psql postgresql://postgres:password@localhost:5433/coding_agent
   ```

### Erro: "Docker authentication failed"

**Solução:**

1. Faça login manualmente:
   ```bash
   docker login -u ownboldsbrainai
   ```
2. Digite o token quando solicitado
3. Verifique se o token tem permissões de leitura

---

## 🛡️ Segurança

### Boas Práticas

1. **Nunca commite arquivos `.env*`** (exceto `.env.example`)
2. **Rotacione chaves regularmente** (a cada 90 dias recomendado)
3. **Use chaves diferentes** para desenvolvimento e produção
4. **Limite permissões** das chaves ao mínimo necessário
5. **Monitore uso** das APIs para detectar uso não autorizado

### Arquivos Protegidos

O `.gitignore` está configurado para proteger:

- `.env*` (exceto `.env.example`)
- `*.pem` (chaves privadas)
- `*.key` (chaves de criptografia)
- `github-private-key.pem` (chave do GitHub App)

---

## 📝 Comandos Úteis

```bash
# Validar todas as credenciais
pnpm tsx scripts/validate-api-credentials.ts

# Verificar formato do código
pnpm format

# Verificar tipos TypeScript
pnpm type-check

# Executar linter
pnpm lint

# Build de produção
pnpm build

# Iniciar banco de dados
docker-compose up -d postgres

# Ver logs do banco
docker-compose logs -f postgres

# Parar todos os serviços
docker-compose down
```

---

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique a documentação** oficial de cada serviço
2. **Execute o script de validação** para diagnóstico
3. **Consulte os logs** do servidor/container
4. **Abra uma issue** no repositório com detalhes do erro

---

## 📚 Recursos Adicionais

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub OAuth Guide](https://docs.github.com/en/apps/oauth-apps)
- [Vercel Documentation](https://vercel.com/docs)

---

**Última atualização:** Novembro 2025  
**Versão:** 1.0.0
