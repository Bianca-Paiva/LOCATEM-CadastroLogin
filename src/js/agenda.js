// Seleciona a área do HTML onde os dias serão adicionados
const daysContainer = document.getElementById("days");


// =========================
// DATA ATUAL
// =========================

// Cria uma nova data com o dia atual
const hoje = new Date();

// Pega o ano atual
const anoAtual = hoje.getFullYear();

// Pega o mês atual
// Janeiro = 0 | Dezembro = 11
const mesAtual = hoje.getMonth();


// =========================
// INFORMAÇÕES DO MÊS
// =========================

// Descobre em qual dia da semana o mês começa
// Exemplo:
// 0 = Domingo
// 1 = Segunda
// 2 = Terça...
const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();

// Descobre o último dia do mês
// O "0" significa:
// "volta um dia do próximo mês"
const ultimoDiaMes = new Date(anoAtual, mesAtual + 1, 0).getDate();


// =========================
// ESPAÇOS VAZIOS
// =========================

// Cria os espaços antes do primeiro dia
for (let i = 0; i < primeiroDiaSemana; i++) {

  const emptyDay = document.createElement("div");

  // Classe opcional para estilizar
  emptyDay.classList.add("empty");

  daysContainer.appendChild(emptyDay);
}


// =========================
// DIAS DO MÊS
// =========================

for (let dia = 1; dia <= ultimoDiaMes; dia++) {

  // Cria a div do dia
  const dayElement = document.createElement("div");

  // Adiciona o número do dia
  dayElement.innerText = dia;

  // Classe para estilização
  dayElement.classList.add("day");

  // Marca o dia atual
  if (dia === hoje.getDate()) {
    dayElement.classList.add("today");
  }

  // Adiciona no HTML
  daysContainer.appendChild(dayElement);
}

const monthYear = document.getElementById("mes");

// transforma as informacoes da data de "hoje" para formato pt-br
const textoData = hoje.toLocaleDateString("pt-BR", {
  month: "long",
//   year: "numeric" //caso queira por o ano
});

// deixa a primeira letra do mes maiuscula
monthYear.innerText =
  textoData.charAt(0).toUpperCase() + textoData.slice(1);
