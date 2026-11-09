# Identidade visual: Rota 65 Centro Automotivo

Estudo curto de marca feito antes do código. Empresa, pessoas, endereço, telefone, preços e placas são fictícios. O site é uma demonstração da Mil e Uma Linhas! para convencer oficinas mecânicas e centros de estética automotiva de que dá para ter um site com cara própria.

## Nome e posicionamento

**Rota 65 Centro Automotivo** (65 é o DDD de Cuiabá; "rota" lembra estrada e o roteiro de revisão).

Frase de posicionamento: **"Seu carro de volta na rua, com hora marcada e sem surpresa no fim."**

Tom de voz: direto, de quem explica o orçamento item por item e não esconde nada. Fala em primeira pessoa do plural ("a gente", "nós") em frases curtas. Nada de gíria de "tuning", nada de adrenalina. É a oficina confiável do bairro com processo de concessionária.

## Paleta

| Cor | Hex | Papel |
| --- | --- | --- |
| Grafite | `#1F2327` | Fundo principal do site (o piso da oficina) |
| Chapa | `#2B3036` | Painéis, cartões, campos de formulário |
| Risco | `#3A4047` | Bordas, divisórias, traços do piso |
| Giz | `#ECEBE4` | Texto principal, títulos |
| Cone | `#A9ADB3` | Texto secundário, legendas, rótulos |
| Âmbar de farol | `#F2A51A` | Destaque: um por tela (o número grande, o botão principal, o selo de etapa atual) |
| Verde-sinal | `#35C27B` | Só estados "pronto", "ok" e "liberado" (acompanhamento e validação) |

Regras de uso:

- O âmbar aparece em um lugar por tela, no máximo dois quando um deles é o botão principal. Nunca em fundo grande; só em texto, borda, barra ou botão.
- O verde nunca é decorativo. Ele só diz "concluído" ou "campo certo".
- Texto sobre âmbar é sempre Grafite, nunca branco (contraste 10,4:1).
- Giz sobre Grafite: 13,6:1. Cone sobre Grafite: 6,5:1. Cone sobre Chapa: 5,3:1. Âmbar sobre Grafite: 9,0:1. Verde sobre Grafite: 8,1:1. Tudo acima de AA.
- Nada de preto puro, nada de vermelho, nada de textura de carbono.

## Tipografia

Duas famílias da mesma raiz, as duas em `fonts/` como woff2 (licença SIL OFL, texto em `fonts/LICENSE-*.txt`), obtidas com `npm pack @fontsource/barlow-condensed` e `@fontsource/barlow`, só o subconjunto latin.

- **Barlow Condensed** (600 e 700): títulos, números grandes, preços, horários, placa. Estreita e firme, lembra a tipografia de painel de instrumentos e de adesivo de oficina sem cair no "racing".
- **Barlow** (400, 500, 600): corpo, rótulos, botões, formulários. Mesma estrutura da condensada, então o site fica com uma voz só.

Escala tipográfica (desktop, com redução proporcional no celular via `clamp`):

| Papel | Família | Tamanho | Peso | Observação |
| --- | --- | --- | --- | --- |
| Número gigante (hero, preço da revisão) | Barlow Condensed | 96 a 128 px | 700 | `font-variant-numeric: tabular-nums`, entrelinha 0,9 |
| Título de seção (h2) | Barlow Condensed | 44 a 56 px | 700 | entrelinha 0,95, sem caixa alta |
| Subtítulo (h3) | Barlow Condensed | 26 a 30 px | 600 | |
| Corpo | Barlow | 17 px | 400 | entrelinha 1,55 |
| Corpo forte, rótulo de campo, botão | Barlow | 15 a 17 px | 600 | |
| Legenda, nota, faixa de demonstração | Barlow | 13 a 14 px | 400 e 500 | cor Cone |

Regra de peso: o 700 só existe na condensada e só em título ou número. No corpo, o máximo é 600. Caixa alta só no chapéu do hero e nas placas (que são assim na vida real).

