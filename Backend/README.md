🧾 DOCUMENTAÇÃO TÉCNICA — API DE BLOGGING
📋 Sumário

Visão Geral

Setup Inicial

Estrutura de Pastas

Arquitetura da Aplicação

Configuração de Banco de Dados (MongoDB)

Execução Local

Execução via Docker

Testes Automatizados

Integração Contínua (CI/CD)

Guia de Uso das APIs

Segurança e Criptografia

Próximos Passos / Escalabilidade

Visão Geral

A Blog API é uma aplicação RESTful desenvolvida em Node.js com Express e MongoDB, voltada para gerenciamento de postagens e usuários com autenticação via token bearer e criptografia de senha.
O projeto foi projetado com foco em boas práticas, modularização, testes automatizados e pipelines CI/CD.

 Setup Inicial
Pré-requisitos

Node.js 18+

npm 9+

Docker Desktop (para containerização)

Conta no MongoDB Atlas

Conta no GitHub (para CI/CD)

Instalação
git clone https://github.com/<seu-usuario>/blog.git
cd blog
npm install


Crie um arquivo .env na raiz:

PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/blog

Estrutura de Pastas
blog/
│
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── userController.js
│   │   └── postController.js
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── postRoutes.js
│   ├── utils/
│   │   └── criptografia.js
│   └── server.js
│
├── tests/
│   ├── user.test.js
│   └── posts.test.js
│
├── .github/workflows/
│   └── ci.yml
│
├── Dockerfile
├── docker-compose.yml
├── package.json
└── .env.example

Arquitetura da Aplicação

Padrão utilizado: MVC (Model-View-Controller)

Model: Estruturas de dados do MongoDB (User, Post)

Controller: Lógica de negócio e validações

Routes: Endpoints da API

Server: Ponto de entrada da aplicação

Utils: Funções auxiliares (ex.: criptografia)

Fluxo:

Request → Route → Controller → Model → MongoDB → Response

Configuração de Banco de Dados

O projeto usa MongoDB Atlas em produção e mongodb-memory-server em ambiente de testes.

Arquivo: src/config/db.js

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const conectarBanco = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado ao Banco de Dados!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
    process.exit(1);
  }
};

Execução Local
npm run dev


Acesse:
http://localhost:3000

Execução via Docker
Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

docker-compose.yml
version: "3.9"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env

Rodar container
docker compose up --build

Testes Automatizados

Framework: Jest + Supertest + MongoDB Memory Server

Executar testes
npm test

Exemplo de saída:
PASS tests/user.test.js
PASS tests/posts.test.js
Test Suites: 2 passed, 2 total
Tests:       10 passed, 10 total

Integração Contínua (CI/CD)

Pipeline: GitHub Actions
Objetivo: Rodar testes e buildar imagem Docker automaticamente a cada push/pull request na branch main.

github/workflows/ci.yml

name: CI Pipeline

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Build Docker image
        run: docker build -t blog-api .

Guia de Uso das APIs
👤 Usuários
Método	Rota	Descrição
POST	/api/users/register	Cadastra novo usuário
POST	/api/users/login	Valida usuário e senha
📝 Postagens
Método	Rota	Descrição
GET	/api/posts	Lista todas as posta

import bcrypt from "bcryptjs";

export const criptografarSenha = async (senha) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(senha, salt);
};

export const compararSenhas = async (senha, hash) => {
  return await bcrypt.compare(senha, hash);
};
