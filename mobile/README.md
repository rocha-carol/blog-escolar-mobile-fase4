# Blog Escolar Mobile

Aplicativo mobile em **React Native + Expo** para consumo da API REST do Blog Escolar, com foco em dois perfis:

- **Professor(a)**: cria, edita e exclui conteúdos e usuários.
- **Aluno(a)**: consulta conteúdos e interage com leitura.

---

## 1) Setup inicial

### Pré-requisitos

- Node.js LTS
- npm
- Expo (via `npx expo`)
- Expo Go no celular **ou** emulador Android/iOS

### Instalação

```bash
cd mobile
npm install
```

### Configuração de ambiente

A app utiliza a variável pública do Expo para base da API:

```bash
export EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

> No Windows: `set EXPO_PUBLIC_API_BASE_URL=...` (CMD) ou `$env:EXPO_PUBLIC_API_BASE_URL=...` (PowerShell).

### Execução

```bash
npm run start
```

Com o bundler aberto:

- pressione `a` para Android,
- pressione `i` para iOS,
- ou leia o QR Code com o Expo Go.

---

## 2) Arquitetura da aplicação

A estrutura é organizada por responsabilidades:

- `App.tsx`: bootstrap, providers globais e inicialização da navegação.
- `src/navigation`: fluxo principal com stack + tabs.
- `src/contexts`: autenticação, autorização para telas sensíveis e feedback global (toast).
- `src/screens`: páginas de listagem, detalhe, criação e edição.
- `src/services`: camada de integração REST (posts, usuários, autenticação e comentários).
- `src/components`: componentes reutilizáveis de formulário e ação.
- `src/theme`: tokens visuais centralizados.

### Fluxo técnico

1. Login define usuário e papel no `AuthContext`.
2. Sessão fica persistida em `AsyncStorage`.
3. O Axios em `services/api.ts` aplica base URL e cabeçalhos.
4. Navegação protege telas administrativas para perfil professor.
5. CRUDs atualizam estado local após resposta da API.

---

## 3) Requisitos funcionais atendidos

### 3.1 Página principal (lista de posts)

- Lista completa de posts.
- Card com título, autoria e resumo.
- Busca por termo com atualização da listagem.

### 3.2 Página de leitura de post

- Exibição completa do conteúdo selecionado.
- Suporte a comentários (carregar + enviar).

### 3.3 e 3.4 Criação/edição de postagens

- Formulário com título, conteúdo e autor.
- Modo criação e modo edição com carga de dados atuais.
- Persistência via endpoints REST.

### 3.5, 3.6 e 3.7 Professores (cadastro, edição e listagem)

- Listagem paginada de docentes.
- Busca por termo.
- Ações de editar e excluir por item.
- Tela de formulário para criar/editar professor.

### 3.8 Estudantes (mesmo padrão de professores)

- Listagem paginada de alunos.
- Busca por termo.
- Ações de editar e excluir.
- Formulário de criação/edição de aluno.

### 3.9 Página administrativa

- Área de gerenciamento de posts com listar/editar/excluir.
- Acesso condicionado ao perfil docente.

### 3.10 Autenticação e autorização

- Login para professor implementado.
- Controle de acesso para restringir páginas de administração.
- Alunos com foco em visualização e navegação de conteúdo.

---

## 4) Requisitos técnicos aplicados

### React Native

- Projeto com Expo + React Native.
- Predominância de componentes funcionais e hooks.

### Estilização

- Paleta de cores centralizada em `src/theme/colors.ts`.
- Componentes reutilizáveis para padronizar UI.

### Integração back-end

- Endpoints REST para:
  - posts (listar, detalhe, criar, editar, excluir),
  - professores e alunos (CRUD com paginação e busca),
  - autenticação,
  - comentários.

### Gerenciamento de estado

- `Context API` para autenticação e autorização de gestão.
- Estado local por tela para formulários, paginação e carregamento.

---

## 5) Guia rápido de uso

1. Inicie o app e realize login.
2. Acesse a aba de posts para listar e pesquisar.
3. Abra um post para leitura completa e comentários.
4. Se for professor(a), use as abas administrativas para:
   - criar/editar/excluir posts,
   - cadastrar/editar/excluir professores e alunos.

---

## 6) Entrega e documentação complementar

### Código-fonte

- Repositório com a pasta `mobile` contendo a aplicação completa.

### Apresentação gravada (até 15 min)

Sugestão de roteiro:

1. Visão geral e objetivo do app.
2. Fluxo de login e papéis.
3. CRUD de posts.
4. CRUD de professores/alunos com paginação.
5. Explicação técnica da arquitetura.

### Documento técnico do projeto

Este README cobre:

- setup inicial,
- arquitetura,
- requisitos atendidos,
- guia de uso,
- decisões técnicas.

---

## 7) Experiências e desafios da equipe

- Sincronizar regras de permissão entre front-end e back-end.
- Organizar telas administrativas sem duplicar lógica.
- Garantir usabilidade em formulários longos no mobile.
- Ajustar ambiente local (`EXPO_PUBLIC_API_BASE_URL`) para diferentes redes/dispositivos.