## Layout

- Grade de 12 colunas, largura máxima de 1180 px, margem lateral de 20 px no celular e 40 px no desktop.
- Ritmo de espaçamento em múltiplos de 8 px: 8, 16, 24, 40, 64, 96. Seções separadas por 96 px no desktop e 64 px no celular.
- Alinhamento à esquerda em tudo. Nada centralizado, exceto o número dentro do mostrador do lembrete de óleo.
- Cantos de 6 px (ferramenta, não brinquedo). Botões e campos com 48 px de altura mínima para o dedo.
- Textura de piso: um padrão em CSS só, feito com `repeating-linear-gradient` em 45 graus (traços finos na cor Risco, a 6% de opacidade) sobre o Grafite. Aparece no fundo do hero e das seções de função; as seções de texto ficam lisas para descansar o olho.
- Cabeçalho de seção com régua: uma barra vertical de 3 px em âmbar à esquerda do título e do parágrafo (a "faixa amarela de segurança" do piso). Substituiu a divisória de 1 px que separava as seções.

## Imagem

A imagem forte do hero é uma fotografia, dentro de um quadro com proporção fixa 3:2 e cantos de 6 px. Enquanto a foto definitiva não chega, `img/hero.webp` é uma composição abstrata gerada com Pillow nas cores da identidade: piso grafite com traços diagonais, um facho de luz âmbar vindo da direita e um disco escuro com reflexo (lembra um farol ou um disco de freio), sem texto. As demais ilustrações são SVG inline pequenos (ícones de serviço) e padrões em CSS.

Na leva final entraram oito fotos geradas por IA no Canva (ilustrativas, sem pessoas identificáveis): seis nos cartões de serviço (4:3), uma da recepção no painel "A oficina" (3:2) e uma do mecânico ao lado dos depoimentos (3:4). Enquanto o Rodrigo Jr não coloca os arquivos definitivos em `img/`, os `.webp` com esses nomes são retângulos lisos na cor Risco, gerados com Pillow, só para marcar o lugar e a proporção.

Sem fotos de banco de imagens, sem pessoas reais, sem logotipos de montadoras. Os modelos de carro no montador de revisão são categorias genéricas (hatch compacto, sedã, SUV, picape), não marcas.

## Movimento

- Um único momento orquestrado na abertura: o número grande do hero "conta" de 0 até o valor em 900 ms e as linhas do hero sobem em cascata de 80 ms. Mais nada anima sozinho.
- Respostas a ações: o preço da revisão troca com um deslize de 200 ms; a etapa atual do acompanhamento tem um ponto que pulsa devagar; os horários selecionados preenchem em âmbar em 120 ms.
- Com `prefers-reduced-motion: reduce`, tudo isso vira troca instantânea e o ponto para de pulsar.

## Foto do hero

Proporção esperada: **3:2** (por exemplo 1800 x 1200 px), entregue como `img/hero.webp` com 1600 px de largura.

Prompt em português para gerar no Canva:

