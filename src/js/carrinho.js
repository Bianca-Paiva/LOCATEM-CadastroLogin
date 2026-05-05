/* ========================================================
    1. ESTADO GLOBAL E CONSTANTES
======================================================== */

/**
    * Pensa nesse objeto como a "memória central" do carrinho.
    * Ele guarda só o que NÃO pertence a nenhum produto específico:
    * o frete (que vale pro pedido todo) e o cupom (um por carrinho).
    *
    * Cada produto tem seu próprio "estado" guardado no próprio elemento HTML via dataset (data-dias, data-unidades).
*/
const estado = {
    frete: 0,
    cupomAplicado: false,
    cupomCodigo: '',
    cepValidado: false,
};

/**
    * Tabela de cupons válidos. Em produção isso viria de uma API.
    *
    * Cada cupom tem um "tipo" que define como ele é calculado:
    *  - 'percentual' → desconta % do subtotal
    *  - 'fixo'       → desconta um valor fixo em reais
    *  - 'frete'      → zera o frete, sem mexer no subtotal
    *
    * O tipo 'frete' é agora a fonte da verdade para identificar
    * cupons de frete grátis — eliminando o hardcode 'FRETEGRATIS' no restante do código.
*/
const CUPONS = {
    DESCONTO10: { tipo: 'percentual', valor: 10, label: '10% de desconto' },
    FRETEGRATIS: { tipo: 'frete', valor: 0, label: 'Frete grátis' },
    FIXO50: { tipo: 'fixo', valor: 50, label: 'R$\u00a050,00 de desconto' },
};

const DIAS_MIN = 1;
const DIAS_MAX = 30;
const UNID_MIN = 1;
const UNID_MAX = 10;
const TOTAL_MAX_UNID = 10;
const FRETE_FIXO = 20;


/* ========================================================
    1.1 REFERÊNCIAS CENTRAIS AO DOM
    Em vez de chamar document.querySelector
    espalhado pelo código, todos os elementos fixos da página
    são capturados aqui uma única vez, no momento em que o DOM
    está pronto (preenchido no DOMContentLoaded).

    Vantagem: se um seletor mudar, você corrige em um só lugar.
    Desvantagem de não fazer isso: cada querySelector percorre
    o DOM inteiro — fazer isso dezenas de vezes por interação
    é custo desnecessário.
======================================================== */

/**
    * Objeto que concentra todas as referências fixas ao DOM.
    * Declarado aqui, populado em inicializarRefs() dentro do DOMContentLoaded.
*/
const refs = {};

/**
    * Captura e armazena os elementos da página que são consultados
    * repetidamente ao longo da vida da aplicação.
    * Chamado uma única vez, logo que o DOM fica disponível.
*/
function inicializarRefs() {
    // Resumo do pedido
    refs.elSubtotal = document.querySelector('.resumo-linha strong');
    refs.elTotal = document.querySelector('.resumo-total strong');
    refs.elFreteTopo = document.querySelector('.resumo-frete-topo');
    refs.cardResumo = document.querySelector('.card-resumo');

    // Campos de entrada
    refs.inputCep = document.querySelector('.input-cep');
    refs.inputCupom = document.querySelector('.input-cupom');

    // Botões da sidebar
    refs.btnUsar = document.querySelector('.btn-usar');
    refs.btnAplicar = document.querySelector('.btn-aplicar');
    refs.btnRemover = document.querySelector('.btn-remover-cupom');
    refs.btnContinuar = document.querySelector('.btn-continuar');

    // Outros
    refs.colunaProdutos = document.querySelector('.coluna-produtos');
    refs.avisoGlobal = document.getElementById('aviso-global');

    refs.campoCep = document.querySelector('.campo-cep');
    refs.erroCep = document.getElementById('erro-cep');

    refs.campoCupom = document.querySelector('.campo-cupom');
    refs.erroCupom = document.getElementById('erro-cupom');
}


/* ========================================================
    2. HELPERS DE LEITURA / ESCRITA DE ESTADO POR CARD
======================================================== */

/**
    * Essas funções leem e salvam os dados de cada produto diretamente
    * no elemento HTML via `dataset`. O elemento É a fonte da verdade.
*/

const getPrecoDia = (card) => parseFloat(card.dataset.precoDia) || 0;

