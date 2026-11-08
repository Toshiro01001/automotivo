/* Testes do site Rota 65 Centro Automotivo com Playwright.
   Antes de rodar, sirva a pasta do site: python3 -m http.server 8316
   Depois: node tests/site.cjs
   Variáveis opcionais: URL (padrão http://localhost:8316/), CAPTURAS (pasta para salvar PNGs). */
const { chromium, devices } = require("playwright");
const fs = require("fs");
const path = require("path");

const URL = process.env.URL || "http://localhost:8316/";
const CAPTURAS = process.env.CAPTURAS || "";

const TELAS = [
  { nome: "computador", opcoes: { viewport: { width: 1280, height: 900 } } },
  { nome: "iphone13", opcoes: { ...devices["iPhone 13"] } },
  { nome: "estreito", opcoes: { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } }
];

let falhas = 0;
function ok(cond, msg) {
  if (cond) { console.log("  ok   " + msg); }
  else { falhas++; console.log("  FALHA " + msg); }
}

async function verificarLayout(page, nome) {
  const info = await page.evaluate(() => {
    const larguraJanela = document.documentElement.clientWidth;
    const rolagem = document.documentElement.scrollWidth > larguraJanela + 1;
    const cortados = [];
    const estourados = [];
    document.querySelectorAll("body *").forEach((e) => {
      if (!e.offsetParent && e.tagName !== "BODY") { return; }
      const r = e.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) { return; }
      if (r.right > larguraJanela + 1 && getComputedStyle(e).position !== "fixed") {
        estourados.push(e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (e.className && typeof e.className === "string" ? "." + e.className.split(" ")[0] : ""));
      }
      const temTexto = Array.from(e.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!temTexto) { return; }
      const cs = getComputedStyle(e);
      if (cs.overflowX === "hidden" || cs.overflowX === "clip" || cs.textOverflow === "ellipsis") {
        if (e.scrollWidth > e.clientWidth + 1) {
          cortados.push(e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + ": " + e.textContent.trim().slice(0, 40));
        }
      }
    });
    return { rolagem, cortados, estourados: estourados.slice(0, 8) };
  });
  ok(!info.rolagem, nome + ": sem rolagem horizontal");
  ok(info.estourados.length === 0, nome + ": nenhum elemento passa da borda" + (info.estourados.length ? " (" + info.estourados.join(", ") + ")" : ""));
  ok(info.cortados.length === 0, nome + ": nenhum texto cortado" + (info.cortados.length ? " (" + info.cortados.join(" | ") + ")" : ""));
}

async function capturar(page, nome) {
  if (!CAPTURAS) { return; }
  fs.mkdirSync(CAPTURAS, { recursive: true });
  await page.screenshot({ path: path.join(CAPTURAS, nome + ".png") });
}

// O site usa rolagem suave; nos testes ela atrapalha o clique logo depois de rolar.
async function semRolagemSuave(page) {
  await page.evaluate(() => { document.documentElement.style.setProperty("scroll-behavior", "auto"); });
}

function limpo(t) { return (t || "").replace(/\s+/g, " ").trim(); }

