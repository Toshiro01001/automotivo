/* Rota 65 Centro Automotivo: lógica do site.
   Tudo roda no navegador. Nenhum pedido sai para a internet.
   Módulos: utilidades, menu, contador do hero, revisão, agendamento,
   acompanhamento por placa, lembrete de óleo, depoimentos. */
(function () {
  "use strict";
  var D = window.ROTA65;
  var reduzMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- utilidades ---------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, texto) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (texto !== undefined) { e.textContent = texto; }
    return e;
  }
  function reais(v) { return Math.round(v).toLocaleString("pt-BR"); }
  function numero(v) { return Math.round(v).toLocaleString("pt-BR"); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  var DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  var MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  function dataCurta(d) { return DIAS_SEMANA[d.getDay()] + ", " + pad(d.getDate()) + " de " + MESES[d.getMonth()]; }
  function dataLonga(d) { return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear(); }
  function piscar(elemento) {
    if (reduzMovimento) { return; }
    elemento.classList.remove("trocando");
    void elemento.offsetWidth;
    elemento.classList.add("trocando");
  }
  function chip(nameAttr, valor, rotulo, marcado, classe) {
    var label = el("label", classe || "chip");
    var input = el("input");
    input.type = "radio"; input.name = nameAttr; input.value = valor; input.checked = !!marcado;
    var span = el("span", null, rotulo);
    label.appendChild(input); label.appendChild(span);
    return label;
  }

  /* ---------- menu do celular ---------- */
  (function menu() {
    var botao = $("menu-botao"), menu = $("menu");
    if (!botao || !menu) { return; }
    botao.addEventListener("click", function () {
      var aberto = menu.classList.toggle("aberto");
      botao.setAttribute("aria-expanded", aberto ? "true" : "false");
      botao.querySelector(".menu-botao-texto").textContent = aberto ? "Fechar" : "Menu";
    });
    menu.addEventListener("click", function (ev) {
      if (ev.target.tagName === "A") {
        menu.classList.remove("aberto");
        botao.setAttribute("aria-expanded", "false");
        botao.querySelector(".menu-botao-texto").textContent = "Menu";
      }
    });
  })();

  /* ---------- contador do hero (único momento orquestrado) ---------- */
  (function contador() {
    var alvoEl = $("contador");
    if (!alvoEl) { return; }
    var alvo = parseInt(alvoEl.getAttribute("data-alvo"), 10);
    if (reduzMovimento) { alvoEl.textContent = String(alvo); return; }
    var inicio = null, dur = 900;
    function passo(t) {
      if (inicio === null) { inicio = t; }
      var p = Math.min(1, (t - inicio) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      alvoEl.textContent = String(Math.round(alvo * e));
      if (p < 1) { requestAnimationFrame(passo); }
    }
    requestAnimationFrame(passo);
  })();

  /* ---------- função 1: montador de revisão ---------- */
  (function revisao() {
    var form = $("revisao-form");
    if (!form) { return; }
    var catBox = $("revisao-categorias"), kmBox = $("revisao-kms"), exBox = $("revisao-extras");
    D.CATEGORIAS.forEach(function (c, i) { catBox.appendChild(chip("categoria", c.id, c.nome, i === 0)); });
    Object.keys(D.REVISOES).forEach(function (km, i) { kmBox.appendChild(chip("km", km, km + " mil", i === 0)); });
    D.EXTRAS.forEach(function (x) {
      var label = el("label", "caixa");
      var input = el("input"); input.type = "checkbox"; input.name = "extra"; input.value = x.id;
      var span = el("span", null, x.nome);
      var preco = el("span", "caixa-preco", "+ R$ " + reais(x.preco));
      label.appendChild(input); label.appendChild(span); label.appendChild(preco);
      exBox.appendChild(label);
    });

    function calcular() {
      var catId = form.querySelector("input[name=categoria]:checked").value;
      var km = form.querySelector("input[name=km]:checked").value;
      var cat = D.CATEGORIAS.filter(function (c) { return c.id === catId; })[0];
      var ids = D.REVISOES[km];
      var total = 0, minutos = 60;
      var lista = $("revisao-itens");
      lista.textContent = "";
      ids.forEach(function (id) {
        var item = D.ITENS[id];
        var preco = item.preco * cat.fator;
        total += preco;
        minutos += item.preco === 0 ? 10 : 20;
        var li = el("li", item.preco === 0 ? "inspecao" : "");
        li.appendChild(el("span", null, item.nome));
        li.appendChild(el("span", "item-preco", item.preco === 0 ? "incluído" : "R$ " + reais(preco)));
        lista.appendChild(li);
      });
      var extras = Array.prototype.slice.call(form.querySelectorAll("input[name=extra]:checked"));
      extras.forEach(function (input) {
        var x = D.EXTRAS.filter(function (e) { return e.id === input.value; })[0];
        total += x.preco;
        if (x.id !== "levaTraz") { minutos += 45; }
        var li = el("li", "extra");
        li.appendChild(el("span", null, x.nome));
        li.appendChild(el("span", "item-preco", "R$ " + reais(x.preco)));
        lista.appendChild(li);
      });
      total = Math.round(total / 10) * 10;
      var precoEl = $("revisao-preco");
      precoEl.textContent = reais(total);
      piscar(precoEl);
      $("revisao-rotulo").textContent = "Revisão de " + km + " mil km, " + cat.nome.toLowerCase() + " (motor " + cat.motor + ")";
      var horas = Math.round(minutos / 30) / 2;
      $("revisao-tempo").textContent = "Cerca de " + String(horas).replace(".", ",") + " hora" + (horas === 1 ? "" : "s") + " na oficina, " + ids.length + " itens" + (extras.length ? " e " + extras.length + " extra" + (extras.length > 1 ? "s" : "") : "");
      $("revisao-agendar").setAttribute("data-servico", "revisao");
    }
    form.addEventListener("change", calcular);
    form.addEventListener("submit", function (ev) { ev.preventDefault(); });
    calcular();
  })();

  /* ---------- função 2: agendamento ---------- */
  (function agendamento() {
    var form = $("agendar-form");
    if (!form) { return; }
    var CHAVE = "rota65-agendamentos";
    var selServico = $("ag-servico"), diasBox = $("ag-dias"), horasBox = $("ag-horarios");
    var leva = $("ag-leva"), bairroCampo = $("ag-bairro-campo"), selBairro = $("ag-bairro");
    var erro = $("ag-erro"), confirmado = $("ag-confirmado");
    var dias = [];

    D.SERVICOS.forEach(function (s) {
      var o = el("option", null, s.nome + " (a partir de R$ " + reais(s.desde) + ")");
      o.value = s.id; selServico.appendChild(o);
    });
    D.BAIRROS.forEach(function (b) {
      var o = el("option", null, b.nome + " (+ R$ " + reais(b.preco) + ")");
      o.value = b.id; selBairro.appendChild(o);
    });

    // próximos 8 dias de atendimento (segunda a sábado), a partir de amanhã
    var d = new Date(); d.setHours(0, 0, 0, 0);
    while (dias.length < 8) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 0) { continue; }
      dias.push(new Date(d.getTime()));
    }
    dias.forEach(function (dia, i) {
      var label = el("label", "dia");
      var input = el("input"); input.type = "radio"; input.name = "dia"; input.value = String(i);
      var span = el("span");
      span.appendChild(el("span", "dia-sem", DIAS_SEMANA[dia.getDay()]));
      span.appendChild(el("span", "dia-num", pad(dia.getDate())));
      span.appendChild(el("span", "dia-mes", MESES[dia.getMonth()]));
      label.appendChild(input); label.appendChild(span);
      diasBox.appendChild(label);
    });

    function servicoAtual() {
      return D.SERVICOS.filter(function (s) { return s.id === selServico.value; })[0];
    }
    function diaAtual() {
      var m = form.querySelector("input[name=dia]:checked");
      return m ? dias[parseInt(m.value, 10)] : null;
    }
    function horaAtual() {
      var m = form.querySelector("input[name=hora]:checked");
      return m ? m.value : null;
    }
    function montarHorarios() {
      var dia = diaAtual();
      horasBox.textContent = "";
      var apoio = $("ag-horarios-apoio");
      if (!dia) { apoio.textContent = "(escolha um dia primeiro)"; return; }
      var ocupados = D.OCUPADOS[dia.getDay()] || [];
      var sabado = dia.getDay() === 6;
      var livres = 0;
      D.HORARIOS.forEach(function (h) {
        if (sabado && h > "11:00") { return; }
        var label = el("label", "hora");
        var input = el("input"); input.type = "radio"; input.name = "hora"; input.value = h;
        if (ocupados.indexOf(h) !== -1) { input.disabled = true; } else { livres++; }
        label.appendChild(input); label.appendChild(el("span", null, h));
        horasBox.appendChild(label);
      });
      apoio.textContent = "(" + livres + " vagas livres" + (sabado ? ", sábado até 13h" : "") + ")";
    }
    function entrega(dia, hora, duracao) {
      var partes = hora.split(":");
      var fim = new Date(dia.getTime());
      fim.setHours(parseInt(partes[0], 10), parseInt(partes[1], 10) + duracao, 0, 0);
      var limite = dia.getDay() === 6 ? 13 : 18;
      if (fim.getHours() + fim.getMinutes() / 60 > limite) {
        return "dia seguinte de atendimento, até 10:00";
      }
      return "mesmo dia, " + pad(fim.getHours()) + ":" + pad(fim.getMinutes());
    }
    function atualizarResumo() {
      var s = servicoAtual(), dia = diaAtual(), hora = horaAtual();
      $("res-servico").textContent = s.nome;
      $("res-dia").textContent = dia ? dataCurta(dia) : "Escolha um dia";
      $("res-hora").textContent = hora ? hora : "Escolha um horário";
      $("res-entrega").textContent = (dia && hora) ? entrega(dia, hora, s.duracao) : "Depende do horário";
      var total = s.desde;
      if (leva.checked) {
        var b = D.BAIRROS.filter(function (x) { return x.id === selBairro.value; })[0];
        total += b.preco;
        $("res-leva").textContent = "Sim, " + b.nome + " (+ R$ " + reais(b.preco) + ")";
      } else {
        $("res-leva").textContent = "Não";
      }
      $("res-total").textContent = reais(total);
    }

    form.addEventListener("change", function (ev) {
      if (ev.target.name === "dia") { montarHorarios(); }
      if (ev.target === leva) { bairroCampo.hidden = !leva.checked; }
      if (ev.target.id === "ag-guardar") { return; }
      atualizarResumo();
      // Mudou serviço, dia, horário ou leva e traz: a confirmação anterior não vale mais
      if (ev.target.type !== "text") { confirmado.hidden = true; }
    });

    // Atalho: botão "Agendar esta revisão" pré-seleciona o serviço
    var atalho = $("revisao-agendar");
    if (atalho) { atalho.addEventListener("click", function () { selServico.value = "revisao"; atualizarResumo(); }); }

    var PLACA = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
    function validar() {
      var nome = $("ag-nome").value.trim();
      var placa = $("ag-placa").value.trim().toUpperCase();
      if (!diaAtual()) { return "Escolha um dia."; }
      if (!horaAtual()) { return "Escolha um horário livre."; }
      if (nome.length < 2) { return "Digite seu nome."; }
      if (!PLACA.test(placa)) { return "Digite a placa no formato ABC1D23 ou ABC1234."; }
      return "";
    }

    var ultimo = null;
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var msg = validar();
      if (msg) { erro.textContent = msg; erro.hidden = false; erro.focus && erro.focus(); return; }
      erro.hidden = true;
      var s = servicoAtual(), dia = diaAtual(), hora = horaAtual();
      var nome = $("ag-nome").value.trim();
      var placa = $("ag-placa").value.trim().toUpperCase();
      var texto = nome + ", " + s.nome.toLowerCase() + " para o carro " + placa + " em " + dataCurta(dia) + ", entrada às " + hora + ". " + (leva.checked ? "Vamos buscar o carro no bairro combinado 40 minutos antes." : "Você traz o carro na oficina.") + " Esta é uma simulação: nada foi enviado.";
      $("ag-confirmado-texto").textContent = texto;
      confirmado.hidden = false;
      ultimo = { quando: dataLonga(dia) + " " + hora, servico: s.nome, placa: placa, nome: nome, leva: leva.checked };
      $("ag-guardar").checked = false;
      confirmado.scrollIntoView({ behavior: reduzMovimento ? "auto" : "smooth", block: "nearest" });
    });

    // Guardar no navegador, só se a pessoa pedir
    function lerGuardados() {
      try { return JSON.parse(localStorage.getItem(CHAVE) || "[]"); } catch (e) { return []; }
    }
    function mostrarGuardados() {
      var lista = lerGuardados();
      var box = $("ag-guardados"), ul = $("ag-guardados-lista");
      ul.textContent = "";
      if (!lista.length) { box.hidden = true; return; }
      lista.forEach(function (a) {
        var li = el("li");
        var strong = el("strong", null, a.quando);
        li.appendChild(strong);
        li.appendChild(document.createTextNode(": " + a.servico + ", placa " + a.placa + ", " + a.nome + (a.leva ? ", com leva e traz" : "")));
        ul.appendChild(li);
      });
      box.hidden = false;
    }
    $("ag-guardar").addEventListener("change", function (ev) {
      if (!ev.target.checked || !ultimo) { return; }
      try {
        var lista = lerGuardados();
        lista.push(ultimo);
        localStorage.setItem(CHAVE, JSON.stringify(lista));
      } catch (e) { /* navegador sem armazenamento: segue sem guardar */ }
      mostrarGuardados();
    });
    $("ag-apagar").addEventListener("click", function () {
      try { localStorage.removeItem(CHAVE); } catch (e) { /* nada */ }
      mostrarGuardados();
    });

    $("ag-placa").addEventListener("input", function (ev) { ev.target.value = ev.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); });

    montarHorarios();
    atualizarResumo();
    mostrarGuardados();
  })();

  /* ---------- função 3: acompanhamento por placa ---------- */
  (function acompanhamento() {
    var form = $("placa-form");
    if (!form) { return; }
    var campo = $("placa-campo"), painel = $("acompanhar-painel"), erro = $("placa-erro");
    campo.addEventListener("input", function (ev) { ev.target.value = ev.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); });

    function mostrar(placa) {
      var c = D.CARROS[placa];
      if (!c) {
        painel.hidden = true;
        erro.textContent = placa ? "Não encontramos a placa " + placa + " na oficina hoje. Nesta demonstração, só as três placas de exemplo têm serviço aberto." : "Digite a placa do carro.";
        erro.hidden = false;
        return;
      }
      erro.hidden = true;
      $("ac-placa").textContent = placa.slice(0, 3) + " " + placa.slice(3);
      $("ac-carro").textContent = c.carro;
      $("ac-servico").textContent = c.servico;
      $("ac-mecanico").textContent = c.mecanico;
      $("ac-previsao").textContent = c.previsao;
      var ol = $("ac-etapas");
      ol.textContent = "";
      D.ETAPAS.forEach(function (nome, i) {
        var estado = i < c.etapaAtual ? "feita" : (i === c.etapaAtual ? "atual" : "futura");
        var li = el("li", "etapa " + estado);
        li.appendChild(el("span", "etapa-ponto"));
        li.appendChild(el("span", "etapa-nome", nome));
        li.appendChild(el("span", "etapa-hora", c.horarios[i] || ""));
        var texto = estado === "feita" ? "concluída" : (estado === "atual" ? (c.etapaAtual === 5 ? "liberado para retirada" : "em andamento agora") : "ainda não começou");
        li.appendChild(el("span", "etapa-estado", texto));
        ol.appendChild(li);
      });
      $("ac-obs").textContent = c.obs;
      painel.hidden = false;
    }
    form.addEventListener("submit", function (ev) { ev.preventDefault(); mostrar(campo.value.trim().toUpperCase()); });
    Array.prototype.forEach.call(document.querySelectorAll(".chip-exemplo"), function (b) {
      b.addEventListener("click", function () { campo.value = b.getAttribute("data-placa"); mostrar(campo.value); });
    });
    // Começa mostrando o primeiro exemplo, para a tela não abrir vazia
    campo.value = "RTA1B65";
    mostrar("RTA1B65");
  })();

  /* ---------- função 4: lembrete de troca de óleo ---------- */
  (function oleo() {
    var form = $("oleo-form");
    if (!form) { return; }
    var tiposBox = $("oleo-tipos"), kmTroca = $("oleo-km-troca"), kmAtual = $("oleo-km-atual"), dataEl = $("oleo-data"), erro = $("oleo-erro");
    D.OLEOS.forEach(function (o, i) { tiposBox.appendChild(chip("oleo", o.id, o.nome, i === 1)); });
    var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    var padrao = new Date(hoje.getTime()); padrao.setMonth(padrao.getMonth() - 5);
    dataEl.value = padrao.getFullYear() + "-" + pad(padrao.getMonth() + 1) + "-" + pad(padrao.getDate());
    dataEl.max = hoje.getFullYear() + "-" + pad(hoje.getMonth() + 1) + "-" + pad(hoje.getDate());

    function calcular() {
      var tipo = D.OLEOS.filter(function (o) { return o.id === form.querySelector("input[name=oleo]:checked").value; })[0];
      var kt = parseInt(kmTroca.value, 10), ka = parseInt(kmAtual.value, 10);
      var partes = dataEl.value.split("-");
      var data = partes.length === 3 ? new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10)) : null;
      $("oleo-rotulo").textContent = "Óleo " + tipo.nome.toLowerCase() + ", a cada " + numero(tipo.km) + " km ou " + tipo.meses + " meses";
      if (isNaN(kt) || isNaN(ka) || ka < kt) { erro.textContent = "A quilometragem de hoje precisa ser igual ou maior que a da última troca."; erro.hidden = false; return; }
      if (!data || isNaN(data.getTime()) || data > hoje) { erro.textContent = "Informe uma data de troca que já passou."; erro.hidden = false; return; }
      erro.hidden = true;

      var rodado = ka - kt;
      var restante = tipo.km - rodado;
      var kmAlvo = kt + tipo.km;
      var dataAlvo = new Date(data.getTime()); dataAlvo.setMonth(dataAlvo.getMonth() + tipo.meses);
      var diasPassados = Math.max(1, Math.round((hoje - data) / 86400000));
      var mediaMes = rodado / (diasPassados / 30.4);
      var diasAteData = Math.round((dataAlvo - hoje) / 86400000);
      var diasAteKm = mediaMes > 0 ? Math.round(restante / (mediaMes / 30.4)) : Infinity;

      $("oleo-km-restante").textContent = numero(Math.max(0, restante));
      $("oleo-faltam").textContent = restante > 0 ? "km faltam para a próxima troca" : "km: a troca por quilometragem já venceu";
      $("oleo-km-alvo").textContent = numero(kmAlvo) + " km";
      $("oleo-data-alvo").textContent = dataLonga(dataAlvo) + (diasAteData >= 0 ? " (em " + diasAteData + " dias)" : " (venceu há " + Math.abs(diasAteData) + " dias)");
      $("oleo-media").textContent = numero(mediaMes) + " km";
      var primeiro;
      if (restante <= 0 || diasAteData < 0) { primeiro = "Já venceu. Agende a troca."; }
      else if (diasAteKm < diasAteData) { primeiro = "A quilometragem, em cerca de " + diasAteKm + " dias no seu ritmo."; }
      else { primeiro = "A data, em " + diasAteData + " dias, mesmo com pouco uso."; }
      $("oleo-primeiro").textContent = primeiro;

      var usado = Math.min(1, Math.max(0, rodado / tipo.km));
      var usadoTempo = Math.min(1, Math.max(0, diasPassados / (tipo.meses * 30.4)));
      var fracao = Math.max(usado, usadoTempo);
      var barra = $("oleo-barra");
      barra.style.setProperty("width", Math.round(fracao * 100) + "%");
      barra.className = "mostrador-preenchido" + (fracao >= 1 ? " vencido" : (fracao < 0.7 ? " ok" : ""));
      var estado = $("oleo-estado");
      if (fracao >= 1) { estado.textContent = "Troca vencida. Rodar com óleo velho desgasta o motor; marque um horário."; estado.className = "aviso-estado atencao"; }
      else if (fracao >= 0.7) { estado.textContent = "Está chegando: você já usou " + Math.round(fracao * 100) + "% do intervalo. Vale agendar para as próximas semanas."; estado.className = "aviso-estado atencao"; }
      else { estado.textContent = "Tudo certo por enquanto: " + Math.round(fracao * 100) + "% do intervalo usado."; estado.className = "aviso-estado ok"; }
    }
    form.addEventListener("input", calcular);
    form.addEventListener("change", calcular);
    form.addEventListener("submit", function (ev) { ev.preventDefault(); calcular(); });
    calcular();
  })();

  /* ---------- depoimentos ---------- */
  (function depoimentos() {
    var ul = $("depoimentos");
    if (!ul) { return; }
    D.DEPOIMENTOS.forEach(function (dep) {
      var li = el("li");
      var bq = el("blockquote", null, "“" + dep.texto + "”");
      var f = el("footer", null, dep.nome + ", " + dep.carro);
      li.appendChild(bq); li.appendChild(f);
      ul.appendChild(li);
    });
  })();
})();
