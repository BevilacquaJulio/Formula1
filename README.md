# Affonso Giaffone — Motor Racing Performance

> **Projeto desenvolvido e entregue a cliente internacional (EUA)** — website institucional profissional desenvolvido para o ex-piloto **Affonso Giaffone** (Indianapolis 500 1997, FIA F3 Sul-Americano Champion 1991), publicado em produção no domínio oficial **[giaffone.com](https://giaffone.com)**.

---

## Sobre o projeto

Website institucional **em inglês**, desenvolvido para um cliente americano nativo, apresentando a trajetória esportiva e os serviços de **coaching, performance e consultoria** no automobilismo internacional oferecidos pelo piloto.

O projeto foi idealizado, desenvolvido, entregue e **colocado em produção** por mim, com foco em experiência cinematográfica, alta performance e design institucional moderno.

- **Cliente:** Affonso Giaffone (EUA)
- **Domínio em produção:** [giaffone.com](https://giaffone.com)
- **Idioma:** Inglês (EN-US)
- **Data de entrega:** Março de 2026
- **Tipo de projeto:** Trabalho autoral entregue a cliente internacional

---

## Destaques

### Animação cinematográfica de abertura (IA generativa)

A experiência de entrada do site apresenta uma **animação em tela cheia sincronizada com o scroll**, criando a sensação de um trailer cinematográfico antes da revelação do site propriamente dito.

**Como foi feita:**
1. A animação original foi gerada com **Google Veo 3.1** (modelo de IA generativa de vídeo do Google).
2. O vídeo foi **exportado como sequência de frames em JPG**.
3. No front-end, os frames são renderizados **quadro a quadro em um elemento `<canvas>`**, controlados por JavaScript puro.
4. A progressão dos frames é **atrelada ao scroll do usuário**, técnica similar à usada por sites premium como *Apple AirPods Pro*.

O resultado é uma abertura fluida, responsiva à interação e totalmente customizada.

### Outras funcionalidades

- **Player de vídeo customizado** com controles próprios (play/pause, barra de progresso arrastrável, mudo, fullscreen) para exibição do footage histórico da corrida Indy Racing League Las Vegas 1997.
- **Carrossel de fotos interativo** com 21 imagens, thumbnails, dots, barra de progresso e contador dinâmico.
- **Timeline cronológica** da carreira esportiva (1987–2019) com marcos de conquistas em destaque.
- **Formulário de contato internacional** integrado ao **Formspree**, com seleção de código de país (DDI) e validação nativa.
- **Indicadores de scroll animados** (enter/exit hints) com SVG de progresso circular.
- **Menu hamburger mobile** com navegação por âncora e scroll suave.
- **Layout 100% responsivo** (desktop, tablet, mobile).

---

## Tecnologias utilizadas

| Camada | Stack |
|---|---|
| Markup | HTML5 semântico |
| Estilização | CSS3 (custom properties, flexbox, grid, keyframes, transitions) |
| Interatividade | JavaScript Vanilla (ES6+) — sem frameworks |
| Animação de abertura | Canvas API + sequência de frames |
| IA generativa de vídeo | **Google Veo 3.1** |
| Backend de formulário | Formspree |
| Tipografia | Google Fonts (Teko, Barlow Condensed, Bebas Neue, Inter) |
| Iconografia | SVG inline customizado |
| Hospedagem | Produção em domínio próprio ([giaffone.com](https://giaffone.com)) |

---

## Ferramentas utilizadas

- **Google Veo 3.1** — geração da animação cinematográfica de abertura via IA
- **VS Code** — editor principal
- **Cursor AI** — assistente de desenvolvimento com IA
- **Formspree** — backend de formulário sem servidor
- **Google Fonts** — tipografias display e corpo de texto
- **Git / GitHub** — versionamento

---

## Técnicas e padrões aplicados

- **Scroll-driven animation** via Canvas API (playback frame-by-frame sincronizado com `scrollY`)
- **Stacking context isolado** entre camada de animação e site, evitando artefatos de compositing
- **SVG animado** para indicadores circulares (stroke-dashoffset animado via CSS/JS)
- **Anchor scroll intercept** para smooth scrolling em container `overflow-y: auto` fixo
- **Accessibility hints** com `aria-hidden`, `aria-label` e controles acessíveis por teclado
- **Mobile-first responsiveness** com breakpoints por media queries
- **Otimização de assets** (preconnect de fontes, preload de metadata de vídeo)

---

## Estrutura do projeto

```
pagina_web/
├── index.html              # Estrutura principal da página
├── style.css               # Estilização completa
├── script.js               # Lógica de animação, carrossel, player e interações
└── img/                    # Assets (frames da animação, galeria, vídeo, logo)
```

---

## Sobre o cliente

**Affonso Giaffone** é ex-piloto profissional de automobilismo, com trajetória internacional que inclui:

- Campeão FIA F3 Sul-Americano — **1991**
- Indy Lights — Rookie of the Year e 3º no campeonato — **1995**
- IndyCar e **Indianapolis 500** — **1997**
- Stock Car Brasil, Porsche GT3 Cup Brasil e trabalho como engenheiro de corrida e coach de pilotos

Atualmente oferece serviços de **coaching, performance engineering e consultoria** para pilotos e equipes em nível internacional.

---

## Resultado

Projeto **desenvolvido, entregue e em produção** desde março de 2026, atendendo diretamente a cliente do mercado americano com padrão de qualidade internacional — do design institucional à experiência cinematográfica de abertura com IA generativa.

---

## Autor

Desenvolvido por **Bevilaqua** como projeto autoral para cliente internacional.

> Quer um site institucional nesse mesmo padrão? Entre em contato.

---

*© 2026 — Este repositório é exibido como portfólio. Os direitos do site publicado e da marca Giaffone Racing pertencem ao cliente.*
