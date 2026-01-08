# Blog Escolar - Front-End

Interface gráfica do projeto de blogging educacional, construída em React + TypeScript.
O foco é oferecer uma experiência simples e acessível para professores(as) e estudantes,
com páginas de leitura, criação e gerenciamento de postagens integradas ao back-end REST.

## Funcionalidades

- **Lista de posts (Home)**: exibe título, autor e resumo, com busca por palavra-chave.
- **Leitura de post**: visualização completa do conteúdo e comentários.
- **Criação de postagens**: formulário para docentes criarem novas publicações.
- **Edição de postagens**: edição com dados pré-carregados.
- **Área administrativa**: listagem com ações de editar e excluir.
- **Autenticação**: login para professores(as) com rotas protegidas.

## Tecnologias

- React 19 + TypeScript
- Vite
- React Router
- Styled Components
- Axios

## Estrutura de pastas

```
src/
├── components/     # Componentes reutilizáveis (cards, inputs, etc.)
├── contexts/       # AuthContext para sessão e token
├── hooks/          # Hooks customizados (ex: useAuth)
├── layouts/        # Layout principal e layout de login
├── pages/          # Páginas da aplicação
├── routes/         # Configuração de rotas e proteção
├── services/       # Integração com API REST
├── styles/         # Estilos globais e temas
└── types/          # Tipagens compartilhadas
```

## Rotas principais

| Rota | Página | Acesso |
| --- | --- | --- |
| `/` | Lista de posts | Público |
| `/post/:id` | Leitura do post | Público |
| `/login` | Autenticação | Público |
| `/criar` | Criar postagem | Professor(a) |
| `/editar/:id` | Editar postagem | Professor(a) |
| `/gerenciamentodepostagens` | Administração de posts | Professor(a) |

As rotas protegidas utilizam `ProtectedRoute` e verificam a autenticação e o papel
`professor` no usuário logado.

## Integração com o Back-End

A API é consumida via Axios em `src/services/`.
Atualize o `baseURL` em `src/services/authService.ts` para apontar para o endereço
correto do back-end.

Principais endpoints esperados:

- `POST /usuario/login` - autenticação
- `GET /posts` - listagem paginada
- `GET /posts/:id` - detalhes da postagem
- `POST /posts` - criação
- `PUT /posts/:id` - edição
- `DELETE /posts/:id` - exclusão (usado na área administrativa)

## Como executar

### Pré-requisitos

- Node.js 18+
- Back-end rodando e acessível

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

### Build de produção

```bash
npm run build
```

### Preview local

```bash
npm run preview
```

## Uso

1. Acesse `http://localhost:5173` para visualizar a aplicação.
2. Faça login com um usuário professor(a).
3. Crie, edite ou gerencie postagens pelas rotas protegidas.

## Documentação técnica

- **Autenticação**: `AuthContext` mantém token e usuário no `localStorage`.
- **Proteção de rotas**: `ProtectedRoute` redireciona usuários não autenticados.
- **Integração com API**: serviços em `src/services` encapsulam as chamadas REST.
- **Componentização**: páginas em `src/pages`, com layout padrão em `src/layouts`.

## Scripts disponíveis

- `npm run dev` - inicia o servidor de desenvolvimento
- `npm run build` - gera a build de produção
- `npm run preview` - pré-visualização da build
- `npm run lint` - análise estática do código