/**
    * Substituído `||` por verificação com Number.isNaN().
    *
    * O problema com `parseInt(...) || fallback`:
    * Se parseInt retornar 0 (valor legítimo), o `||` o trata como falsy
    * e substitui pelo fallback — comportamento silenciosamente errado.
    *
    * Number.isNaN() resolve isso: só aciona o fallback quando o parse
    * genuinamente falha (retorna NaN), preservando o 0 como valor válido.
*/
const getDias = (card) => {
    const valor = parseInt(card.dataset.dias, 10);
    return Number.isNaN(valor) ? DIAS_MIN : valor;
};

const getUnidades = (card) => {
    const valor = parseInt(card.dataset.unidades, 10);
    return Number.isNaN(valor) ? UNID_MIN : valor;
};

/**
    * Salva a quantidade de dias no card com clamp de segurança.
    * Math.min + Math.max garantem que o valor fique entre DIAS_MIN e DIAS_MAX.
*/
function setDias(card, valor) {
    card.dataset.dias = Math.min(DIAS_MAX, Math.max(DIAS_MIN, valor));
}

function setUnidades(card, valor) {
    card.dataset.unidades = Math.min(UNID_MAX, Math.max(UNID_MIN, valor));
}


/* ========================================================
    3. CÁLCULOS PUROS
    (sem side effects; recebem dados, devolvem números)
======================================================== */

/**
    * Funções puras não alteram nada fora delas — só recebem dados e
    * devolvem um resultado. Isso facilita testar e entender o código.
*/

const calcularTotalCard = (card) =>
    getPrecoDia(card) * getDias(card) * getUnidades(card);

const calcularSubtotal = (cards) =>
    cards.reduce((soma, card) => soma + calcularTotalCard(card), 0);

const totalUnidadesCarrinho = (cards) =>
    cards.reduce((total, card) => total + getUnidades(card), 0);

/**
    * Calcula o desconto com base no tipo do cupom ativo.
    * Cupons do tipo 'frete' não passam por aqui — eles atuam diretamente
    * sobre o freteReal dentro de atualizarResumo().
*/
function calcularDesconto(subtotal) {
    if (!estado.cupomAplicado || !estado.cupomCodigo) return 0;

    const cupom = CUPONS[estado.cupomCodigo];
    if (!cupom) return 0;

    switch (cupom.tipo) {
        case 'percentual': return (subtotal * cupom.valor) / 100;
        case 'fixo': return Math.min(cupom.valor, subtotal);
        default: return 0;
    }
}

/**
    * Verifica se o cupom ativo é do tipo 'frete'
    * consultando o objeto CUPONS — sem depender do nome do código.
    *
    * Antes: `estado.cupomCodigo === 'FRETEGRATIS'`
    * Problema: regra de negócio duplicada e acoplada a um nome específico.
    * Se o cupom fosse renomeado para 'SEMFRETE', o código quebraria.
    *
    * Agora: a fonte da verdade é o campo `tipo` dentro de CUPONS.
    * Qualquer cupom do tipo 'frete' zera o frete — independente do código.
*/
const cupomAtualIsFreteGratis = () =>
    CUPONS[estado.cupomCodigo]?.tipo === 'frete';


/* ========================================================
    4. INICIALIZAÇÃO
======================================================== */

/**
    * Separada em dois passos distintos.
    *
    * Antes, o loop fazia tudo de uma vez: ler HTML, setar dataset e renderizar.
    * O problema é que `atualizarCardProduto` chamava `totalUnidadesCarrinho`
    * internamente — mas durante a iteração, parte dos cards ainda não tinha
    * o dataset.unidades definido, gerando um total global impreciso.
    *
    * Agora:
    *  Passo 1 → todos os datasets são populados (nenhum card renderizado ainda)
    *  Passo 2 → totalGlobal é calculado uma vez com todos os dados corretos
    *  Passo 3 → todos os cards são renderizados com o totalGlobal exato
*/
function inicializarProdutos() {
    const cards = getTodosCards();

    // ── Passo 1: popula os datasets de todos os cards ──
    cards.forEach((card) => {
        card.querySelectorAll('.controle-grupo').forEach((grupo) => {
            grupo.dataset.type = grupo.classList.contains('controle-unidade')
                ? 'unidades'
                : 'dias';
        });

        // grupoDias e grupoUnid cacheados para evitar
        // dois querySelector separados logo em seguida.
        const grupoDias = card.querySelector('[data-type="dias"]');
        const grupoUnid = card.querySelector('[data-type="unidades"]');

        card.dataset.dias = parseInt(grupoDias?.querySelector('.controle-valor')?.textContent, 10) || DIAS_MIN;
        card.dataset.unidades = parseInt(grupoUnid?.querySelector('.controle-valor')?.textContent, 10) || UNID_MIN;
    });

    // ── Passo 2: calcula o total global UMA vez, com todos os datasets prontos ──
    const totalGlobal = totalUnidadesCarrinho(cards);

    // ── Passo 3: renderiza todos os cards com o total global correto ──
    cards.forEach((card) => atualizarCardProduto(card, cards, totalGlobal));
}


