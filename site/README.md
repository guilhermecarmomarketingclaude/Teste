# HD Properties — landing page

Landing page bilingue (PT/EN) para a **HD Properties**, gestão de alojamento local no Algarve.
Design escuro e futurista, com uma cidade costeira em wireframe 3D no hero que reage ao ponteiro.

Sem build, sem dependências: três ficheiros e um dicionário de traduções.

```
site/
├── index.html      marcação de todas as secções (atributos data-i18n)
├── styles.css      sistema de design: tokens, vidro, brilhos, responsivo
├── main.js         hero em canvas, i18n, reveals, contadores, simulador, formulário
├── i18n.js         dicionário PT/EN
├── CONTEUDO.md     checklist dos dados de exemplo a substituir
└── README.md
```

## Ver localmente

Basta abrir `index.html` no browser. Para um servidor local:

```console
python3 -m http.server 8000 --directory site
# http://localhost:8000
```

## Publicar

Qualquer alojamento estático serve — Netlify, Vercel, Cloudflare Pages, GitHub Pages, ou uma
pasta num servidor. A raiz do site é `site/`; não há passo de compilação.

## O que mexer

### Cores da marca

Todas as cores estão em tokens no topo de `styles.css`:

```css
:root {
  --accent: #22e0d0;    /* acento primário */
  --accent-2: #7b5cff;  /* acento secundário */
  --accent-3: #ffb86b;  /* acento quente */
}
```

O hero lê estes mesmos tokens em tempo de execução, por isso a animação acompanha a paleta.
Se a paleta oficial for clara, mantenha-a nos acentos: a base escura é o que dá o aspeto
futurista.

### Logótipo

O header e o rodapé usam um wordmark tipográfico (`.brand-mark` + `.brand-name`). Para colocar o
logótipo real, substitua o `<span class="brand-mark">HD</span>` por um `<img>` ou por um SVG
inline nos dois sítios onde aparece `class="brand"`.

### Textos e idiomas

Toda a cópia vive em `i18n.js`, com as mesmas chaves em `pt` e `en`. No HTML:

- `data-i18n="chave"` — substitui o texto do elemento;
- `data-i18n-html="chave"` — idem, para valores com markup;
- `data-i18n-attr="atributo:chave"` — traduz um atributo (`content`, `aria-label`, …).

O idioma inicial vem do `localStorage`, senão do idioma do browser (`pt*` → PT, resto → EN).
O HTML está escrito em português, por isso a página continua legível mesmo sem JavaScript.

### Simulador de receita

Os pressupostos estão no objeto `SIM` em `main.js` (diária base por tipologia, multiplicadores de
zona e de época, extras, comissão). São **valores de exemplo**: calibre-os com dados reais antes
de publicar. Os mesmos números aparecem ao visitante em "Ver pressupostos do cálculo"
(chaves `sim.a.*` em `i18n.js`) — ao mudar o objeto, mude também esses textos.

### Formulário de contacto

Sem backend: por omissão compõe um `mailto:` para o endereço em `CONTACT_EMAIL` (topo de
`main.js`). Para receber os pedidos automaticamente, troque esse bloco por um POST para o seu
endpoint — há um `TODO` no `submit` a indicar o sítio exato e um exemplo com Formspree.

## Animação do hero

Motor 3D minimalista em canvas 2D (~250 linhas, sem bibliotecas):

- geometria com seed fixa, por isso a cidade é sempre a mesma;
- a câmara segue o ponteiro (yaw/pitch interpolados) e faz uma órbita lenta quando está parado;
- o edifício mais próximo do cursor acende, sobe e mostra um rótulo HUD;
- clicar ou tocar lança uma onda que percorre a grelha do mar;
- `prefers-reduced-motion: reduce` desenha um único fotograma estático, sem órbita nem partículas;
- o `requestAnimationFrame` pára quando o hero sai do ecrã ou o separador fica em segundo plano.

## Acessibilidade

Skip link, landmarks e uma só `<h1>`, foco visível em todos os interativos, acordeão e seletor de
idioma operáveis por teclado, canvas marcado `aria-hidden` (o conteúdo do hero é HTML real), e
movimento reduzido respeitado em toda a página.

## Notas

- As fontes (Space Grotesk e JetBrains Mono) vêm do Google Fonts com `display=swap` e uma stack de
  sistema completa como alternativa — se a rede falhar, a página mantém-se correta.
- Não há imagens: tudo é CSS, SVG e canvas.
- Os valores factuais são de exemplo e estão assinalados na página com um sublinhado tracejado.
  A lista completa está em [CONTEUDO.md](./CONTEUDO.md).
