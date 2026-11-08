# Vistoria de segurança: Rota 65 Centro Automotivo

Data: 2026-11-08. Site estático de demonstração, para publicação no GitHub Pages. Vistoria curta, feita antes do primeiro commit.

## Content-Security-Policy

Declarada por `<meta http-equiv="Content-Security-Policy">` em `index.html` e `404.html`:

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'
```

- Nenhum script inline, nenhum `onclick` no HTML, nenhum atributo `style=""` no HTML. O único estilo dinâmico (largura da barra do lembrete de óleo) é aplicado via CSSOM (`element.style.setProperty`), permitido sem `'unsafe-inline'`.
- `img-src` aceita `data:` só para a seta SVG do `select`, embutida no CSS.
- `connect-src 'none'` impede qualquer `fetch`, `XMLHttpRequest` ou WebSocket.
- `form-action 'none'`: os três formulários (agendamento, placa, óleo) nunca são submetidos a lugar algum; o JavaScript trata o `submit` com `preventDefault` e escreve o resultado na tela.
- Na `404.html`, `script-src 'none'`: a página não tem JavaScript.

## Envio de dados

Nenhum. O site não tem backend, não chama APIs, não carrega fontes, imagens ou scripts externos e não tem analytics. O único link externo é https://mileumalinhas.com.br, como texto, na faixa de demonstração e no rodapé.

## O que fica no navegador

- `localStorage`, chave única `rota65-agendamentos`, só quando a pessoa marca a caixa "Guardar este agendamento neste navegador" depois de confirmar. Conteúdo: lista de objetos com data e horário, nome do serviço, placa digitada, nome digitado e se pediu leva e traz. Nada de telefone ou endereço. O botão "Apagar todos" remove a chave. Leitura e escrita ficam em `try/catch` para navegadores sem armazenamento ou em modo privado.
- Nenhum cookie, nenhum `sessionStorage`, nenhum IndexedDB.
- A revisão montada, a placa consultada e o cálculo do óleo ficam só em memória e somem ao recarregar.

## Dependências

Nenhuma em tempo de execução. Fontes Barlow e Barlow Condensed são arquivos `woff2` locais, licença SIL OFL, com o texto da licença em `fonts/`. Os testes usam Playwright só no computador de quem desenvolve; nada dele vai para o site.

## Dados fictícios

Oficina, endereço ("Av. Fictícia, 650"), telefone "(65) 3000-0065", mecânicos, clientes dos depoimentos, preços, horários e as placas de exemplo (RTA1B65, QKV7C23, NPX2D90) foram inventados. As placas seguem o formato Mercosul apenas para a validação parecer real; não correspondem a veículos de propósito. Não há senha, chave ou credencial em nenhum arquivo.

## Riscos residuais

- Se a pessoa marcar "guardar" em um computador compartilhado, a placa, o nome e o horário ficam visíveis para quem usar o mesmo navegador. O aviso ao lado da caixa diz isso e o botão de apagar está na mesma seção.
- O acompanhamento por placa, numa oficina real, exporia dados do cliente a quem soubesse a placa (que é pública). Um site de verdade precisaria de um segundo fator (telefone cadastrado ou código da ordem de serviço). Aqui as placas são fictícias e o risco é nulo, mas está anotado para quando virar produto.
- A CSP por `<meta>` não cobre `frame-ancestors`; se alguém incorporar o site num `iframe`, o navegador não impede. Para um site estático de demonstração sem login nem dados reais, o impacto é nulo.
- Preços e intervalos de troca de óleo são exemplos; uma oficina real precisaria revisar os valores e os intervalos conforme o manual de cada fabricante antes de publicar.
