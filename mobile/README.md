# Blog Escolar Mobile

Aplicativo mobile em **React Native + Expo** para consumo da API REST do projeto Blog Escolar.

> Este documento centraliza a documentação técnica do módulo `mobile`: setup, arquitetura, fluxos de autenticação/autorização e guia de uso.

---

## 1. Visão geral

O app possui dois perfis principais:

- **Professor(a)**: acesso completo para gestão de posts e usuários.
- **Aluno(a)**: acesso de leitura e navegação de conteúdo.

### Objetivo técnico

- Reutilizar uma única base mobile para múltiplos perfis.
- Integrar com backend REST via Axios.
- Persistir sessão local com `AsyncStorage`.
- Isolar responsabilidades entre navegação, serviços, contexto global e telas.

---

## 2. Stack e dependências principais

- **Expo 50** + **React Native 0.73**
- **TypeScript**
- **React Navigation** (stack + bottom tabs)
- **Axios** (cliente HTTP)
- **AsyncStorage** (persistência local de sessão)
- **Expo Google Fonts (Fredoka)**

Scripts disponíveis (`mobile/package.json`):

```bash
npm run start    # Expo dev server
npm run android  # abre emulador/dispositivo Android
npm run ios      # abre simulador iOS (macOS)
npm run web      # execução web via Expo
```

---

## 3. Setup inicial

## Pré-requisitos

- Node.js LTS (recomendado 18+)
- npm
- Expo CLI via `npx expo`
- App **Expo Go** no celular ou emulador Android/iOS
- Backend do projeto rodando (API REST)

## Instalação

```bash
cd mobile
npm install
```

## Configuração de ambiente

A aplicação utiliza `EXPO_PUBLIC_API_BASE_URL` para definir a base da API.

### Linux/macOS

```bash
export EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Windows (CMD)

```cmd
set EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Windows (PowerShell)

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://localhost:3000"
```

> Caso a variável não seja definida, o fallback padrão é `http://localhost:3000`.

## Execução

```bash
npm run start
```

Com o Metro Bundler aberto:

- `a` → Android
- `i` → iOS
- `w` → Web
- ou leia o QR Code no Expo Go

### Observação importante para dispositivo físico

Se estiver testando no celular, troque `localhost` pelo IP da máquina que está executando o backend (ex.: `http://192.168.0.10:3000`).

---

## 4. Estrutura de pastas

```text
mobile/
├── App.tsx
├── src/
│   ├── components/   # componentes reutilizáveis (botão, input, logout)
│   ├── contexts/     # estado global (auth, toasts, autorização de gestão)
│   ├── hooks/        # hooks utilitários (ex.: proteção de alterações não salvas)
│   ├── navigation/   # rotas stack/tabs
│   ├── screens/      # telas de UI e fluxos do app
│   ├── services/     # integração com API REST
│   ├── theme/        # tokens de design (cores)
│   └── types.ts      # tipagens compartilhadas
└── README.md
```

---

## 5. Arquitetura técnica

## 5.1 Bootstrap da aplicação

`App.tsx` inicializa:

1. carregamento de fontes (`Fredoka`),
2. providers globais (`AuthProvider`, `ToastProvider`, `ManagementAuthProvider`),
3. `AppNavigator` com todas as rotas.

## 5.2 Navegação

A navegação combina:

- **Stack Navigator** para fluxo principal e telas de detalhe/formulário.
- **Bottom Tabs** dinâmicas por perfil de usuário.

Comportamento por perfil:

- **Professor** vê abas de Posts + Admin + Professores.
- **Aluno** vê abas de Posts + Alunos.

As rotas privadas só são registradas quando existe usuário autenticado.

## 5.3 Gerenciamento de estado global

### `AuthContext`

Responsável por:

- login de professor,
- acesso de aluno por nome + RM,
- logout,
- bootstrap de sessão salva via `AsyncStorage`.

### `ManagementAuthContext`

Camada adicional de autorização local para telas de gerenciamento.

- Exibe modal pedindo senha de gestão.
- Libera acesso às telas administrativas apenas quando validado.
- Reseta autorização ao trocar usuário.

> Essa camada **não substitui** validações do backend.

### `ToastContext`

Exibe feedbacks globais de sucesso, informação e erro em formato de toast.

## 5.4 Camada de serviços

`src/services/api.ts` configura um cliente Axios com:

- `baseURL` vinda de `EXPO_PUBLIC_API_BASE_URL`,
- timeout de requisição,
- interceptor para anexar credenciais (`x-email` e `x-senha`) quando disponíveis.

Módulos de serviço:

- `auth.ts`
- `posts.ts`
- `comments.ts`
- `users.ts`

Essa separação facilita manutenção, testes e evolução da API.

## 5.5 Organização de UI

- `components/`: componentes de interface reutilizáveis.
- `screens/`: composição de fluxo por caso de uso.
- `theme/colors.ts`: paleta central para consistência visual.

---

## 6. Fluxos funcionais

## 6.1 Login e escolha de perfil

Na tela inicial (`LoginScreen`):

- usuário pode escolher **Sou professor** ou **Sou aluno**;
- caso exista sessão salva, é possível **continuar** ou **trocar usuário**.

## 6.2 Fluxo de professor

- Login com email/senha.
- Possibilidade de “Primeiro acesso” para criação de senha.
- Acesso às áreas de gestão (posts e usuários), condicionado ao perfil e autorização adicional de gerenciamento.

## 6.3 Fluxo de aluno

- Acesso com nome e RM.
- Navegação focada em consumo de conteúdo (lista e leitura de posts).

## 6.4 Gestão de conteúdo e usuários

Para professores:

- CRUD de posts,
- listagem e manutenção de usuários,
- formulários com validação e suporte a edição.

---

## 7. Guia de uso rápido

1. Inicie backend e mobile.
2. Abra o app e escolha o perfil.
3. Faça login (professor) ou entre como aluno (nome + RM).
4. Navegue pelos posts na aba inicial.
5. Abra um post para leitura completa e comentários.
6. Se for professor, acesse abas administrativas para gerenciar posts e usuários.

---

## 8. Integração com backend

A aplicação espera endpoints REST compatíveis com:

- autenticação,
- posts,
- comentários,
- usuários (professores/alunos).

Para evitar erro de conexão:

- confirme a URL da API em `EXPO_PUBLIC_API_BASE_URL`;
- valide se backend está ativo;
- em dispositivo físico, use IP da rede local (não `localhost`).

---

## 9. Troubleshooting

- **App abre sem dados**: verificar se backend está rodando e URL da API está correta.
- **Erro de autenticação**: revisar credenciais e headers enviados para API.
- **Funciona no emulador, mas não no celular**: substituir `localhost` por IP local.
- **Sessão antiga persistida**: usar opção “Trocar usuário” para limpar sessão ativa.

---

## 10. Melhorias futuras sugeridas

- centralizar validações com schema (ex.: Zod/Yup),
- incluir testes automatizados (unitários/integrados),
- suportar refresh token e expiração de sessão,
- adicionar monitoramento de erros e métricas de uso.

