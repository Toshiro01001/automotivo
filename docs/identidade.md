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
- Divisória entre seções: uma linha de 1 px em Risco, com um pequeno trecho em âmbar à esquerda (a "faixa amarela de segurança" do piso).

## Imagem

A imagem forte do hero é uma fotografia, dentro de um quadro com proporção fixa 3:2 e cantos de 6 px. Enquanto a foto definitiva não chega, `img/hero.webp` é uma composição abstrata gerada com Pillow nas cores da identidade: piso grafite com traços diagonais, um facho de luz âmbar vindo da direita e um disco escuro com reflexo (lembra um farol ou um disco de freio), sem texto. As demais ilustrações são SVG inline pequenos (ícones de serviço) e padrões em CSS.

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
