const numeroCartao = document.getElementById("numeroCartao");
const iconeBandeira = document.getElementById("iconeBandeira");
const nomeTitular = document.getElementById("nomeTitular");
const validade = document.getElementById("validade");
const cvv = document.getElementById("cvv");
const parcelamento = document.getElementById("parcelamento");

const btnPagar = document.querySelector(".btn-pagar");

const valorTotal = 20.00;

const mapaBandeiras = {
    VISA: "/src/images/bandeiras/visa.png",
    MASTER: "/src/images/bandeiras/master.png",
    AMEX: "/src/images/bandeiras/amex.png",
    ELO: "/src/images/bandeiras/elo.png",
    DISCOVER: "/src/images/bandeiras/discover.png",
    DINERS: "/src/images/bandeiras/diners.png"
};

/* =========================================================
   MENSAGENS PADRONIZADAS
========================================================= */
const mensagensErro = {
    numeroCartaoIncompleto: "Confira o número do cartão.",
    numeroCartaoLimite: "O número do cartão deve ter 16 dígitos.",

    nomeTitularInvalido: "Digite o nome como aparece no cartão.",
    nomeTitularLimite: "O nome deve ter no máximo 40 caracteres.",

    validadeFormato: "Informe a validade no formato MM/AA.",
    validadeMesInvalido: "Informe um mês válido.",
    validadeVencida: "Este cartão está vencido.",

    cvvIncompleto: "Informe o código de segurança.",
    cvvLimite: "O CVV deve ter 3 dígitos.",

    parcelamento: "Escolha uma opção de parcelamento."
};

/* =========================================================
   LIMITAR, FORMATAR E DETECTAR BANDEIRA DO CARTÃO
========================================================= */
numeroCartao.addEventListener("input", () => {
    limparErro(numeroCartao);

    let valor = numeroCartao.value.replace(/\D/g, "");

    // DETECTA BANDEIRA
    const bandeira = detectarBandeira(valor);

    // TROCA ÍCONE
    if (bandeira && mapaBandeiras[bandeira]) {
        iconeBandeira.src = mapaBandeiras[bandeira];
        iconeBandeira.classList.add("ativo");
    } else {
        iconeBandeira.src = "";
        iconeBandeira.classList.remove("ativo");
    }

    // VALIDA TAMANHO
    if (valor.length > 16) {
        valor = valor.slice(0, 16);
        mostrarErro(numeroCartao, mensagensErro.numeroCartaoLimite);
    }

    // FORMATA
    numeroCartao.value = valor.replace(/(\d{4})(?=\d)/g, "$1 ");
});

/* =========================================================
   DETECTOR DA BANDEIRA DO CARTÃO
========================================================= */
function detectarBandeira(numero) {
    numero = numero.replace(/\D/g, "");

    if (/^4/.test(numero)) return "VISA";

    if (/^5[1-5]/.test(numero)) return "MASTER";

    if (/^2(2[2-9]|[3-6]|7[01]|720)/.test(numero)) return "MASTER";

    if (/^3[47]/.test(numero)) return "AMEX";

    if (/^6(?:011|5)/.test(numero)) return "DISCOVER";

    if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(numero)) return "ELO";

    if (/^3(?:0[0-5]|[68])/.test(numero)) return "DINERS";

    return "";

    // *TESTES*
    // detectarBandeira("4") ou detectarBandeira("4111 1111 1111 1111")   // VISA
    // detectarBandeira("51") ou detectarBandeira("5555 5555 5555 4444")     // MASTER
    // detectarBandeira("2221")   // MASTER (faixa nova)
    // detectarBandeira("34") ou detectarBandeira("3714 4963 5398 431")     // AMEX
    // detectarBandeira("6362")   // ELO
    // detectarBandeira("6011")   // DISCOVER
    // detectarBandeira("300")    // DINERS
}

/* =========================================================
   LIMITAR NOME DO TITULAR
========================================================= */
nomeTitular.addEventListener("input", () => {
    limparErro(nomeTitular);

    let valor = nomeTitular.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");

    if (valor.length > 40) {
        valor = valor.slice(0, 40);
        mostrarErro(nomeTitular, mensagensErro.nomeTitularLimite);
    }

    nomeTitular.value = valor.toUpperCase();
});

/* =========================================================
   LIMITAR E FORMATAR VALIDADE MM/AA
========================================================= */
validade.addEventListener("input", () => {
    limparErro(validade);

    let valor = validade.value.replace(/\D/g, "");

    if (valor.length > 4) {
        valor = valor.slice(0, 4);
        mostrarErro(validade, mensagensErro.validadeFormato);
    }

    if (valor.length >= 3) {
        valor = valor.slice(0, 2) + "/" + valor.slice(2);
    }

    validade.value = valor;
});

