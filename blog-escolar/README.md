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
- [Mobile (experiência responsiva)](#mobile-experiência-responsiva)
  - [Setup inicial para dispositivos](#setup-inicial-para-dispositivos)
  - [Arquitetura e decisões para mobile](#arquitetura-e-decisões-para-mobile)
  - [Guia de uso no mobile](#guia-de-uso-no-mobile)
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

## Mobile (experiência responsiva)
Esta aplicação é web, mas foi pensada para funcionar bem em telas pequenas por meio de responsividade em CSS, especialmente nas páginas **Home** e **PostRead**. Os estilos usam breakpoints para adaptar layout, espaçamentos e comportamento dos componentes conforme a largura da tela. 

### Setup inicial para dispositivos
Para testar em um celular físico na mesma rede:
1. Inicie o servidor do Vite expondo a interface de rede:
   ```bash
   npm run dev -- --host
   ```
2. No terminal, observe o endereço LAN exibido pelo Vite (ex.: `http://192.168.0.10:5173`).
3. Acesse esse endereço no navegador do dispositivo móvel.

### Arquitetura e decisões para mobile
- **Breakpoints principais**: a responsividade é aplicada com `@media` queries em 700px, 900px e 1100px para ajustar colunas, grids e espaçamentos de listas e cards. 
- **Telas-chave**: 
  - **Home**: define a maior parte dos ajustes de layout para conteúdos, botões e seções de listagem. 
  - **PostRead**: adapta o fluxo de leitura, margens e composição de conteúdo em telas menores. 
- **CSS orientado a layout**: ajustes são concentrados em `src/styles/Home.css` e `src/styles/PostRead.css`, evitando lógica condicional no React para manter a interface consistente em desktop e mobile. 

### Guia de uso no mobile
- **Navegação**: use o menu e os cards da Home para abrir posts; o layout se reorganiza automaticamente para telas estreitas. 
- **Leitura e interação**: em PostRead, o conteúdo e os comentários são empilhados para melhorar a legibilidade em celulares. 
- **Testes rápidos**: reduza a largura da janela do navegador (ou use o modo responsivo do DevTools) para validar os mesmos breakpoints usados no mobile. 

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
