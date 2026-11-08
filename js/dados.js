/* Dados fictícios da Rota 65 Centro Automotivo.
   Tudo aqui é inventado para a demonstração: categorias genéricas de carro
   (sem marca), preços, horários, placas e etapas de serviço. */
window.ROTA65 = (function () {
  "use strict";

  // Categorias de carro (genéricas, sem marca) e fator de preço de cada uma
  var CATEGORIAS = [
    { id: "hatch", nome: "Hatch compacto", fator: 1.0, motor: "1.0 a 1.3", oleo: 3.5 },
    { id: "sedan", nome: "Sedã médio", fator: 1.15, motor: "1.6 a 2.0", oleo: 4.2 },
    { id: "suv", nome: "SUV", fator: 1.3, motor: "1.6 turbo a 2.0", oleo: 4.8 },
    { id: "picape", nome: "Picape", fator: 1.5, motor: "2.8 diesel ou 2.5", oleo: 6.5 }
  ];

  // Itens possíveis de uma revisão, com preço base (peça + mão de obra) para o hatch
  var ITENS = {
    oleo: { nome: "Troca de óleo do motor e filtro de óleo", preco: 260 },
    filtroAr: { nome: "Filtro de ar do motor", preco: 70 },
    filtroCabine: { nome: "Filtro de ar-condicionado (cabine)", preco: 85 },
    filtroComb: { nome: "Filtro de combustível", preco: 120 },
    velas: { nome: "Jogo de velas de ignição", preco: 240 },
    fluidoFreio: { nome: "Troca do fluido de freio", preco: 150 },
    pastilhas: { nome: "Inspeção de pastilhas e discos (troca orçada à parte)", preco: 0 },
    correia: { nome: "Inspeção da correia dentada ou corrente", preco: 0 },
    arrefecimento: { nome: "Troca do líquido de arrefecimento", preco: 180 },
    rodizio: { nome: "Rodízio de pneus e calibragem", preco: 60 },
    alinhamento: { nome: "Alinhamento e balanceamento", preco: 160 },
    bateria: { nome: "Teste de bateria e alternador", preco: 0 },
    checklist: { nome: "Checklist de 40 pontos com fotos", preco: 0 },
    cambio: { nome: "Troca do óleo do câmbio", preco: 380 },
    amortecedor: { nome: "Inspeção de amortecedores e buchas", preco: 0 }
  };

  // Quais itens entram em cada marca de quilometragem (em milhares de km)
  var REVISOES = {
    10: ["oleo", "filtroAr", "pastilhas", "rodizio", "bateria", "checklist"],
    20: ["oleo", "filtroAr", "filtroCabine", "pastilhas", "rodizio", "alinhamento", "bateria", "checklist"],
    30: ["oleo", "filtroAr", "filtroCabine", "filtroComb", "fluidoFreio", "pastilhas", "correia", "rodizio", "bateria", "checklist"],
    40: ["oleo", "filtroAr", "filtroCabine", "velas", "pastilhas", "rodizio", "alinhamento", "amortecedor", "bateria", "checklist"],
    50: ["oleo", "filtroAr", "filtroCabine", "filtroComb", "fluidoFreio", "arrefecimento", "pastilhas", "correia", "rodizio", "bateria", "checklist"],
    60: ["oleo", "filtroAr", "filtroCabine", "filtroComb", "velas", "fluidoFreio", "arrefecimento", "cambio", "pastilhas", "correia", "rodizio", "alinhamento", "amortecedor", "bateria", "checklist"]
  };

  // Extras que a pessoa pode somar à revisão
  var EXTRAS = [
    { id: "higienizacao", nome: "Higienização do ar-condicionado", preco: 120 },
    { id: "polimento", nome: "Polimento técnico da pintura", preco: 450 },
    { id: "lavagem", nome: "Lavagem detalhada com cera", preco: 90 },
    { id: "levaTraz", nome: "Leva e traz (buscamos e devolvemos o carro)", preco: 40 }
  ];

  // Serviços do quadro de preços e do agendamento (duração em minutos)
  var SERVICOS = [
    { id: "revisao", nome: "Revisão por quilometragem", desde: 340, duracao: 180, grupo: "mecanica" },
    { id: "freios", nome: "Freios: pastilhas, discos e fluido", desde: 290, duracao: 120, grupo: "mecanica" },
    { id: "suspensao", nome: "Suspensão: amortecedores e buchas", desde: 420, duracao: 240, grupo: "mecanica" },
    { id: "alinhamento", nome: "Alinhamento e balanceamento", desde: 160, duracao: 60, grupo: "mecanica" },
    { id: "polimento", nome: "Polimento técnico e vitrificação", desde: 450, duracao: 300, grupo: "estetica" },
    { id: "higienizacao", nome: "Higienização interna completa", desde: 220, duracao: 180, grupo: "estetica" }
  ];

  // Horários de atendimento (início de cada vaga) e vagas já ocupadas por dia da semana
  var HORARIOS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  var OCUPADOS = {
    1: ["08:00", "10:00", "14:00"],
    2: ["09:00", "13:00"],
    3: ["08:00", "11:00", "15:00", "16:00"],
    4: ["10:00", "14:00"],
    5: ["08:00", "09:00", "13:00", "17:00"],
    6: ["09:00", "10:00", "11:00"]
  };

  // Bairros atendidos pelo leva e traz (fictício) com acréscimo
  var BAIRROS = [
    { id: "centro", nome: "Centro e Araés", preco: 40 },
    { id: "cpa", nome: "CPA e Morada da Serra", preco: 50 },
    { id: "coxipo", nome: "Coxipó e Tijucal", preco: 50 },
    { id: "vg", nome: "Várzea Grande", preco: 60 }
  ];

  // Etapas padrão de um serviço na oficina
  var ETAPAS = ["Recebido na recepção", "Diagnóstico e orçamento", "Orçamento aprovado", "Em serviço", "Teste de rua e checklist", "Pronto para retirar"];

  // Carros de exemplo para o acompanhamento por placa (placas fictícias)
  var CARROS = {
    "RTA1B65": {
      carro: "SUV prata",
      servico: "Revisão de 40 mil km + alinhamento",
      mecanico: "Jonas",
      previsao: "hoje, 17:30",
      etapaAtual: 3,
      horarios: ["08:12", "08:40", "09:05", "09:20", "", ""],
      obs: "Pastilhas dianteiras com 3 mm: recomendamos trocar nesta visita. Aguardando seu ok pelo telefone."
    },
    "QKV7C23": {
      carro: "Hatch branco",
      servico: "Troca de pastilhas e discos dianteiros",
      mecanico: "Rafaela",
      previsao: "retirado",
      etapaAtual: 5,
      horarios: ["07:55", "08:30", "08:35", "09:10", "11:20", "11:45"],
      obs: "Serviço concluído. Fluido de freio trocado junto, como aprovado."
    },
    "NPX2D90": {
      carro: "Picape cinza",
      servico: "Polimento técnico e vitrificação",
      mecanico: "Caio",
      previsao: "amanhã, 12:00",
      etapaAtual: 1,
      horarios: ["13:05", "", "", "", "", ""],
      obs: "Avaliando a profundidade dos riscos na tampa traseira antes de fechar o orçamento."
    }
  };

  // Intervalos de troca de óleo por tipo (km e meses)
  var OLEOS = [
    { id: "mineral", nome: "Mineral", km: 5000, meses: 6 },
    { id: "semi", nome: "Semissintético", km: 7500, meses: 8 },
    { id: "sintetico", nome: "Sintético", km: 10000, meses: 12 }
  ];

  var DEPOIMENTOS = [
    { nome: "Marcela T.", carro: "Sedã, 48 mil km", texto: "Mandaram foto de cada peça antes de trocar. Pela primeira vez eu entendi o que estava pagando." },
    { nome: "Edson R.", carro: "Picape, 112 mil km", texto: "Deixei de manhã, buscaram e devolveram no meu trabalho. O carro voltou alinhado e sem barulho na suspensão." },
    { nome: "Priscila M.", carro: "Hatch, 21 mil km", texto: "A revisão de 20 mil ficou no preço que o site mostrou. Nenhum item surpresa." }
  ];

  return {
    CATEGORIAS: CATEGORIAS, ITENS: ITENS, REVISOES: REVISOES, EXTRAS: EXTRAS, SERVICOS: SERVICOS,
    HORARIOS: HORARIOS, OCUPADOS: OCUPADOS, BAIRROS: BAIRROS, ETAPAS: ETAPAS, CARROS: CARROS,
    OLEOS: OLEOS, DEPOIMENTOS: DEPOIMENTOS
  };
})();
