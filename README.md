# Fintrack API

Backend da aplicacao Fintrack, construido com NestJS + Prisma + PostgreSQL, com autenticacao via Firebase ID Token.

## Visao geral

Esta API expoe endpoints para:

- Categorias
- Transacoes (income/expense)
- Contas a pagar (bills)
- Health check

Todos os endpoints de negocio sao protegidos por token Firebase (`Authorization: Bearer <token>`).

## Stack

- Node.js
- TypeScript
- NestJS
- Prisma ORM
- PostgreSQL
- Firebase Admin SDK
- Zod (validacao)

## Arquitetura

- Prefixo global da API: `/api`
- CORS habilitado com base em `FRONTEND_ORIGIN`
- Validacao global com ValidationPipe + ZodValidationPipe
- Persistencia com Prisma e migrations versionadas

## Requisitos

- Node.js 20+ (recomendado: 22)
- npm 10+
- PostgreSQL 14+
- Projeto Firebase com Service Account

## Variaveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Variaveis obrigatorias:

- `NODE_ENV` (`development`, `test`, `production`)
- `PORT` (ex.: `3000`)
- `FRONTEND_ORIGIN` (uma ou mais origens separadas por virgula)
- `DATABASE_URL` (string de conexao PostgreSQL)
- `FIREBASE_PROJECT_ID`
- Credenciais Firebase em um dos formatos:
  - `FIREBASE_CREDENTIALS_JSON`
  - ou `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`

Exemplo de `DATABASE_URL` local:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fintrack
```

## Como rodar localmente

1. Instale dependencias:

```bash
npm install
```

2. Gere o client Prisma:

```bash
npm run prisma:generate
```

3. Rode migrations no banco local:

```bash
npm run prisma:migrate
```

4. Inicie em modo desenvolvimento:

```bash
npm run start:dev
```

5. Health check:

```bash
curl http://localhost:3000/api/health
```

## Scripts

- `npm run start:dev`: inicia em desenvolvimento
- `npm run build`: compila para `dist/`
- `npm run start:prod`: inicia app compilado
- `npm run prisma:generate`: gera Prisma Client
- `npm run prisma:migrate`: cria/aplica migration em dev
- `npm run prisma:migrate:deploy`: aplica migrations em producao
- `npm run prisma:studio`: abre Prisma Studio

## Autenticacao

A API espera um Firebase ID Token no header:

```http
Authorization: Bearer <firebase_id_token>
```

Se o token for valido, o usuario autenticado e anexado a request e usado para isolamento de dados por usuario.

## Endpoints

Base URL local: `http://localhost:3000/api`

Publico:

- `GET /health`

Protegidos (Bearer token):

- `GET /categories`
- `GET /categories/:id`
- `POST /categories`
- `PATCH /categories/:id`
- `DELETE /categories/:id`
- `GET /transactions`
- `POST /transactions`
- `GET /bills`
- `GET /bills/:id`
- `POST /bills`
- `PATCH /bills/:id`
- `DELETE /bills/:id`

## Deploy

### Render Web Service (sem Docker)

Este repo ja inclui:

- `render.yaml`

Fluxo resumido:

1. Push para GitHub
2. Render -> New + -> Blueprint
3. Selecione o repo e aplique
4. Configure env vars do Firebase e `FRONTEND_ORIGIN`
5. Deploy

O Render executa automaticamente:

```bash
npm ci && npm run prisma:generate && npm run build
npm run prisma:migrate:deploy
npm run start:prod
```

Consulte instrucoes detalhadas em `DEPLOY.md`.

### VPS com Docker Compose

Tambem existe `docker-compose.prod.yml` para deploy em VPS.

## Banco de dados

Principais entidades:

- `User`
- `Category`
- `Transaction`
- `Bill`

Schema completo em `prisma/schema.prisma`.

## Troubleshooting rapido

- Erro de CORS: valide `FRONTEND_ORIGIN`.
- Erro 401: token Firebase ausente/invalido.
- Erro de conexao DB: valide `DATABASE_URL` e acesso de rede.
- Erro de migration: execute `npm run prisma:migrate:deploy` antes do start em producao.
