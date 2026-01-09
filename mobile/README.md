# Blog Escolar Mobile

Aplicativo mobile em React Native (Expo) para consumo da API de blog escolar.

## Setup rápido

```bash
cd mobile
npm install
export EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
npm run start
```

## Estrutura

- `App.tsx`: ponto de entrada.
- `src/contexts`: autenticação e persistência de sessão.
- `src/navigation`: fluxo principal com stack + tabs.
- `src/screens`: telas de posts, administração e usuários.
- `src/services`: integração com a API REST.
- `src/theme`: paleta de cores compartilhada.

## Fluxo de autenticação

1. Professores e alunos realizam login com email e senha.
2. As credenciais são persistidas via `AsyncStorage`.
3. As requisições protegidas enviam `x-email` e `x-senha` automaticamente via interceptor do Axios.

## Funcionalidades implementadas

- Lista de posts com busca.
- Leitura de post.
- Criação e edição de posts (docentes).
- Administração de posts (docentes).
- Cadastro, edição, listagem e exclusão de professores e alunos (docentes).

## Observações

- Para endpoints protegidos, a API valida o papel `professor`.
- Ajuste a `EXPO_PUBLIC_API_BASE_URL` conforme o ambiente.
