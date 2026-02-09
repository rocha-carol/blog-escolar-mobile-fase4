# Documentação do Aplicativo Mobile (Blog Escolar)

## 1. Objetivo

Este documento descreve a arquitetura do aplicativo mobile, como utilizar a aplicação e um relato das experiências/desafios enfrentados pela equipe durante o desenvolvimento.

O app mobile foi desenvolvido com **React Native + Expo** para consumir a API do Blog Escolar, com fluxos voltados para os perfis de **professor(a)** e **aluno(a)**.

---

## 2. Arquitetura do sistema (mobile)

### 2.0 Desenvolvimento em React Native

O desenvolvimento da interface gráfica do aplicativo mobile é realizado em
**React Native**, com foco em reutilização de componentes e organização por
responsabilidade.

Diretrizes adotadas no projeto:

- Uso de **componentes funcionais** para as telas e elementos de UI.
- Uso de **hooks** (`useState`, `useEffect`, `useMemo`, `useContext` e hooks
  customizados) para estado, ciclo de vida e lógica compartilhada.
- Separação da lógica de integração com API em `services`, mantendo as telas
  focadas em experiência do usuário.

Essa abordagem melhora a legibilidade, facilita testes e acelera a manutenção
do app ao longo das evoluções.

### 2.1 Visão geral

```text
[App React Native/Expo]
        |
        v
[Camada de serviços (Axios)]
        |
        v
[API REST Blog Escolar]
```

A aplicação foi estruturada em camadas para facilitar manutenção e evolução:

- **Screens (`src/screens`)**: telas principais da aplicação (login, listagens, detalhe, formulários e administração).
- **Navigation (`src/navigation`)**: definição dos fluxos de navegação e proteção de rotas.
- **Contexts (`src/contexts`)**: gerenciamento de sessão/autorização e mensagens globais (toast).
- **Services (`src/services`)**: integração com API (auth, posts, usuários, comentários).
- **Components (`src/components`)**: componentes reutilizáveis de UI e formulários.
- **Theme (`src/theme`)**: tokens de cores e padronização visual.

### 2.2 Fluxo de autenticação e autorização

1. Usuário realiza login na `LoginScreen`.
2. `AuthContext` armazena os dados da sessão e permissões de acesso.
3. Sessão é persistida localmente em `AsyncStorage`.
4. O cliente HTTP (Axios) utiliza `EXPO_PUBLIC_API_BASE_URL` e injeta credenciais necessárias nas requisições.
5. Navegação condiciona telas administrativas apenas para professor(a).

### 2.3 Fluxo funcional principal

- **Posts**: listar, pesquisar, visualizar detalhes e interagir com comentários.
- **Administração (professor)**:
  - CRUD de postagens;
  - CRUD de usuários (professores e alunos), com listagem e busca.

---

## 3. Uso da aplicação

### 3.1 Pré-requisitos

- Node.js LTS
- npm
- Expo CLI (via `npx expo`)
- Expo Go no celular ou emulador Android/iOS
- Backend do projeto em execução

### 3.2 Instalação

```bash
cd mobile
npm install
```

### 3.3 Configuração

Defina a URL da API:

```bash
export EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

> Em ambiente com dispositivo físico, utilize o IP da máquina na mesma rede local (ex.: `http://192.168.0.10:3000`).

### 3.4 Execução

```bash
npm run start
```

Com o Expo aberto:

- `a` para Android;
- `i` para iOS;
- ou leitura do QR Code no Expo Go.

### 3.5 Guia rápido

1. Faça login no app.
2. Navegue para a listagem de posts.
3. Abra um post para leitura e comentários.
4. Se o usuário for professor(a), acesse telas administrativas para criar/editar/excluir posts e gerenciar usuários.

---

## 4. Relato de experiências e desafios da equipe

Durante o desenvolvimento do mobile, os principais pontos observados foram:

1. **Integração com API e contratos de dados**  
   Foi necessário alinhar payloads e respostas para reduzir retrabalho entre front-end e back-end.

2. **Controle de permissões por perfil**  
   Garantir que ações administrativas ficassem disponíveis apenas para professor(a) exigiu cuidado no fluxo de navegação e contexto de autenticação.

3. **Persistência de sessão e experiência do usuário**  
   A gestão de sessão com `AsyncStorage` precisou de ajustes para manter login estável e evitar perda de contexto ao reabrir o app.

4. **Usabilidade em formulários mobile**  
   Formulários de criação/edição demandaram melhorias de feedback e validação para reduzir erros de preenchimento.

5. **Configuração de ambiente para testes em dispositivos**  
   A troca entre `localhost` e IP de rede no `EXPO_PUBLIC_API_BASE_URL` foi uma dificuldade recorrente durante testes em aparelhos físicos.

6. **Organização de código para manutenção**  
   A separação por `screens`, `services`, `contexts` e `components` ajudou a reduzir acoplamento e facilitou a colaboração entre integrantes.

Como resultado, a equipe consolidou um fluxo de desenvolvimento mais consistente, com melhor divisão de responsabilidades e maior previsibilidade na evolução do app mobile.
