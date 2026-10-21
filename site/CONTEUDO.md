# Dados por substituir

Nada nesta página é apresentado como facto verificado. Todos os valores abaixo são **exemplos**
e estão assinalados no site com um sublinhado tracejado e um `title` a dizer isso mesmo
(atributo `data-placeholder`). Substitua-os antes de publicar e remova o `data-placeholder` de
cada um que passe a ser real.

Se o site atual da HD Properties ficar acessível, é de lá que devem sair estes valores, bem como
o logótipo e as cores oficiais.

## Identidade

| O quê | Onde | Estado |
|---|---|---|
| Cores da marca | `styles.css` → `:root` (`--amber`, `--ink`, `--stone`) | direção "Noite atlântica": petróleo, cal e um âmbar |
| Cores da maquete 3D | `hero3d.js` → objeto `COLOR` no topo | paredes, chaminés, água e sol |
| Tipografia | `index.html` → link do Google Fonts; `styles.css` → `--font-display/body/mono` | Archivo + Manrope + DM Mono |
| Logótipo | `index.html` → dois blocos `class="brand"` (header e rodapé) | wordmark desenhado em CSS |
| Favicon | `index.html` → `<link rel="icon">` (SVG inline com "HD") | genérico |

## Números (secção de métricas)

| Valor de exemplo | Onde | Substituir por |
|---|---|---|
| `82%` ocupação em época alta | `index.html` → `.figures`, `data-count-to="82"` | ocupação real |
| `4,9/5` avaliação dos hóspedes | `data-count-to="4.9"` | média real das plataformas |
| `120+` imóveis sob gestão | `data-count-to="120"` | número real |
| `< 10 min` tempo de resposta | `data-count-to="10"` | tempo real |

Nota: o texto visível é gerado a partir de `data-count-to`, `data-count-prefix`,
`data-count-suffix` e `data-count-decimals` — mude o atributo, não só o texto.

## Comissões (secção de planos)

| Valor de exemplo | Onde |
|---|---|
| `15%` (Essencial), `20%` (Completo), `25%` (Premium) | `index.html` → `.plans`, `<span data-placeholder>` |

Os nomes e o conteúdo de cada plano estão em `i18n.js` (`plans.p1.*`, `plans.p2.*`, `plans.p3.*`).

## Testemunhos

Os três cartões são de demonstração, com um chip visível "Exemplo" e a secção a dizê-lo. Textos
em `i18n.js` (`quotes.q1`–`quotes.q3`) e autoria em `quotes.a1`–`quotes.a3`.

Ao colocar testemunhos reais: use texto autorizado pelo cliente, remova o chip `Exemplo`
(`<span class="flag">` em cada `<figure class="quote">`), ajuste o subtítulo da secção
(`quotes.sub`) e retire o `data-placeholder` dos `figcaption`.

## Contactos e dados legais

| Valor de exemplo | Onde |
|---|---|
| `+351 000 000 000` (telefone) | `index.html` → `.contact-list`, `href="tel:..."` |
| `info@hdproperties.pt` | `.contact-list` **e** `CONTACT_EMAIL` no topo de `main.js` |
| WhatsApp `+351 000 000 000` | `.contact-list`, `href="https://wa.me/..."` |
| Horário `Segunda a sábado, 9h–19h` | `i18n.js` → `contact.hoursValue` |
| NIF `000 000 000` | `index.html` → `.footer-legal` |
| Registo RNAL `00000/AL` | `index.html` → `.footer-legal` |

Em falta, a acrescentar quando existirem: morada, redes sociais, política de privacidade e termos.

## Simulador de receita

Os pressupostos são estimativas de mercado por calibrar, no objeto `SIM` em `main.js`:

- diária base por tipologia (T0 70 € … T4+ 240 €);
- multiplicador por zona (Albufeira 1,00 · Vilamoura 1,15 · Quarteira 1,05 · Almancil 1,20 ·
  Faro 0,90 · Olhão 0,85);
- época (baixa 45% / ×0,75 · média 70% / ×1,00 · alta 92% / ×1,55);
- extras (piscina +10%, vista mar +8%) e comissão de 20%.

Ao mudar estes números, atualize também os textos que os mostram ao visitante: `sim.a.base`,
`sim.a.zone`, `sim.a.season`, `sim.a.extras`, `sim.a.commission` e `sim.a.month` em `i18n.js`.

## Conteúdo a confirmar

- **Serviços** (`services.s1`–`s8`): confirmar que descrevem o que a HD Properties faz de facto,
  sobretudo limpeza/lavandaria, manutenção e apoio ao licenciamento.
- **Processo** (`process.p1`–`p4`): confirmar o prazo indicado ("duas a quatro semanas").
- **FAQ** (`faq.q1`–`q6` / `faq.a1`–`a6`): as respostas sobre contrato, pagamentos e danos têm de
  refletir o contrato real.
- **Zonas**: Albufeira, Vilamoura, Quarteira, Almancil, Faro e Olhão. Se a área mudar, ajustar a
  lista, os pontos do mapa SVG (`.pin`) e as opções do simulador e do formulário.
