# Blog Escolar - Front-end

Documentação técnica detalhada do front-end do **Blog Escolar**, construída com React + TypeScript + Vite.

## Sumário
- [Visão geral](#visão-geral)
- [Setup inicial](#setup-inicial)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação)
  - [Scripts disponíveis](#scripts-disponíveis)
- [Arquitetura da aplicação](#arquitetura-da-aplicação)
  - [Stack principal](#stack-principal)
  - [Estrutura de pastas](#estrutura-de-pastas)
  - [Fluxo de dados e responsabilidades](#fluxo-de-dados-e-responsabilidades)
- [Guia de uso](#guia-de-uso)
  - [Rodando em modo desenvolvimento](#rodando-em-modo-desenvolvimento)
  - [Gerando build de produção](#gerando-build-de-produção)
  - [Preview do build](#preview-do-build)

## Visão geral
O front-end do Blog Escolar é responsável por apresentar a interface de leitura e publicação de conteúdos escolares. Ele consome serviços expostos pelo back-end (API) e organiza a navegação e o estado da aplicação no cliente.

## Setup inicial

### Pré-requisitos
- Node.js (versão LTS recomendada)
- npm (ou gerenciador compatível, como pnpm/yarn)

### Instalação
1. Acesse a pasta do front-end:
   ```bash
   cd blog-escolar
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```

### Scripts disponíveis
- **Iniciar servidor de desenvolvimento**:
  ```bash
  npm run dev
  ```
- **Gerar build de produção**:
  ```bash
  npm run build
  ```
- **Pré-visualizar build localmente**:
  ```bash
  npm run preview
  ```
- **Rodar lint**:
  ```bash
  npm run lint
  ```

## Arquitetura da aplicação

### Stack principal
- **React**: biblioteca principal de UI.
- **TypeScript**: tipagem estática e maior segurança no desenvolvimento.
- **Vite**: bundler rápido para desenvolvimento e produção.

### Estrutura de pastas
Estrutura base do projeto:
```
blog-escolar/
├─ public/                # Arquivos estáticos públicos
├─ src/                   # Código-fonte do front-end
│  ├─ assets/             # Imagens, ícones e mídias
│  ├─ components/         # Componentes reutilizáveis
│  ├─ pages/              # Páginas e telas principais
│  ├─ services/           # Integrações com API (fetch/axios)
│  ├─ styles/             # Estilos globais e temas
│  ├─ App.tsx             # Componente raiz da aplicação
│  └─ main.tsx            # Ponto de entrada
├─ index.html             # HTML base do Vite
├─ package.json           # Dependências e scripts
└─ vite.config.ts         # Configurações do Vite
```

### Fluxo de dados e responsabilidades
- **`main.tsx`** inicializa o React e injeta o app na DOM.
- **`App.tsx`** centraliza o layout principal e a navegação.
- **`pages/`** contém telas principais (por exemplo, listagens de posts e detalhes).
- **`components/`** contém partes reutilizáveis da UI (cards, botões, cabeçalho, etc.).
- **`services/`** concentra chamadas à API e abstrai a comunicação HTTP.
- **`styles/`** organiza estilos globais e temas visuais.

## Guia de uso

### Rodando em modo desenvolvimento
```bash
npm run dev
```
O Vite iniciará o servidor local, normalmente em `http://localhost:5173`.

### Gerando build de produção
```bash
npm run build
```
O output será gerado na pasta `dist/`.

### Preview do build
```bash
npm run preview
```
Permite testar o build localmente antes de publicar em produção.
