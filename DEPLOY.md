# Deploy em Produção

## Opção 1: Render Web Service sem Docker (recomendado)

Este repositório já contém um Blueprint em `render.yaml`.

### 1. Subir código no GitHub

Garanta que o repositório remoto contenha os arquivos mais recentes, especialmente `render.yaml`.

### 2. Criar stack no Render pelo Blueprint

No Render:

1. New +
2. Blueprint
3. Selecione este repositório
4. Apply

Isso cria:

- 1 Web Service (`fintrack-api`) com runtime Node.
- 1 PostgreSQL gerenciado (`fintrack-db`).

### 3. Preencher variáveis obrigatórias

No serviço `fintrack-api`, configure:

- `FRONTEND_ORIGIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CREDENTIALS_JSON` (preferível) ou o par:
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

`DATABASE_URL` já será ligado automaticamente ao banco do Render via Blueprint.

### 4. Build, migration e start no Render

Ao aplicar o Blueprint, o Render executa automaticamente:

```bash
npm ci && npm run prisma:generate && npm run build
npm run prisma:migrate:deploy
npm run start:prod
```

Ou seja, build acontece no deploy e as migrações rodam antes da API subir.

### 5. Validar saúde

Use o endpoint:

```bash
/api/health
```

Resposta esperada:

```json
{ "status": "ok", "timestamp": "2026-01-01T00:00:00.000Z" }
```

## Opção 2: Render com Docker

Se quiser usar Docker no Render, mantenha `Dockerfile` e configure o serviço em runtime Docker.

## Opção 3: VPS com Docker Compose

### 1. Pré-requisitos no servidor

- Docker Engine e Docker Compose plugin instalados.
- Porta 3000 liberada internamente (recomendado publicar externamente via Nginx/Caddy).
- DNS apontando para o servidor (se houver domínio).

### 2. Preparar variáveis

```bash
cp .env.production.example .env.production
```

Edite `.env.production` com valores reais.

### 3. Build e subida

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 4. Logs e operações

```bash
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml down
```