async function testarTela(browser, tela) {
  console.log("\n== " + tela.nome + " ==");
  const context = await browser.newContext(tela.opcoes);
  const page = await context.newPage();
  const erros = [];
  page.on("console", (m) => { if (m.type() === "error") { erros.push(m.text()); } });
  page.on("pageerror", (e) => erros.push("pageerror: " + e.message));
  page.on("requestfailed", (r) => erros.push("request: " + r.url()));
  page.on("response", (r) => { if (r.status() >= 400) { erros.push("http " + r.status() + " " + r.url()); } });

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  await semRolagemSuave(page);
  await capturar(page, "capa-" + tela.nome);
  await verificarLayout(page, "abertura");
  const fotoOk = await page.evaluate(() => { const i = document.querySelector(".hero-foto"); return i && i.complete && i.naturalWidth === 1620; });
  ok(fotoOk, "hero: foto carregada com 1620px de largura");
  ok(limpo(await page.locator("#contador").textContent()) === "24", "hero: contador terminou em 24");

  // Menu do celular
  const menuVisivel = await page.locator("#menu-botao").isVisible();
  if (menuVisivel) {
    await page.locator("#menu-botao").click();
    ok((await page.locator("#menu-botao").getAttribute("aria-expanded")) === "true", "menu: abre e marca aria-expanded");
    await page.locator("#menu a[href='#revisao']").click();
    await page.waitForTimeout(300);
    ok((await page.locator("#menu-botao").getAttribute("aria-expanded")) === "false", "menu: fecha ao escolher uma seção");
  }

  // Função 1: montador de revisão
  ok(limpo(await page.locator("#revisao-preco").textContent()) === "390", "revisão: hatch 10 mil = R$ 390 (" + limpo(await page.locator("#revisao-preco").textContent()) + ")");
  ok((await page.locator("#revisao-itens li").count()) === 6, "revisão: 6 itens na revisão de 10 mil");
  await page.locator("#revisao-categorias input[value='suv']").check({ force: true });
  await page.locator("#revisao-kms input[value='40']").check({ force: true });
  await page.waitForTimeout(250);
  const precoSuv = limpo(await page.locator("#revisao-preco").textContent());
  ok(precoSuv === "1.140", "revisão: SUV 40 mil = R$ 1.140 (" + precoSuv + ")");
  ok((await page.locator("#revisao-itens li").count()) === 10, "revisão: 10 itens na revisão de 40 mil");
  ok((await page.locator("#revisao-itens li.inspecao").count()) === 4, "revisão: 4 itens de inspeção sem custo");
  await page.locator("#revisao-extras input[value='polimento']").check({ force: true });
  await page.waitForTimeout(250);
  ok(limpo(await page.locator("#revisao-preco").textContent()) === "1.590", "revisão: extra polimento soma R$ 450 = 1.590");
  ok((await page.locator("#revisao-itens li.extra").count()) === 1, "revisão: extra aparece na lista com marca âmbar");
  ok(limpo(await page.locator("#revisao-rotulo").textContent()).includes("40 mil km, suv"), "revisão: rótulo descreve a escolha");
  await page.locator("#revisao .secao-cabeca").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await verificarLayout(page, "revisão");
  await capturar(page, "revisao-" + tela.nome);

  // Função 2: agendamento
  ok((await page.locator("#ag-dias .dia").count()) === 8, "agendar: 8 dias de atendimento");
  ok((await page.locator("#ag-horarios .hora").count()) === 0, "agendar: horários só aparecem depois do dia");
  await page.locator("#agendar-form").evaluate((f) => f.requestSubmit());
  await page.waitForTimeout(200);
  ok(!(await page.locator("#ag-erro").isHidden()) && limpo(await page.locator("#ag-erro").textContent()).includes("dia"), "agendar: sem dia, pede o dia");
  // escolhe a primeira terça-feira (dia da semana 2: ocupados 09:00 e 13:00)
  const indiceTerca = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll("#ag-dias .dia"));
    return labels.findIndex((l) => l.querySelector(".dia-sem").textContent === "ter");
  });
  ok(indiceTerca >= 0, "agendar: existe uma terça entre os dias");
  await page.locator("#ag-dias input[value='" + indiceTerca + "']").check({ force: true });
  await page.waitForTimeout(200);
  const totalHoras = await page.locator("#ag-horarios .hora").count();
  const ocupadas = await page.locator("#ag-horarios input:disabled").count();
  ok(totalHoras === 9 && ocupadas === 2, "agendar: terça tem 9 vagas, 2 ocupadas (" + totalHoras + "/" + ocupadas + ")");
  ok(limpo(await page.locator("#ag-horarios-apoio").textContent()).includes("7 vagas"), "agendar: legenda conta 7 vagas livres");
  await page.locator("#ag-horarios input[value='16:00']").check({ force: true });
  await page.waitForTimeout(200);
  ok(limpo(await page.locator("#res-hora").textContent()) === "16:00", "agendar: resumo mostra 16:00");
  ok(limpo(await page.locator("#res-entrega").textContent()).includes("dia seguinte"), "agendar: revisão às 16:00 entrega no dia seguinte");
  await page.locator("#ag-horarios input[value='08:00']").check({ force: true });
  await page.waitForTimeout(200);
  ok(limpo(await page.locator("#res-entrega").textContent()) === "mesmo dia, 11:00", "agendar: revisão às 08:00 entrega às 11:00 (" + limpo(await page.locator("#res-entrega").textContent()) + ")");
  await page.locator("#ag-leva").check({ force: true });
  await page.waitForTimeout(200);
  ok(await page.locator("#ag-bairro-campo").isVisible(), "agendar: leva e traz mostra o bairro");
  await page.locator("#ag-bairro").selectOption("vg");
  await page.waitForTimeout(200);
  ok(limpo(await page.locator("#res-total").textContent()) === "400", "agendar: 340 + 60 de Várzea Grande = 400 (" + limpo(await page.locator("#res-total").textContent()) + ")");
  await page.locator("#ag-nome").fill("Teste");
  await page.locator("#ag-placa").fill("abc-12");
  await page.locator("#agendar-form").evaluate((f) => f.requestSubmit());
  await page.waitForTimeout(200);
  ok(limpo(await page.locator("#ag-erro").textContent()).includes("placa"), "agendar: placa inválida é recusada");
  await page.locator("#ag-placa").fill("rta1b65");
  ok((await page.locator("#ag-placa").inputValue()) === "RTA1B65", "agendar: placa vira maiúscula sozinha");
  await page.locator("#agendar-form").evaluate((f) => f.requestSubmit());
  await page.waitForTimeout(400);
  ok(await page.locator("#ag-confirmado").isVisible(), "agendar: confirmação aparece");
  ok(limpo(await page.locator("#ag-confirmado-texto").textContent()).includes("RTA1B65"), "agendar: confirmação cita a placa");
  ok(await page.locator("#ag-guardados").isHidden(), "agendar: nada guardado antes de marcar a caixa");
  await page.locator("#ag-guardar").check({ force: true });
  await page.waitForTimeout(200);
  ok((await page.locator("#ag-guardados-lista li").count()) === 1, "agendar: marcar a caixa guarda 1 agendamento");
  const chave = await page.evaluate(() => localStorage.getItem("rota65-agendamentos"));
  ok(chave && chave.includes("RTA1B65") && !chave.includes("telefone"), "agendar: localStorage tem a chave rota65-agendamentos");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await semRolagemSuave(page);
  ok((await page.locator("#ag-guardados-lista li").count()) === 1, "agendar: agendamento sobrevive ao recarregar");
  await page.locator("#agendar .secao-cabeca").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await verificarLayout(page, "agendamento");
  await capturar(page, "agendamento-" + tela.nome);
  await page.locator("#ag-apagar").click();
  await page.waitForTimeout(200);
  ok(await page.locator("#ag-guardados").isHidden(), "agendar: apagar todos limpa a lista");
  ok((await page.evaluate(() => localStorage.getItem("rota65-agendamentos"))) === null, "agendar: localStorage limpo");

  // Função 3: acompanhamento por placa
  ok(await page.locator("#acompanhar-painel").isVisible(), "acompanhar: abre com o exemplo RTA1B65");
  ok((await page.locator("#ac-etapas .etapa.feita").count()) === 3 && (await page.locator("#ac-etapas .etapa.atual").count()) === 1, "acompanhar: RTA1B65 tem 3 etapas feitas e 1 atual");
  ok(limpo(await page.locator("#ac-etapas .etapa.atual .etapa-nome").textContent()) === "Em serviço", "acompanhar: etapa atual é 'Em serviço'");
  await page.locator(".chip-exemplo[data-placa='QKV7C23']").click();
  await page.waitForTimeout(200);
  ok((await page.locator("#ac-etapas .etapa.feita").count()) === 5, "acompanhar: QKV7C23 está pronto (5 feitas)");
  ok(limpo(await page.locator("#ac-etapas .etapa.atual .etapa-estado").textContent()).includes("liberado"), "acompanhar: última etapa diz 'liberado para retirada'");
  await page.locator("#placa-campo").fill("zzz9z99");
  await page.locator("#placa-form").evaluate((f) => f.requestSubmit());
  await page.waitForTimeout(200);
  ok(await page.locator("#placa-erro").isVisible() && await page.locator("#acompanhar-painel").isHidden(), "acompanhar: placa desconhecida mostra aviso e esconde o painel");
  await page.locator(".chip-exemplo[data-placa='NPX2D90']").click();
  await page.waitForTimeout(200);
  ok(limpo(await page.locator("#ac-placa").textContent()) === "NPX 2D90", "acompanhar: placa exibida com espaço");
  ok((await page.locator("#ac-etapas .etapa.futura").count()) === 4, "acompanhar: NPX2D90 tem 4 etapas futuras");
  await page.locator("#acompanhar .secao-cabeca").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await verificarLayout(page, "acompanhamento");
  await capturar(page, "acompanhar-" + tela.nome);

  // Função 4: lembrete de óleo
  ok(limpo(await page.locator("#oleo-km-restante").textContent()) === "3.150", "óleo: padrão semissintético, 46.350 - 42.000 = faltam 3.150");
  ok(limpo(await page.locator("#oleo-km-alvo").textContent()) === "49.500 km", "óleo: troca por km em 49.500");
  ok((await page.locator("#oleo-estado").getAttribute("class")).includes("ok"), "óleo: 58% a 63% do intervalo = estado ok");
  await page.locator("#oleo-tipos input[value='mineral']").check({ force: true });
  await page.waitForTimeout(200);
  ok(limpo(await page.locator("#oleo-km-restante").textContent()) === "650", "óleo: mineral 5.000 km deixa 650");
  ok((await page.locator("#oleo-estado").getAttribute("class")).includes("atencao"), "óleo: 87% do intervalo = atenção");
  await page.locator("#oleo-km-atual").fill("48000");
  await page.waitForTimeout(200);
  ok(limpo(await page.locator("#oleo-km-restante").textContent()) === "0", "óleo: vencido mostra 0 km");
  ok((await page.locator("#oleo-barra").getAttribute("class")).includes("vencido"), "óleo: barra marca vencido");
  ok(limpo(await page.locator("#oleo-primeiro").textContent()).includes("venceu"), "óleo: diz que já venceu");
  await page.locator("#oleo-km-atual").fill("41000");
  await page.waitForTimeout(200);
  ok(await page.locator("#oleo-erro").isVisible(), "óleo: km de hoje menor que o da troca gera aviso");
  await page.locator("#oleo-km-atual").fill("44000");
  await page.locator("#oleo-tipos input[value='sintetico']").check({ force: true });
  await page.waitForTimeout(200);
  ok(limpo(await page.locator("#oleo-km-restante").textContent()) === "8.000", "óleo: sintético 10.000 km deixa 8.000");
  await page.locator("#oleo .secao-cabeca").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await verificarLayout(page, "óleo");
  await capturar(page, "oleo-" + tela.nome);

  // Como funciona e 404
  await page.locator(".como-tecnico summary").click();
  await page.waitForTimeout(200);
  ok(await page.locator(".como-tecnico ul").isVisible(), "como funciona: detalhes técnicos abrem");
  await page.locator("#como-funciona").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await verificarLayout(page, "como funciona");

  ok(erros.length === 0, "console sem erros" + (erros.length ? ": " + erros.join(" | ") : ""));

  const p404 = await context.newPage();
  const erros404 = [];
  p404.on("console", (m) => { if (m.type() === "error") { erros404.push(m.text()); } });
  await p404.goto(URL + "404.html", { waitUntil: "networkidle" });
  ok((await p404.locator("h1").count()) === 1, "404: página carrega com título");
  ok(limpo(await p404.locator("h1").textContent()).includes("rua"), "404: texto da página presente (o CSS usa caminho absoluto /automotivo/, que só resolve no GitHub Pages)");
  await p404.close();

  await context.close();
}

(async () => {
  const browser = await chromium.launch();
  for (const tela of TELAS) { await testarTela(browser, tela); }
  await browser.close();
  console.log("\n" + (falhas ? falhas + " falha(s)" : "Tudo certo") + ".");
  process.exit(falhas ? 1 : 0);
})();
