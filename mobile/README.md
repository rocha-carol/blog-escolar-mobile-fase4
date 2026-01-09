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

## Arquitetura do sistema

O app segue uma arquitetura em camadas organizada por responsabilidade:

- **Apresentação** (`src/screens`): telas e fluxos visuais do aplicativo.
- **Navegação** (`src/navigation`): stack + tabs e definição dos fluxos.
- **Estado e sessão** (`src/contexts`): autenticação, persistência de sessão e contexto global.
- **Integração** (`src/services`): comunicação com a API REST e interceptors.
- **Tema** (`src/theme`): tokens visuais compartilhados.

O `App.tsx` faz o bootstrap do app, configura providers e inicia a navegação.

## Uso da aplicação

1. Configure a variável `EXPO_PUBLIC_API_BASE_URL` apontando para a API.
2. Inicie o app com `npm run start`.
3. Faça login com email e senha (professor ou aluno).
4. Navegue pelos posts usando as abas.
5. Usuários docentes podem criar/editar posts e gerenciar usuários.

## Experiências e desafios

- **Integração com autenticação**: garantir o envio automático de credenciais em rotas protegidas foi central para evitar erros em chamadas repetitivas.
- **Separação de responsabilidades**: manter navegação, telas e serviços isolados facilitou a evolução do app.
- **Experiência do usuário**: equilíbrio entre rapidez no acesso aos posts e visibilidade de ações administrativas.
- **Ajustes de ambiente**: configurar corretamente o `EXPO_PUBLIC_API_BASE_URL` foi essencial para testes locais e em rede.