/* ========================================================
    5. COLETA DE CARDS (cache leve)
======================================================== */

/**
    * Centraliza o querySelectorAll('.card-produto').
    * Array.from() converte NodeList → Array (que tem .reduce() e .forEach()).
*/
const getTodosCards = () =>
    Array.from(document.querySelectorAll('.card-produto'));


/* ========================================================
    6. RENDERIZAÇÃO
======================================================== */

const formatarMoeda = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/**
    * Atualiza tudo que é visual em um card de produto.
    *
    * Recebe `totalGlobal` como parâmetro.
    * Antes, chamava `totalUnidadesCarrinho(todosCards)` internamente —
    * o que significava recalcular a soma de TODOS os cards para CADA card
    * renderizado. Com N cards, isso era O(N²) operações desnecessárias.
    *
    * Agora o chamador calcula o total uma vez e passa aqui.
    * O custo cai para O(N) — linear, independente da quantidade de produtos.
    *
    * @param {Element} card
    * @param {Element[]} todosCards
    * @param {number} totalGlobal - soma de unidades já calculada pelo chamador
*/
function atualizarCardProduto(card, todosCards, totalGlobal) {
    const dias = getDias(card);
    const unidades = getUnidades(card);
    const precoDia = getPrecoDia(card);
    const totalCard = calcularTotalCard(card);

    // cacheados uma vez por chamada — sem querySelector duplo.
    const grupoDias = card.querySelector('[data-type="dias"]');
    const grupoUnid = card.querySelector('[data-type="unidades"]');

    /* ── Grupo de dias ── */
    if (grupoDias) {
        grupoDias.querySelector('.controle-valor').textContent =
            `${dias} ${dias === 1 ? 'dia' : 'dias'}`;

        setBotaoEstado(grupoDias.querySelector('[data-action="decrement"]'), dias <= DIAS_MIN);
        setBotaoEstado(grupoDias.querySelector('[data-action="increment"]'), dias >= DIAS_MAX);
    }

    /* ── Grupo de unidades ── */
    if (grupoUnid) {
        grupoUnid.querySelector('.controle-valor').textContent =
            `${unidades} ${unidades === 1 ? 'unidade' : 'unidades'}`;

        const atingiuLimiteMax = totalGlobal >= TOTAL_MAX_UNID;

        setBotaoEstado(grupoUnid.querySelector('[data-action="decrement"]'), unidades <= UNID_MIN);
        setBotaoEstado(grupoUnid.querySelector('[data-action="increment"]'), unidades >= UNID_MAX || atingiuLimiteMax);
    }

    /* ── Textos de preço ── */
    const detalheEl = card.querySelector('.produto_preco');
    if (detalheEl) {
        detalheEl.textContent =
            `${formatarMoeda(precoDia)}/dia × ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
    }

    const totalEl = card.querySelector('.produto_total');
    if (totalEl) totalEl.textContent = `Total: ${formatarMoeda(totalCard)}`;
}

/**
    * Liga ou desliga um botão de controle de forma acessível.
    * `disabled` bloqueia clique/teclado; `aria-disabled` avisa leitores de tela.
*/
function setBotaoEstado(btn, desabilitado) {
    if (!btn) return;
    btn.disabled = desabilitado;
    btn.setAttribute('aria-disabled', String(desabilitado));
    btn.classList.toggle('btn-controle--desabilitado', desabilitado);
}

/**
    * Recalcula e exibe o resumo do pedido inteiro.
    * Usa `refs` em vez de querySelector direto.
    * Usa `cupomAtualIsFreteGratis()` em vez do hardcode.
*/
function atualizarResumo() {
    const cards = getTodosCards();
    const subtotal = calcularSubtotal(cards);
    const desconto = calcularDesconto(subtotal);

    // desacoplado do nome do cupom — consulta o tipo via CUPONS
    const freteIsento = cupomAtualIsFreteGratis();
    const freteReal = freteIsento ? 0 : estado.frete;

    const total = Math.max(0, subtotal + freteReal - desconto);

    // refs em vez de querySelector a cada chamada
    if (refs.elSubtotal) refs.elSubtotal.textContent = formatarMoeda(subtotal);
    if (refs.elTotal) refs.elTotal.textContent = formatarMoeda(total);

    renderizarLinhaDesconto(desconto);

    if (refs.elFreteTopo) {
        if (freteIsento) {
            refs.elFreteTopo.textContent = 'Grátis';
        } else if (freteReal > 0) {
            refs.elFreteTopo.textContent = formatarMoeda(estado.frete);
        } else {
            refs.elFreteTopo.textContent = '--';
        }
    }

    salvarResumoNoLocalStorage(subtotal, freteReal, total, desconto);
}

/**
    * Cria, atualiza ou remove a linha de desconto no resumo.
    * usa refs.cardResumo em vez de querySelector.
*/
function renderizarLinhaDesconto(desconto) {
    const divisor = refs.cardResumo?.querySelector('.linha-divisoria');
    let linhaEl = refs.cardResumo?.querySelector('.resumo-linha--desconto');

    if (desconto <= 0) {
        if (linhaEl) linhaEl.remove();
        return;
    }

    if (!linhaEl) {
        linhaEl = document.createElement('div');
        linhaEl.className = 'resumo-linha resumo-linha--desconto';
        linhaEl.innerHTML = '<span>Desconto</span><strong class="resumo-desconto-valor"></strong>';
        divisor?.parentNode.insertBefore(linhaEl, divisor);
    }

    linhaEl.querySelector('.resumo-desconto-valor')
        .textContent = `− ${formatarMoeda(desconto)}`;
}

function verificarCarrinhoVazio(cardsRestantes) {
    if (cardsRestantes.length === 0) {
        window.location.href = '/carrinhoVazio.html';
    }
}


/* ========================================================
    6.1 PERSISTÊNCIA — localStorage
======================================================== */

function formatarParaStorage(valor) {
    return Number(valor || 0).toFixed(2);
}

function salvarResumoNoLocalStorage(subtotal, frete, total, desconto) {
    localStorage.setItem('subtotal', formatarParaStorage(subtotal));
    localStorage.setItem('frete', formatarParaStorage(frete));
    localStorage.setItem('total', formatarParaStorage(total));
    localStorage.setItem('desconto', formatarParaStorage(desconto))
}


/* ========================================================
    7. HANDLERS DE EVENTOS
======================================================== */

function handleRemoverProduto(btn) {
    const card = btn.closest('.card-produto');
    if (!card) return;

    card.style.transition = 'opacity .25s';
    card.style.opacity = '0';

    setTimeout(() => {
        const grupoPai = card.closest('.lista-produtos');
        card.remove();

        if (grupoPai && !grupoPai.querySelector('.card-produto')) {
            grupoPai.closest('.grupo-loja')?.remove();
        }

        const cardsRestantes = getTodosCards();

        // totalGlobal calculado uma vez antes do loop
        const totalGlobal = totalUnidadesCarrinho(cardsRestantes);
        cardsRestantes.forEach((c) => atualizarCardProduto(c, cardsRestantes, totalGlobal));

        atualizarResumo();
        verificarCarrinhoVazio(cardsRestantes);
    }, 250);
}

/**
    * Incrementa ou decrementa dias ou unidades de um produto.
    * totalGlobal calculado uma vez antes do loop de renderização.
*/
function handleControle(btn) {
    const grupo = btn.closest('.controle-grupo');
    const card = btn.closest('.card-produto');
    if (!grupo || !card) return;

    const tipo = grupo.dataset.type;
    const delta = btn.dataset.action === 'increment' ? 1 : -1;

    const todosCards = getTodosCards();

    if (tipo === 'dias') {
        setDias(card, getDias(card) + delta);

    } else if (tipo === 'unidades') {
        if (delta > 0 && totalUnidadesCarrinho(todosCards) >= TOTAL_MAX_UNID) {
            exibirAviso(`Limite de ${TOTAL_MAX_UNID} unidades no carrinho atingido.`, 'erro');
            return;
        }
        setUnidades(card, getUnidades(card) + delta);
    }


    const totalGlobal = totalUnidadesCarrinho(todosCards);
    todosCards.forEach((c) => atualizarCardProduto(c, todosCards, totalGlobal));

    atualizarResumo();
}


/* ========================================================
    8. CUPONS E FRETE
======================================================== */

let _freteTimeout = null;

/**
    * Simula uma consulta de frete por CEP.
*/
function handleCalcularFrete() {
    const cep = refs.inputCep?.value.replace(/\D/g, '') ?? '';

    if (cep.length !== 8) {
        setCepErro(true, 'Informe um CEP válido.');
        return;
    }

    clearTimeout(_freteTimeout);

    if (refs.btnUsar) {
        refs.btnUsar.textContent = '';
        refs.btnUsar.classList.add('btn-loading');
        refs.btnUsar.disabled = true;
    }

    _freteTimeout = setTimeout(() => {
        estado.frete = FRETE_FIXO;
        atualizarResumo();

        if (refs.btnUsar) {
            refs.btnUsar.textContent = 'Usar';
            refs.btnUsar.classList.remove('btn-loading');
            refs.btnUsar.disabled = false;
        }

        estado.cepValidado = true; // CEP confirmado
        setCepErro(false);

        exibirAviso(`Frete calculado: ${formatarMoeda(FRETE_FIXO)}`, 'sucesso');
    }, 800);
}

/**
    * Exibe ou oculta o erro inline do campo de CEP.
    * Centraliza toda a manipulação de estado visual do campo.
*/
function setCepErro(ativo, msg = '') {
    if (!refs.campoCep || !refs.erroCep) return;

    refs.campoCep.classList.toggle('campo-cep--erro', ativo);
    refs.erroCep.textContent = ativo ? msg : '';
    refs.erroCep.classList.toggle('erro-cep--visivel', ativo);

    if (ativo) refs.inputCep?.focus();
}

/**
    * Exibe ou oculta o erro inline do campo de cupom.
    * Espelha exatamente a mesma lógica de setCepErro(),
    * garantindo consistência visual entre os dois campos.
*/
function setCupomErro(ativo, msg = '') {
    if (!refs.campoCupom || !refs.erroCupom) return;

    refs.campoCupom.classList.toggle('campo-cupom--erro', ativo);
    refs.erroCupom.textContent = ativo ? msg : '';
    refs.erroCupom.classList.toggle('erro-cupom--visivel', ativo);

    if (ativo) refs.inputCupom?.focus();
}

/**
    * Valida e aplica o cupom digitado pelo usuário.
    *
    * Todos os feedbacks de erro são exibidos inline abaixo do input
    * via setCupomErro(), seguindo o mesmo padrão do campo de CEP.
    * O exibirAviso() global é reservado apenas para o sucesso.
*/
function handleAplicarCupom() {
    // Bloqueia se já há um cupom ativo — erro inline, não toast
    if (estado.cupomAplicado) {
        setCupomErro(true, 'Já existe um cupom aplicado. Remova-o para usar outro.');
        return;
    }

    const codigo = (refs.inputCupom?.value ?? '').trim().toUpperCase();

    // Campo vazio → erro inline
    if (!codigo) {
        setCupomErro(true, 'Digite um código de cupom.');
        return;
    }

    if (refs.btnAplicar) {
        refs.btnAplicar.textContent = '';
        refs.btnAplicar.classList.add('btn-loading');
        refs.btnAplicar.disabled = true;
    }

    setTimeout(() => {
        const cupom = Object.prototype.hasOwnProperty.call(CUPONS, codigo)
            ? CUPONS[codigo]
            : null;

        // Cupom não encontrado → erro inline
        if (!cupom) {
            setCupomErro(true, 'Cupom inválido ou expirado.');

            if (refs.btnAplicar) {
                refs.btnAplicar.disabled = false;
                refs.btnAplicar.textContent = 'Aplicar';
                refs.btnAplicar.classList.remove('btn-loading');
            }
            return;
        }

        estado.cupomAplicado = true;
        estado.cupomCodigo = codigo;

        // Sucesso → limpa qualquer erro inline anterior
        setCupomErro(false);

        if (refs.inputCupom) {
            refs.inputCupom.value = codigo;
            refs.inputCupom.disabled = true;
            refs.inputCupom.classList.remove('input--erro', 'input--sucesso');
        }

        if (refs.btnRemover) refs.btnRemover.style.display = 'inline-block';

        atualizarResumo();

        // Toast global mantido apenas para confirmação de sucesso
        exibirAviso(`Cupom "${cupom.label}" aplicado com sucesso`, 'sucesso');

        if (refs.btnAplicar) {
            refs.btnAplicar.textContent = 'Aplicar';
            refs.btnAplicar.classList.remove('btn-loading');
            refs.btnAplicar.disabled = false;
        }
    }, 800);
}

/**
    * Verifica se existe um cupom digitado mas não aplicado.
*/
function temCupomNaoAplicado() {
    const valor = (refs.inputCupom?.value ?? '').trim();

    return valor !== '' && !estado.cupomAplicado;
}

/**
    * Remove o cupom aplicado e volta tudo ao estado inicial.
    *
    * Limpa o erro inline via setCupomErro(false) após resetar o estado,
    * garantindo que nenhuma mensagem residual fique visível no campo.
*/
function handleRemoverCupom() {
    if (!estado.cupomAplicado) {
        exibirAviso('Nenhum cupom para remover.', 'erro');
        return;
    }

    if (refs.btnAplicar) refs.btnAplicar.disabled = false;

    estado.cupomAplicado = false;
    estado.cupomCodigo = '';

    if (refs.inputCupom) {
        refs.inputCupom.value = '';
        refs.inputCupom.disabled = false;
        refs.inputCupom.classList.remove('input--sucesso', 'input--erro');
    }

    // Limpa qualquer erro inline que possa ter ficado visível
    setCupomErro(false);

    if (refs.btnRemover) refs.btnRemover.style.display = 'none';

    atualizarResumo();
    exibirAviso('Cupom removido com sucesso', 'sucesso');
}


/* ========================================================
    9. TOAST DE FEEDBACK (não-bloqueante)
======================================================== */

let _avisoTimeout = null;
let _ultimaMensagem = '';

/**
    * Exibe um aviso flutuante (toast) na parte superior da tela.
    *
    * Uso reservado para: frete, limite de unidades e confirmações
    * de sucesso/remoção de cupom. Erros de validação do cupom
    * são tratados inline por setCupomErro().
*/
function exibirAviso(msg, tipo = 'sucesso') {
    if (msg === _ultimaMensagem && _avisoTimeout) return;

    _ultimaMensagem = msg;

    if (!refs.avisoGlobal) return;

    refs.avisoGlobal.textContent = msg;
    refs.avisoGlobal.style.opacity = '1';
    refs.avisoGlobal.style.background = tipo === 'sucesso' ? '#22c55e' : '#ef4444';
    refs.avisoGlobal.style.color = '#fff';

    clearTimeout(_avisoTimeout);
    _avisoTimeout = setTimeout(() => {
        refs.avisoGlobal.style.opacity = '0';
        _ultimaMensagem = '';
    }, 3000);
}


/* ========================================================
    10. CSS DINÂMICO (estados funcionais injetados por JS)
======================================================== */

function injetarEstilosJS() {
    const style = document.createElement('style');
    style.textContent = `
    .btn-controle--desabilitado {
        opacity: .35;
        cursor: not-allowed;
        pointer-events: none;
    }
    .input--erro    { border-color: #ef4444 !important; color: #ef4444; }
    .input--sucesso { color: #22c55e; font-weight: 600; }
    .resumo-linha--desconto strong { color: #22c55e; }
    .resumo-linha--desconto,
    .resumo-linha--frete { animation: fadeIn .3s ease; }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to   { opacity: 1; transform: translateY(0);    }
    }
    #aviso-global {
        position: fixed;
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: .875rem;
        font-weight: 600;
        font-family: Inter, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,.15);
        transition: opacity .3s;
        max-width: 90vw;
        text-align: center;
        pointer-events: none;
        opacity: 0;
    }
    .btn-loading {
        position: relative;
        pointer-events: none;
        opacity: 0.7;
    }
    .btn-loading::after {
        content: '';
        width: 14px;
        height: 14px;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: spin .6s linear infinite;
    }
    @keyframes spin {
        from { transform: translate(-50%, -50%) rotate(0deg);   }
        to   { transform: translate(-50%, -50%) rotate(360deg); }
    }
`;
    document.head.appendChild(style);
}


/* ========================================================
    11. REGISTRO DE EVENTOS (delegação)
======================================================== */

/**
    * Delegação de eventos no container pai — um listener serve todos os cards, inclusive os adicionados dinamicamente no futuro.
*/
function registrarListenersProdutos() {
    if (!refs.colunaProdutos) return;

    refs.colunaProdutos.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        switch (btn.dataset.action) {
            case 'remover': handleRemoverProduto(btn); break;
            case 'increment':
            case 'decrement': handleControle(btn); break;
        }
    });
}

/**
    * Listeners da seção de resumo (frete, cupom, continuar).
*/
function registrarListenersResumo() {
    refs.btnUsar?.addEventListener('click', handleCalcularFrete);

    refs.inputCep?.addEventListener('input', () => {
        let valor = refs.inputCep.value.replace(/\D/g, '').slice(0, 8);

        if (valor.length > 5) {
            valor = valor.replace(/^(\d{5})(\d{0,3})$/, '$1-$2');
        }

        refs.inputCep.value = valor;

        // Remove erro assim que o usuário começa a corrigir
        setCepErro(false);

        if (!valor) {
            estado.frete = 0;
            atualizarResumo();
        }

        estado.cepValidado = false; // invalidou o frete
    });

    refs.btnAplicar?.addEventListener('click', handleAplicarCupom);

    refs.inputCupom?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); handleAplicarCupom(); }
    });

    refs.inputCupom?.addEventListener('input', () => {
        refs.inputCupom.value = refs.inputCupom.value.toUpperCase();
        // Limpa o erro inline assim que o usuário começa a corrigir
        setCupomErro(false);
    });

    refs.btnRemover?.addEventListener('click', handleRemoverCupom);
    refs.btnContinuar?.addEventListener('click', handleContinuarPagamento);
}


/* ========================================================
    12. CONTINUAR PARA PAGAMENTO
======================================================== */

/**
    * Valida o CEP e o cupom antes de permitir a navegação para a próxima etapa.
    *
    * Cupom digitado mas não aplicado exibe erro inline via setCupomErro(),
    * mantendo consistência com os demais erros de validação do campo.
*/
function handleContinuarPagamento() {
    // Cupom preenchido mas não aplicado → erro inline no campo de cupom
    if (temCupomNaoAplicado()) {
        setCupomErro(true, 'Você digitou um cupom, mas não aplicou.');
        return;
    }

    const cep = refs.inputCep?.value.replace(/\D/g, '') ?? '';

    if (cep.length !== 8) {
        setCepErro(true, 'Informe um CEP válido para continuar.');
        return;
    }

    if (!estado.cepValidado) {
        setCepErro(true, 'Calcule o frete antes de continuar.');
        return;
    }

    setCepErro(false);
    window.location.href = '/metodoPagamento.html';
}


/* ========================================================
    BOOTSTRAP — ponto de entrada
======================================================== */

/**
    * Ordem de inicialização:
    *  1. Injeta estilos (CSS antes de renderizar)
    *  2. Popula refs (DOM pronto — captura uma vez)
    *  3. Inicializa produtos (lê HTML → popula datasets → renderiza)
    *  4. Registra eventos
    *  5. Atualiza resumo (estado inicial do painel)
    *  6. Verifica carrinho vazio
*/
document.addEventListener('DOMContentLoaded', () => {
    injetarEstilosJS();
    inicializarRefs();
    inicializarProdutos();
    registrarListenersProdutos();
    registrarListenersResumo();
    atualizarResumo();

    verificarCarrinhoVazio(getTodosCards());

    console.log('[LOCATEM] Carrinho inicializado ✓');
    console.log('Cupons disponíveis:', Object.keys(CUPONS).join(', '));
});


/* ========================================================

    ARQUITETURA GERAL DO SISTEMA

    ┌──────────────────────────────────────────────────────────┐
    │  ESTADO                                                  │
    │  - Global (objeto `estado`): frete e cupom               │
    │  - Por produto (dataset do elemento): dias e unidades    │
    └───────────────────────┬──────────────────────────────────┘
                            │ handlers leem e escrevem
    ┌───────────────────────▼──────────────────────────────────┐
    │  LÓGICA (funções puras)                                  │
    │  calcularSubtotal / calcularDesconto / calcularTotalCard │
    │  → recebem dados, devolvem números, sem tocar no DOM     │
    └───────────────────────┬──────────────────────────────────┘
                            │ renderização lê os resultados
    ┌───────────────────────▼──────────────────────────────────┐
    │  DOM (output apenas)                                     │
    │  atualizarCardProduto / atualizarResumo                  │
    │  → usam `refs` para escrever; nunca calculam nada        │
    └──────────────────────────────────────────────────────────┘

======================================================== */