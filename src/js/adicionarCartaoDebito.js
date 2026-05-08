/* =========================================================
    CAPTURA DOS ELEMENTOS DO HTML
    Esses elementos serão manipulados pelo JavaScript.
========================================================= */
const numeroCartao = document.getElementById("numeroCartao");
const iconeBandeira = document.getElementById("iconeBandeira");
const nomeTitular = document.getElementById("nomeTitular");
const validade = document.getElementById("validade");
const cvv = document.getElementById("cvv");

const btnPagar = document.querySelector(".btn-pagar");

/*
    Controla se o pagamento já está sendo processado.
    Isso evita que o usuário clique várias vezes no botão e simule/envie o pagamento mais de uma vez.
*/
let pagamentoEmProcessamento = false;

/* =========================================================
    MAPA DE BANDEIRAS
    Relaciona o nome detectado da bandeira com o caminho do ícone.
========================================================= */
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
    Centraliza todas as mensagens de erro para facilitar manutenção.
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
    cvvLimite: "O CVV deve ter 3 dígitos."
};

/* =========================================================
    NÚMERO DO CARTÃO
    - Remove caracteres que não são números
    - Limita a 16 dígitos
    - Formata em blocos de 4 números
    - Detecta a bandeira e exibe o ícone correspondente
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
    Usa os primeiros dígitos do cartão para identificar a bandeira.
    Essa detecção é visual/UX; a validação real deve ocorrer na API.
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
    NOME DO TITULAR
    - Permite apenas letras e espaços
    - Limita a 40 caracteres
    - Converte automaticamente para maiúsculo
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
    VALIDADE DO CARTÃO
    - Permite apenas números
    - Formata automaticamente no padrão MM/AA
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
    VALIDAÇÃO DA DATA DE VALIDADE
    Ao sair do campo, verifica:
    - se o mês é válido
    - se o cartão não está vencido
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
    CVV
    - Permite apenas números
    - Limita a 3 dígitos
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
    FUNÇÕES DE VALIDAÇÃO
    Retornam true ou false conforme cada campo esteja correto.
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

/* =========================================================
    UI DE ERRO
    Controla a exibição e remoção das mensagens de erro.
========================================================= */
function mostrarErro(input, mensagem) {
    const campo = input.closest(".campo");
    const erro = campo.querySelector(".erro");

    if (!erro) return;

    /*
        Remove e adiciona a classe novamente para reiniciar a animação de erro sempre que necessário.
    */
    campo.classList.remove("erro-ativo"); // reset animação
    void campo.offsetWidth; // força reflow (truque do CSS)

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
    - Valida todos os campos
    - Bloqueia clique duplo
    - Mostra estado de carregamento
    - Redireciona para a tela de pagamento aprovado
========================================================= */
btnPagar.addEventListener("click", () => {
    if (pagamentoEmProcessamento) return;

    limparErro(numeroCartao);
    limparErro(nomeTitular);
    limparErro(validade);
    limparErro(cvv);

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

    pagamentoEmProcessamento = true;
    btnPagar.disabled = true;
    btnPagar.classList.add("carregando");
    btnPagar.textContent = "Processando pagamento";

    setTimeout(() => {
        window.location.href = "./pagamentoAprovado.html";
    }, 1500);
});