/* =========================================================
   VALIDAR SE A DATA ESTÁ NO PASSADO
========================================================= */
validade.addEventListener("blur", () => {
    if (validade.value.length !== 5) return;

    const [mes, ano] = validade.value.split("/").map(Number);

    if (mes < 1 || mes > 12) {
        mostrarErro(validade, mensagensErro.validadeMesInvalido);
        validade.value = "";
        return;
    }

    const anoAtual = new Date().getFullYear() % 100;
    const mesAtual = new Date().getMonth() + 1;

    const cartaoVencido =
        ano < anoAtual || (ano === anoAtual && mes < mesAtual);

    if (cartaoVencido) {
        mostrarErro(validade, mensagensErro.validadeVencida);
        validade.value = "";
    }
});

/* =========================================================
   LIMITAR CVV
========================================================= */
cvv.addEventListener("input", () => {
    limparErro(cvv);

    let valor = cvv.value.replace(/\D/g, "");

    if (valor.length > 3) {
        valor = valor.slice(0, 3);
        mostrarErro(cvv, mensagensErro.cvvLimite);
    }

    cvv.value = valor;
});

/* =========================================================
   GERAR PARCELAS COM VALOR MÍNIMO DE R$10
========================================================= */
function gerarParcelas() {
    parcelamento.innerHTML = '<option value="">Selecione</option>';

    const valorMinimoParcela = 10;
    const maxParcelas = Math.floor(valorTotal / valorMinimoParcela);
    const totalParcelas = Math.max(1, maxParcelas);

    for (let i = 1; i <= totalParcelas; i++) {
        const valorParcela = valorTotal / i;

        const option = document.createElement("option");
        option.value = i;
        option.textContent = `${i}x de R$ ${valorParcela.toFixed(2).replace(".", ",")} sem juros`;

        parcelamento.appendChild(option);
    }

    parcelamento.value = "1";

    if (totalParcelas === 1) {
        parcelamento.disabled = true;
    }
}
gerarParcelas();

/* =========================================================
   FUNÇÕES DE VALIDAÇÃO
========================================================= */
function validarNumeroCartao() {
    return numeroCartao.value.replace(/\D/g, "").length === 16;
}

function validarNomeTitular() {
    return nomeTitular.value.trim().length >= 3;
}

function validarValidade() {
    if (validade.value.length !== 5) return false;

    const [mes, ano] = validade.value.split("/").map(Number);

    if (mes < 1 || mes > 12) return false;

    const anoAtual = new Date().getFullYear() % 100;
    const mesAtual = new Date().getMonth() + 1;

    return ano > anoAtual || (ano === anoAtual && mes >= mesAtual);
}

function validarCvv() {
    return cvv.value.length === 3;
}

function validarParcelamento() {
    return parcelamento.value !== "";
}

/* =========================================================
   UI DE ERRO
========================================================= */
function mostrarErro(input, mensagem) {
    const campo = input.closest(".campo");
    const erro = campo.querySelector(".erro");

    if (!erro) return;

    campo.classList.add("erro-ativo");
    erro.textContent = mensagem;
}

function limparErro(input) {
    const campo = input.closest(".campo");
    const erro = campo.querySelector(".erro");

    if (!erro) return;

    campo.classList.remove("erro-ativo");
    erro.textContent = "";
}

/* =========================================================
   CONFIRMAR PAGAMENTO
========================================================= */
btnPagar.addEventListener("click", () => {
    limparErro(numeroCartao);
    limparErro(nomeTitular);
    limparErro(validade);
    limparErro(cvv);
    limparErro(parcelamento);

    let formularioValido = true;

    if (!validarNumeroCartao()) {
        mostrarErro(numeroCartao, mensagensErro.numeroCartaoIncompleto);
        formularioValido = false;
    }

    if (!validarNomeTitular()) {
        mostrarErro(nomeTitular, mensagensErro.nomeTitularInvalido);
        formularioValido = false;
    }

    if (!validarValidade()) {
        mostrarErro(validade, mensagensErro.validadeFormato);
        formularioValido = false;
    }

    if (!validarCvv()) {
        mostrarErro(cvv, mensagensErro.cvvIncompleto);
        formularioValido = false;
    }

    if (!validarParcelamento()) {
        mostrarErro(parcelamento, mensagensErro.parcelamento);
        formularioValido = false;
    }

    if (!formularioValido) return;

    window.location.href = "./pagamentoAprovado.html";
});