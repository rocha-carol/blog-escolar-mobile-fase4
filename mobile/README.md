# Blog Escolar Mobile

Aplicativo mobile em React Native (Expo) para consumo da API de blog escolar.

## Documentação técnica detalhada

### Setup inicial

#### Pré-requisitos

- Node.js (LTS)
- npm
- Expo CLI (via `npx`)
- Dispositivo físico com Expo Go **ou** emulador Android/iOS configurado

#### Instalação

```bash
cd mobile
npm install
```

#### Variáveis de ambiente

A aplicação usa a variável `EXPO_PUBLIC_API_BASE_URL` para apontar para a API.

```bash
export EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

> Em ambientes Windows, use `set` (cmd) ou `$env:EXPO_PUBLIC_API_BASE_URL=...` (PowerShell).

#### Execução

```bash
npm run start
```

Isso abrirá o Expo DevTools. Em seguida:

- Leia o QR Code no Expo Go, **ou**
- Inicie o emulador pelo DevTools.

### Arquitetura da aplicação

A base do app segue a separação por responsabilidade, com telas, navegação, serviços e contexto de autenticação.

#### Estrutura de diretórios

- `App.tsx`: ponto de entrada e bootstrap do app.
- `src/contexts`: autenticação e persistência de sessão.
- `src/navigation`: fluxo principal (stack + tabs).
- `src/screens`: telas de posts, administração e usuários.
- `src/services`: integração com a API REST.
- `src/theme`: paleta de cores compartilhada.

#### Camadas principais

1. **UI (telas)**
   - Telas de listagem, leitura e manutenção de posts.
   - Telas administrativas para gerenciamento de usuários.

2. **Navegação**
   - Stack navigation para fluxos de detalhes.
   - Tabs para as áreas principais do app.

3. **Estado e sessão**
   - Contexto de autenticação centraliza credenciais e sessão.
   - Persistência via `AsyncStorage`.

4. **Integração com API**
   - `Axios` configurado para uso consistente da base URL.
   - Interceptor adiciona cabeçalhos `x-email` e `x-senha` automaticamente.

#### Fluxo de autenticação

1. Professores e alunos realizam login com email e senha.
2. As credenciais são persistidas via `AsyncStorage`.
3. As requisições protegidas enviam `x-email` e `x-senha` automaticamente via interceptor do Axios.
4. Endpoints protegidos validam o papel `professor` no backend.

### Guia de uso

#### Login

1. Abra o app.
2. Informe email e senha.
3. Toque em **Entrar**.

#### Postagens

- **Listar posts:** tela inicial com busca.
- **Ler post:** toque em um item para abrir os detalhes.
- **Criar/editar post (docentes):** use os botões de ação na área administrativa.

#### Administração (docentes)

- **Posts:** criação, edição e exclusão.
- **Usuários:** cadastro, edição, listagem e exclusão de professores e alunos.

### Funcionalidades implementadas

- Lista de posts com busca.
- Leitura de post.
- Criação e edição de posts (docentes).
- Administração de posts (docentes).
- Cadastro, edição, listagem e exclusão de professores e alunos (docentes).

### Observações

- Ajuste a `EXPO_PUBLIC_API_BASE_URL` conforme o ambiente.
- Para endpoints protegidos, a API valida o papel `professor`.
