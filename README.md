# Motor Racing Performance — Single Page Site

Site institucional de página única para um profissional de automobilismo (coaching, engenharia de performance e consultoria). Construído em React com uma animação cinematográfica de abertura controlada por scroll (frame-scrubbing em `<canvas>`, estilo Apple AirPods) que faz a transição para o conteúdo do site.

O projeto foi migrado de HTML/CSS/JS vanilla para uma arquitetura React idiomática, mantendo 100% do comportamento visual e das interações originais.

---

## Destaques técnicos

- Animação de abertura em `<canvas>` com 49 frames, interpolação (lerp) e loop `requestAnimationFrame` a ~60fps, controlada pelo scroll.
- Estado de alta frequência (progresso, frame atual, acumuladores de scroll) mantido em `useRef`, sem `useState`, para evitar re-renderizações e garantir performance.
- Transição de entrada e saída com círculos de progresso SVG e cooldown anti-repique.
- Fallback automático em telas menores que 768px: a intro é pulada e o site aparece diretamente.
- Carrossel de galeria com autoplay, thumbnails, dots, swipe por toque e navegação por teclado.
- Player de vídeo customizado com barra de progresso arrastável, mute e fullscreen (incluindo fallback `webkitEnterFullscreen` para iOS).
- Formulário de contato integrado ao Formspree, com estados de envio.
- Dados pessoais e de marca isolados em variáveis de ambiente, permitindo reaproveitar o layout para qualquer cliente sem editar o código.

---

## Stack

| Item | Tecnologia |
|------|------------|
| Build tool | Vite |
| Biblioteca | React 19 |
| Linguagem | TypeScript (strict) |
| Estilização | CSS Modules + CSS global com custom properties |
| Backend do formulário | Formspree |
| Animação | Canvas + `requestAnimationFrame` (sem bibliotecas de animação) |

---

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior

---

## Começando

```bash
# 1. Instalar dependências
npm install

# 2. Criar o arquivo de variáveis de ambiente
cp .env.example .env

# 3. Rodar em desenvolvimento
npm run dev
```

O servidor de desenvolvimento sobe em `http://localhost:5173`.

### Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Verificação de tipos (`tsc`) e build de produção em `dist/` |
| `npm run preview` | Servir localmente o conteúdo de `dist/` para conferência |

---

## Variáveis de ambiente

Todas as informações pessoais e de marca ficam fora do código-fonte, em variáveis de ambiente prefixadas com `VITE_`. Copie `.env.example` para `.env` e preencha os valores. O arquivo `.env` não é versionado.

| Variável | Descrição |
|----------|-----------|
| `VITE_SITE_TITLE` | Título da aba do navegador |
| `VITE_PERSON_NAME` | Nome exibido na intro, header e rodapé |
| `VITE_COMPANY_NAME` | Nome da empresa no rodapé de contato |
| `VITE_COPYRIGHT_YEAR` | Ano do copyright |
| `VITE_CONTACT_EMAIL` | E-mail de contato |
| `VITE_CONTACT_PHONE_DISPLAY` | Telefone formatado para exibição |
| `VITE_CONTACT_PHONE_TEL` | Telefone no formato do link `tel:` |
| `VITE_INSTAGRAM_URL` | URL do perfil no Instagram |
| `VITE_FORMSPREE_ACTION` | Endpoint do formulário no Formspree |
| `VITE_FORM_SUBJECT` | Assunto do e-mail gerado pelo formulário |
| `VITE_VIDEO_BADGE` | Selo exibido sobre o vídeo |
| `VITE_VIDEO_SECTION_HEADING` | Título da seção de vídeo |
| `VITE_VIDEO_SECTION_HIGHLIGHT` | Complemento destacado do título |
| `VITE_VIDEO_TITLE` | Título abaixo do player |
| `VITE_VIDEO_DESCRIPTION` | Descrição abaixo do player |
| `VITE_VIDEO_SRC` | Caminho do arquivo de vídeo em `public/` |

---

## Assets de mídia

Os arquivos de mídia não são versionados (ver `.gitignore`). As pastas existem no repositório por meio de arquivos `.gitkeep`, mas o conteúdo deve ser fornecido separadamente.

```
public/
├── frames/    # Animação de abertura: frame_000.jpg ... frame_048.jpg (49 arquivos)
├── gallery/   # Galeria: 1.jpg ... 21.jpg + hero-bg.jpeg
├── logo/      # logo.png e imagens de fundo
└── video/     # Arquivo de vídeo .mp4
```

Ao configurar um novo ambiente, copie os arquivos de mídia para essas pastas antes de rodar o build.

---

## Estrutura do projeto

```
.
├── public/                  # Assets estáticos servidos na raiz
├── src/
│   ├── components/          # Um componente por pasta (.tsx + .module.css)
│   │   ├── IntroStage/      # Canvas, overlays e vinheta da intro
│   │   ├── SiteHeader/      # Header, navegação e menu mobile
│   │   ├── Hero/
│   │   ├── Services/
│   │   ├── Achievements/
│   │   ├── About/           # Timelines, galeria e vídeo
│   │   ├── Timeline/        # Item de timeline reutilizável
│   │   ├── Gallery/         # Carrossel de fotos
│   │   ├── VideoPlayer/     # Player de vídeo customizado
│   │   ├── Contact/         # Formulário Formspree
│   │   └── SiteFooter/
│   ├── hooks/
│   │   ├── useIntroAnimation.ts  # Núcleo da animação (canvas, lerp, wheel, transições)
│   │   ├── useScrollReveal.ts    # Reveal em stagger via IntersectionObserver
│   │   └── useMediaQuery.ts      # Detecção de viewport
│   ├── config/
│   │   └── siteConfig.ts    # Leitura das variáveis de ambiente
│   ├── data/                # Conteúdo estruturado (timelines, serviços, DDIs)
│   ├── styles/
│   │   └── global.css       # Tokens, reset e estilos base
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── index.html
├── vite.config.ts
└── tsconfig.json
```

---

## Arquitetura da animação

A intro é a parte mais sensível do projeto e segue um princípio central: **nada que muda a cada frame passa pelo estado do React**.

- Progresso, índice de frame e acumuladores de scroll vivem em `useRef`.
- O loop `requestAnimationFrame`, os listeners de `wheel` (registrados com `{ passive: false }`) e o canvas ficam dentro de um único `useEffect`, com limpeza completa no retorno.
- O React só renderiza a estrutura e reage a uma única transição discreta: o booleano que revela o site.
- As trocas de classe e estilo de alta frequência são feitas imperativamente via refs, espelhando o comportamento do código vanilla original.

Essa abordagem mantém a animação fluida a 60fps sem re-renderizações desnecessárias.

---

## Build de produção

```bash
npm run build
```

O resultado é gerado em `dist/`, contendo HTML, CSS e JS prontos para hospedagem estática.

Para testar o build localmente:

```bash
npm run preview
```

---

## Deploy

O projeto é totalmente client-side e pode ser servido como conteúdo estático por qualquer servidor web (Nginx, Caddy, Vercel, Netlify) ou via container.

Passos gerais em um servidor:

```bash
git clone <repo> app
cd app
cp .env.example .env      # preencher as variáveis
# copiar os arquivos de mídia para public/
npm install
npm run build
# servir a pasta dist/
```

Lembre-se de que `.env` e os arquivos em `public/` não vêm do repositório e precisam ser copiados manualmente para o servidor.

---

## Licença

Projeto proprietário. Todos os direitos reservados ao respectivo titular.
