# HD Properties — landing page

Landing page bilingue (PT/EN) para a **HD Properties**, gestão de alojamento local no Algarve.

O hero é uma **maquete 3D** de uma aldeia algarvia — volumes brancos, platibandas, chaminés — com
um sol que o visitante move com o cursor: ao entardecer as sombras alongam-se e as janelas
acendem-se. Arrastar roda a maquete; passar sobre uma casa mostra a sua etiqueta.

## Direção de design — "Noite atlântica"

- **Cor**: fundo verde-petróleo (`--ink #05100e`), texto cor de cal (`--stone #e8e3d6`) e **um só
  acento**, o âmbar de sol poente (`--amber #e6a03c`). Os neutros têm viés verde para ficarem do
  lado da cal e não do cinzento morto.
- **Tipografia**: **Archivo** (variável, com eixo de largura) nos títulos e no monograma, **Manrope**
  no corpo, **DM Mono** nas etiquetas e nos números.
- **Estrutura**: a página é uma folha de desenho — réguas de 1px, coluna de etiquetas à esquerda,
  conteúdo à direita. Os serviços são uma grelha de células com réguas partilhadas, não cartões
  soltos; a numeração só aparece onde é informação (o processo, que é mesmo uma sequência).
- **Contenção**: um único painel elevado (o simulador), cantos de 2px, sem vidro nem gradientes
  decorativos.

## Ficheiros

```
site/
├── index.html          marcação de todas as secções (atributos data-i18n)
├── styles.css          tokens, tipografia e layout
├── hero3d.js           a maquete: cena, luz, sombras, interação
├── main.js             i18n, navegação, contadores, simulador, formulário
├── i18n.js             dicionário PT/EN
├── vendor/three.min.js three.js r147 (MIT), alojado aqui — sem CDN
├── CONTEUDO.md         checklist dos dados de exemplo a substituir
└── README.md
```

## Ver localmente

Abrir `index.html` chega. Para um servidor local:

```console
python3 -m http.server 8000 --directory site
# http://localhost:8000
```

## Publicar

Qualquer alojamento estático serve — Netlify, Vercel, Cloudflare Pages, GitHub Pages ou uma pasta
num servidor. A raiz é `site/`; não há passo de compilação.

## O que mexer

### Cores da marca

Estão todas em `:root`, no topo de `styles.css`:

```css
--amber: #e6a03c;   /* acento único */
--ink: #05100e;     /* fundo */
--stone: #e8e3d6;   /* texto */
```

Se a paleta oficial for clara ou corporativa, mantenha-a no acento — é a base escura que dá o
carácter. As cores da maquete estão no objeto `COLOR`, no topo de `hero3d.js`.

### Logótipo

O header e o rodapé usam um wordmark desenhado em CSS: o monograma `HD` em Archivo larga, uma
régua de 1px e o descritor. Para colocar o logótipo real, substitua o bloco `class="brand"` nos
dois sítios onde aparece por um `<img>` ou por um SVG inline.

### Textos e idiomas

Toda a cópia está em `i18n.js`, com as mesmas chaves em `pt` e `en`. No HTML:

- `data-i18n="chave"` — texto do elemento;
- `data-i18n-html="chave"` — idem, para valores com markup;
- `data-i18n-attr="atributo:chave"` — traduz um atributo (`content`, `aria-label`, …).

O idioma inicial vem do `localStorage`, senão do idioma do browser (`pt*` → PT, resto → EN). O
HTML está escrito em português: sem JavaScript, a página continua legível.

### Simulador de receita

Os pressupostos estão no objeto `SIM` em `main.js` (diária base por tipologia, multiplicadores de
zona e época, extras, comissão). São **valores de exemplo**: calibre-os antes de publicar. Os
mesmos números aparecem ao visitante em "Ver pressupostos" — ao mudar o objeto, atualize também as
chaves `sim.a.*` em `i18n.js`.

### Formulário

Sem backend: compõe um `mailto:` para o endereço em `CONTACT_EMAIL` (topo de `main.js`). Para
receber os pedidos automaticamente, troque esse bloco por um POST para o seu endpoint — há um
`TODO` no `submit` a indicar o sítio e um exemplo com Formspree.

## A maquete (`hero3d.js`)

- three.js alojado no repositório (`vendor/three.min.js`, MIT) — sem dependência de CDN e funciona
  offline. Se o ficheiro não carregar, o hero fica com o céu em CSS e a página funciona na mesma.
- Geometria com semente fixa: a aldeia é sempre a mesma.
- Sol direcional com sombras suaves; a posição segue o cursor (em cima é tarde, em baixo é poente),
  e o entardecer acende as janelas através de um só material partilhado.
- `Raycaster` para o realce e a etiqueta da casa sob o cursor; arrastar roda a câmara.
- `prefers-reduced-motion: reduce` desenha um único fotograma, sem órbita nem sol em movimento.
- O `requestAnimationFrame` pára quando o hero sai do ecrã ou o separador fica em segundo plano;
  em ecrãs pequenos a câmara afasta-se e o canvas fica mais discreto, para o texto respirar.

## Acessibilidade

Skip link, landmarks e uma só `<h1>`, foco visível em todos os interativos, acordeão e seletor de
idioma operáveis por teclado, canvas marcado `aria-hidden` (o conteúdo do hero é HTML real) e
movimento reduzido respeitado em toda a página.

## Notas

- As fontes vêm do Google Fonts com `display=swap` e stacks de sistema como alternativa.
- Sem imagens raster: tudo é CSS, SVG e WebGL.
- Os valores factuais são de exemplo e estão assinalados com um sublinhado tracejado. A lista
  completa está em [CONTEUDO.md](./CONTEUDO.md).
