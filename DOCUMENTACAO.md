# Documentação do Sistema

## Visão geral
Este sistema é composto por duas aplicações principais:

- **Backend (API Blog)**: serviço RESTful em Node.js/Express com MongoDB para cadastro de usuários e gerenciamento de postagens.
- **Frontend (Blog Escolar)**: aplicação web em React (Vite + TypeScript) que consome a API para exibir e gerenciar conteúdos.

O objetivo do projeto é disponibilizar uma plataforma de publicação simples, organizada e segura, com autenticação via token bearer e fluxo de dados bem definido.

## Arquitetura do sistema

### Visão macro
```
[Cliente/Browser]
       |
       v
[Frontend React] ---> [Backend Express] ---> [MongoDB]
```

- **Frontend**: responsável pela interface e experiência do usuário; integra-se com a API via HTTP.
- **Backend**: concentra regras de negócio, autenticação, validações e persistência de dados.
- **Banco de dados**: MongoDB, com uso de variáveis de ambiente para conexão.

### Backend (padrão MVC)
O backend segue uma organização em **Model-View-Controller (MVC)**:

- **Model**: definição das entidades (usuários e postagens).
- **Controller**: regras de negócio, validações e respostas da API.
- **Routes**: endpoints que conectam requisições aos controllers.
- **Utils**: funções auxiliares, como criptografia.

Fluxo de dados:

1. Cliente envia request HTTP.
2. Rota direciona para o controller correto.
3. Controller valida dados e aciona model.
4. Model interage com o MongoDB.
5. Controller retorna a resposta ao cliente.

### Frontend
O frontend foi desenvolvido em React (Vite + TypeScript) e utiliza:

- **React Router** para navegação entre páginas.
- **Styled-components** para estilos.
- **Axios** para chamadas HTTP à API.

A aplicação é configurada para rodar localmente e consumir o backend durante o desenvolvimento.

## Uso da aplicação

### Pré-requisitos
- Node.js 18+
- npm 9+
- MongoDB Atlas (ou instância local)

### Backend
1. Instale as dependências:
   ```bash
   cd Backend
   npm install
   ```
2. Configure o `.env` na raiz do backend (use a variável `MONGO_URI` para a conexão):
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/blog
   ```
3. Inicie o servidor:
   ```bash
   npm run dev
   ```
4. A API ficará disponível em `http://localhost:3000`.

### Frontend
1. Instale as dependências:
   ```bash
   cd blog-escolar
   npm install
   ```
2. Inicie o frontend:
   ```bash
   npm run dev
   ```
3. A aplicação ficará disponível em `http://localhost:5173` (porta padrão do Vite).

## Relato de experiências e desafios

Durante o desenvolvimento, a equipe encontrou pontos de atenção importantes:

- **Integração front/back**: foi necessário alinhar contratos de API e padrões de resposta para evitar inconsistências e erros de mapeamento no frontend.
- **Configuração do MongoDB**: o uso de variáveis de ambiente e a validação da conexão exigiram atenção para evitar falhas em ambientes diferentes (local x produção).
- **Autenticação e criptografia**: garantir o fluxo de cadastro/login com senhas criptografadas e validações consistentes exigiu testes cuidadosos.
- **Padronização de componentes no frontend**: a equipe precisou definir convenções de estilo e componentes reutilizáveis para manter consistência visual.
- **Automação de testes**: integrar testes automatizados no backend ajudou a prevenir regressões, mas exigiu ajustes na configuração do ambiente de testes.

Apesar dos desafios, o processo contribuiu para fortalecer a organização do projeto, a documentação e o alinhamento entre membros da equipe.