> Fotografia editorial de site premium, horizontal 3:2, de um disco de freio ventilado novo e uma chave de roda cruzada apoiados sobre piso de oficina em concreto polido cinza-grafite escuro. Luz quente âmbar vinda de uma única fonte à direita, como um farol aceso fora do quadro, com sombras longas e reflexo suave no metal. Fundo liso cinza-grafite (#1F2327), levemente desfocado, sem paredes com cartazes. Foco nítido no disco, profundidade de campo rasa. Sem pessoas, sem texto, sem logotipos, sem marcas de carro, sem vermelho. Estilo limpo, sóbrio e caro, como foto de catálogo de concessionária alemã.

Variação aceita se o disco não funcionar bem: um farol de LED aceso de um carro genérico, visto de perto e de lado, no mesmo piso e na mesma luz âmbar, sem mostrar emblema nem grade.

## Design systems aplicados (leva final)

Dupla escolhida no catálogo: **nexus-cyber-design-system** (escuro) e **lando-norris-design-system** (claro). A paleta não mudou: Grafite no lugar do marinho e do preto do nexus, Risco nas bordas, Âmbar de farol no lugar do #FFAB00 (uma vez por tela) e Verde-sinal só para "pronto". Nada de GSAP, shader, fumaça ou scanlines: só hachura, cantos, glow e revelações em CSS, com JavaScript próprio para observar a rolagem.

Como se misturam: o site inteiro continua escuro, então o nexus-cyber entra nas superfícies (painéis Chapa hachurados, botões com trilho, medidores, cantos de HUD, pílulas, rodapé com marca fantasma, cabeçalhos com régua, revelação com blur e abertura do hero). O lando-norris entra pela estrutura e pelo movimento (cartões de mídia com entalhe, células de contagem, revelação de linha, faixa de texto em loop e barra que troca de tema). O único respiro claro é a seção de depoimentos, que virou faixa Giz com texto Grafite; a barra do topo troca para o tema claro enquanto essa faixa passa sob ela.

Componentes, um a um:

| Componente | Origem | Onde |
| --- | --- | --- |
| Hatched panel (`.glow-card`) com hachura a 3% e brilho que segue o ponteiro (só com mouse) | nexus-cyber | `.painel.brilho` em #revisao, #agendar, #acompanhar e #oleo |
| Single rail button (trilho de 4 px que vira 8 px no hover, com varredura) | nexus-cyber | `.botao-principal` (trilho Grafite sobre Âmbar) e `.botao-secundario` (trilho Âmbar que vira Giz) |
| Integrity meter (trilho de 4 px com glow) | nexus-cyber | `.mostrador` do lembrete de óleo (com linha de rótulo e valor em %) e `.etapa-medidor` em cada etapa do acompanhamento |
| Corner accents (cantos de 16 px que crescem para 24 px) | nexus-cyber | `#acompanhar-painel` e `#revisao-resultado`, no hover e por 600 ms quando o resultado muda |
| Status pill com ponto pulsante | nexus-cyber | Etapa atual do acompanhamento (verde e sem pulso quando "pronto para retirar") e título "Agendado (simulação)" |
| Footer ghost wordmark ("ROTA 65" a 20vw) | nexus-cyber | `.rodape-fantasma` |
| Section header com régua | nexus-cyber | `.secao-cabeca` de todas as seções, inclusive #oficina |
| Reveal com blur (`.reveal` / `.active`) | nexus-cyber | `.secao > .miolo` e cada `.quadro-item`, com 100 ms de escada por lote |
| Boot sequence em CSS | nexus-cyber | `.hero-chapeu` (letter-spacing 0,5em para 0,1em em 1 s), `h1` (escala 1,1 e blur 10 px para nítido em 1 s) e o contador existente |
| Masked notched media card | lando-norris | `.quadro-item` em #servicos: foto 4:3 com entalhe por `clip-path` no canto superior direito, onde fica o preço |
| Count cell + icon cell com hairline de 0,5 px | lando-norris | `.hero-fatos` |
| Line highlight reveal (clip-path com bloco de cor) | lando-norris | `h2` de todas as `.secao-cabeca`, linha a linha, 150 ms entre linhas |
| Marquee de parceiros virando faixa de compromissos | lando-norris | `.compromissos` entre #oleo e #oficina, texto em SVG rolando em 40 s, pausa no hover |
| Nav theme follows section | lando-norris | `.topo` com `data-tema="claro"` enquanto #oficina (`data-nav-theme`) passa sob a barra, transição de 750 ms |

Com `prefers-reduced-motion: reduce`, tudo isso fica parado: os blocos já aparecem nítidos, os títulos aparecem inteiros, a faixa não rola, as pílulas não pulsam e o hero abre sem escala nem blur.
