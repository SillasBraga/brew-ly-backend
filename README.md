# Brew.ly

API para encurtamento de URLs usando **TypeScript + Fastify + Drizzle + Postgres**.

## Requisitos do desafio

- [x] Deve ser possível criar um link
  - [x] Não deve ser possível criar um link com URL encurtada mal formatada
  - [x] Não deve ser possível criar um link com URL encurtada já existente
- [x] Deve ser possível deletar um link
- [x] Deve ser possível obter a URL original por meio de uma URL encurtada
- [x] Deve ser possível listar todas as URL’s cadastradas
- [x] Deve ser possível incrementar a quantidade de acessos de um link
- [x] Deve ser possível exportar os links criados em um CSV
  - [x] Deve ser possível acessar o CSV por meio de uma CDN (Cloudflare R2)
  - [x] Deve ser gerado um nome aleatório e único para o arquivo
  - [x] Deve ser possível realizar a listagem de forma performática
  - [x] O CSV deve ter campos como, URL original, URL encurtada, contagem de acessos e data de criação

## Endpoints

- `POST /links` cria link
- `GET /links` lista todos
- `GET /links/:shortCode` busca URL original por código
- `PATCH /links/access` incrementa acessos
- `DELETE /links` remove link
- `POST /links/export` exporta CSV para Cloudflare R2

## Rodando localmente

```bash
pnpm install
cp .env.example .env
docker compose up
pnpm run db:migrate
pnpm run dev
```

## Scripts

- `pnpm run dev` - desenvolvimento
- `pnpm run build` - build TypeScript
- `pnpm run db:generate` - cria migrations
- `pnpm run db:migrate` - executa migrations
- `pnpm run db:studio` - cliente do banco de dados

## Docker

```bash
docker build -t brew-ly-backend .
docker run --env-file .env -p 3333:3333 brew-ly-backend
```
