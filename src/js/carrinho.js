/**
 * ============================================================
 * LOCATEM — Carrinho de Compras
 * ============================================================
 *
 * REFATORAÇÕES APLICADAS (marcadas com [REFAC]):
 *  1. Eventos passaram a usar btn.dataset.action
 *  2. Seletor de preço corrigido para .produto-preco-detalhe
 *  3. Identificação do grupo usa data-type="dias|unidades"
 *     (injetado na inicialização, sem alterar o HTML)
 *  4. Removida dependência de posição (grupos[0] / grupos[1])
 *
 * Tudo mais permanece idêntico à versão anterior.
 * ============================================================
 */

'use strict';

/* ============================================================
 * 1. ESTADO GLOBAL * 
* o desconto é sempre calculado dinamicamente em calcularDesconto()============================================================ */

const estado = {
    frete: 0,
    desconto: 0,
    cupomCodigo: '',
};

const CUPONS = {
    DESCONTO10: { tipo: 'percentual', valor: 10, label: '10% de desconto' },
    FRETEGRATIS: { tipo: 'frete', valor: 0, label: 'Frete grátis' },
    FIXO50: { tipo: 'fixo', valor: 50, label: 'R$ 50,00 de desconto' },
};

const FRETE_FIXO = 20;
const DIAS_MIN = 1;
const DIAS_MAX = 30;
const UNID_MIN = 1;
const UNID_MAX = 10;
const TOTAL_MAX_UNID = 10;

/* ============================================================
 * 2. INICIALIZAÇÃO * ============================================================ */

function inicializarProdutos() {
    document.querySelectorAll('.card-produto').forEach((card) => {

        /* [REFAC] Seletor corrigido: .produto-preco-detalhe (era .produto-preco) */
        const textoPreco = card.querySelector('.produto-preco-detalhe')?.textContent ?? '';
        const match = textoPreco.match(/R\$\s*([\d,.]+)\s*\/dia/);
        const precoDia = match ? parseFloat(match[1].replace(',', '.')) : 0;
        card.dataset.precoDia = precoDia;

        /* [REFAC] Injeta data-type nos grupos via JS, sem tocar no HTML.
           Aproveita a classe .controle-unidade já existente no markup. */
        card.querySelectorAll('.controle-grupo').forEach((grupo) => {
            grupo.dataset.type = grupo.classList.contains('controle-unidade')
                ? 'unidades'
                : 'dias';
        });

        /* Lê valores iniciais do DOM usando data-type (sem depender de posição) */
        const grupoDias = card.querySelector('[data-type="dias"]');
        const grupoUnid = card.querySelector('[data-type="unidades"]');

        const dias = parseInt(grupoDias?.querySelector('.controle-valor')?.textContent) || 1;
        const unidades = parseInt(grupoUnid?.querySelector('.controle-valor')?.textContent) || 1;

        card.dataset.dias = dias;
        card.dataset.unidades = unidades;

        atualizarCardProduto(card);
    });
}

/* ============================================================
 * 3. LEITURA / ESCRITA DE ESTADO POR PRODUTO * ============================================================ */

const getDias = (card) => parseInt(card.dataset.dias) || 1;
const getUnidades = (card) => parseInt(card.dataset.unidades) || 1;
const getPrecoDia = (card) => parseFloat(card.dataset.precoDia) || 0;

function setDias(card, valor) {
    card.dataset.dias = Math.min(DIAS_MAX, Math.max(DIAS_MIN, valor));
}
function setUnidades(card, valor) {
    card.dataset.unidades = Math.min(UNID_MAX, Math.max(UNID_MIN, valor));
}

/* ============================================================
 * 4. CÁLCULOS * ============================================================ */

function calcularTotalCard(card) {
    return getPrecoDia(card) * getDias(card) * getUnidades(card);
}

function calcularSubtotal() {
    let soma = 0;
    document.querySelectorAll('.card-produto').forEach((card) => {
        soma += calcularTotalCard(card);
    });
    return soma;
}

function totalUnidadesCarrinho() {
    let total = 0;
    document.querySelectorAll('.card-produto').forEach((card) => {
        total += getUnidades(card);
    });
    return total;
}

/* ============================================================
 * 5. RENDERIZAÇÃO * ============================================================ */

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function atualizarCardProduto(card) {
    const dias = getDias(card);
    const unidades = getUnidades(card);
    const precoDia = getPrecoDia(card);
    const totalCard = calcularTotalCard(card);

    /* [REFAC] Grupos acessados por data-type — sem índice de posição */
    const grupoDias = card.querySelector('[data-type="dias"]');
    const grupoUnid = card.querySelector('[data-type="unidades"]');

    /* ── grupo de dias ── */
    if (grupoDias) {
        grupoDias.querySelector('.controle-valor').textContent =
            `${dias} ${dias === 1 ? 'dia' : 'dias'}`;

        /* [REFAC] Botões localizados por data-action, não por textContent */
        toggleBotao(grupoDias.querySelector('[data-action="decrement"]'), dias <= DIAS_MIN);
        toggleBotao(grupoDias.querySelector('[data-action="increment"]'), dias >= DIAS_MAX);
    }

    /* ── grupo de unidades ── */
    if (grupoUnid) {
        grupoUnid.querySelector('.controle-valor').textContent =
            `${unidades} ${unidades === 1 ? 'unidade' : 'unidades'}`;

        const noLimiteGlobal = totalUnidadesCarrinho() >= TOTAL_MAX_UNID;
        toggleBotao(grupoUnid.querySelector('[data-action="decrement"]'), unidades <= UNID_MIN);
        toggleBotao(grupoUnid.querySelector('[data-action="increment"]'), unidades >= UNID_MAX || noLimiteGlobal);
    }

    /* ── textos de preço ── */
    /* [REFAC] Seletor corrigido: .produto-preco-detalhe */
    const detalhe = card.querySelector('.produto-preco-detalhe');
    if (detalhe) {
        const precoDiaFormatado = formatarMoeda(precoDia).replace('R$\u00a0', 'R$').replace('R$ ', 'R$');
        detalhe.textContent = `${precoDiaFormatado}/dia × ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
    }

    /* .produto-total existe no HTML atual */
    const totalEl = card.querySelector('.produto-total');
    if (totalEl) totalEl.textContent = `Total: ${formatarMoeda(totalCard)}`;
}

function toggleBotao(btn, desabilitado) {
    if (!btn) return;
    btn.disabled = desabilitado;
    btn.classList.toggle('btn-controle--desabilitado', desabilitado);
}

function atualizarResumo() {
    const subtotal = calcularSubtotal();
    const desconto = calcularDesconto(subtotal);
    const freteReal = estado.cupomCodigo === 'FRETEGRATIS' ? 0 : estado.frete;
    const total = Math.max(0, subtotal + freteReal - desconto);

    const elSubtotal = document.querySelector('.resumo-linha strong');
    if (elSubtotal) elSubtotal.textContent = formatarMoeda(subtotal);

    renderizarLinhaDesconto(desconto);
    renderizarLinhaFrete(freteReal);

    const elTotal = document.querySelector('.resumo-total strong');
    if (elTotal) elTotal.textContent = formatarMoeda(total);
}

function calcularDesconto(subtotal) {
    if (!estado.cupomCodigo) return 0;
    const cupom = CUPONS[estado.cupomCodigo];
    if (!cupom) return 0;
    if (cupom.tipo === 'percentual') return (subtotal * cupom.valor) / 100;
    if (cupom.tipo === 'fixo') return Math.min(cupom.valor, subtotal);
    return 0;
}

function renderizarLinhaDesconto(desconto) {
    const resumo = document.querySelector('.card-resumo');
    const divisor = resumo?.querySelector('.linha-divisoria');
    let linhaEl = resumo?.querySelector('.resumo-linha--desconto');

    if (desconto <= 0 && !linhaEl) return;

    if (!linhaEl) {
        linhaEl = document.createElement('div');
        linhaEl.className = 'resumo-linha resumo-linha--desconto';
        linhaEl.innerHTML = `<span>Desconto</span><strong class="resumo-desconto-valor"></strong>`;
        divisor?.parentNode.insertBefore(linhaEl, divisor);
    }

    if (desconto > 0) {
        linhaEl.style.display = '';
        linhaEl.querySelector('.resumo-desconto-valor').textContent = `− ${formatarMoeda(desconto)}`;
    } else {
        linhaEl.style.display = 'none';
    }
}

function renderizarLinhaFrete(freteReal) {
    const resumo = document.querySelector('.card-resumo');
    const divisor = resumo?.querySelector('.linha-divisoria');
    let linhaEl = resumo?.querySelector('.resumo-linha--frete');

    if (!linhaEl) {
        linhaEl = document.createElement('div');
        linhaEl.className = 'resumo-linha resumo-linha--frete';
        linhaEl.innerHTML = `<span>Frete</span><strong class="resumo-frete-valor"></strong>`;
        divisor?.parentNode.insertBefore(linhaEl, divisor);
    }

    if (estado.frete > 0 || estado.cupomCodigo === 'FRETEGRATIS') {
        linhaEl.style.display = '';
        linhaEl.querySelector('.resumo-frete-valor').textContent =
            freteReal === 0 ? 'Grátis' : formatarMoeda(freteReal);
    } else {
        linhaEl.style.display = 'none';
    }
}

function verificarCarrinhoVazio() {
    const coluna = document.querySelector('.coluna-produtos');
    const jaExiste = document.querySelector('.aviso-carrinho-vazio');

    if (!document.querySelector('.card-produto') && !jaExiste) {
        const aviso = document.createElement('div');
        aviso.className = 'aviso-carrinho-vazio card';
        aviso.innerHTML = `
      <p style="text-align:center;padding:32px 16px;color:var(--color-text-desativado);">
        🛒 Seu carrinho está vazio.<br><br>
        <a href="./busca.html" style="color:var(--color-text-btn);font-weight:600;">
          Conferir produtos
        </a>
      </p>`;
        coluna?.appendChild(aviso);
    }

    if (document.querySelector('.card-produto') && jaExiste) jaExiste.remove();
}

/* ============================================================
 * 6. HANDLERS DE EVENTOS * ============================================================ */

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

        document.querySelectorAll('.card-produto').forEach(atualizarCardProduto);
        atualizarResumo();
        verificarCarrinhoVazio();
    }, 250);
}

/**
 * [REFAC] Usa data-action para a direção e data-type do grupo
 * para o alvo — elimina verificação por textContent e por índice.
 */
function handleControle(btn) {
    const grupo = btn.closest('.controle-grupo');
    const card = btn.closest('.card-produto');
    if (!grupo || !card) return;

    /* [REFAC] Tipo lido do data-type injetado na inicialização */
    const tipo = grupo.dataset.type;                               // 'dias' | 'unidades'

    /* [REFAC] Direção lida do data-action do botão clicado */
    const delta = btn.dataset.action === 'increment' ? 1 : -1;

    if (tipo === 'dias') {
        setDias(card, getDias(card) + delta);

    } else if (tipo === 'unidades') {
        if (delta > 0 && totalUnidadesCarrinho() >= TOTAL_MAX_UNID) {
            exibirAviso(`Limite de ${TOTAL_MAX_UNID} unidades no carrinho atingido.`, 'erro');
            return;
        }
        setUnidades(card, getUnidades(card) + delta);
    }

    atualizarCardProduto(card);

    /* Revalida demais cards para o limite global */
    document.querySelectorAll('.card-produto').forEach((c) => {
        if (c !== card) atualizarCardProduto(c);
    });

    atualizarResumo();
}

/* ============================================================
 * 7. CUPONS E FRETE * ============================================================ */

function handleCalcularFrete() {
    const cep = document.querySelector('.input-cep')?.value.trim() ?? '';
    const btnUso = document.querySelector('.btn-usar');

    if (!cep) {
        estado.frete = 0;
        atualizarResumo();
        exibirAviso('Informe um CEP válido.', 'erro');
        return;
    }

    if (btnUso) { btnUso.textContent = '...'; btnUso.disabled = true; }

    setTimeout(() => {
        estado.frete = FRETE_FIXO;
        atualizarResumo();
        if (btnUso) { btnUso.textContent = 'Usar'; btnUso.disabled = false; }
        exibirAviso(`Frete calculado: ${formatarMoeda(FRETE_FIXO)}`, 'sucesso');
    }, 800);
}

function handleAplicarCupom() {
    if (estado.cupomAplicado) {
        exibirAviso('Já existe um cupom aplicado.', 'erro');
        return;
    }

    const inputCupom = document.querySelector('.input-cupom');
    const codigo = (inputCupom?.value ?? '').trim().toUpperCase();

    if (!codigo) { exibirAviso('Digite um código de cupom.', 'erro'); return; }

    const cupom = CUPONS[codigo];
    if (!cupom) {
        exibirAviso('Cupom inválido ou expirado.', 'erro');
        inputCupom?.classList.add('input--erro');
        return;
    }

    estado.cupomAplicado = true;
    estado.cupomCodigo = codigo;

    if (inputCupom) {
        inputCupom.value = codigo;
        inputCupom.disabled = true;
        inputCupom.classList.remove('input--erro');
        inputCupom.classList.add('input--sucesso');
    }

    atualizarResumo();
    exibirAviso(`Cupom aplicado: ${cupom.label} ✓`, 'sucesso');
}

/* ============================================================
 * 8. AVISO GLOBAL (toast não-bloqueante) * ============================================================ */

let _avisoTimeout = null;

function exibirAviso(msg, tipo = 'sucesso') {
    let aviso = document.getElementById('aviso-global');

    if (!aviso) {
        aviso = document.createElement('div');
        aviso.id = 'aviso-global';
        aviso.setAttribute('role', 'status');
        aviso.setAttribute('aria-live', 'polite');
        document.body.appendChild(aviso);

        Object.assign(aviso.style, {
            position: 'fixed', top: '16px', left: '50%',
            transform: 'translateX(-50%)', zIndex: '9999',
            padding: '12px 20px', borderRadius: '8px',
            fontSize: '0.875rem', fontWeight: '600',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 4px 12px rgba(0,0,0,.15)',
            transition: 'opacity .3s', maxWidth: '90vw',
            textAlign: 'center', pointerEvents: 'none',
        });
    }

    aviso.textContent = msg;
    aviso.style.opacity = '1';
    aviso.style.background = tipo === 'sucesso' ? '#22c55e' : '#ef4444';
    aviso.style.color = '#fff';

    clearTimeout(_avisoTimeout);
    _avisoTimeout = setTimeout(() => { aviso.style.opacity = '0'; }, 3000);
}

/* ============================================================
 * 9. EVENT LISTENERS — delegação de eventos * ============================================================ */

function registrarListenersProdutos() {
    const coluna = document.querySelector('.coluna-produtos');
    if (!coluna) return;

    /**
     * [REFAC] Switch em data-action substitui qualquer verificação
     * por textContent ou classe — único ponto de entrada para
     * todos os botões da coluna de produtos.
     */
    coluna.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        switch (btn.dataset.action) {
            case 'remover': handleRemoverProduto(btn); break;
            case 'increment':
            case 'decrement': handleControle(btn); break;
        }
    });
}

function registrarListenersResumo() {
    document.querySelector('.btn-usar')
        ?.addEventListener('click', handleCalcularFrete);

    document.querySelector('.input-cep')
        ?.addEventListener('input', () => {
            if (!document.querySelector('.input-cep')?.value.trim()) {
                estado.frete = 0;
                atualizarResumo();
            }
        });

    document.querySelector('.input-cep')
        ?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleCalcularFrete(); }
        });

    document.querySelector('.btn-aplicar')
        ?.addEventListener('click', handleAplicarCupom);

    document.querySelector('.input-cupom')
        ?.addEventListener('input', () => {
            document.querySelector('.input-cupom')?.classList.remove('input--erro');
        });

    document.querySelector('.input-cupom')
        ?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleAplicarCupom(); }
        });
}

/* ============================================================
 * 10. CSS DINÂMICO (injetado pelo JS) * ============================================================ */

function injetarEstilosJS() {
    const style = document.createElement('style');
    style.textContent = `
    .btn-controle--desabilitado { opacity: .35; cursor: not-allowed; }
    .input--erro                { border-color: #ef4444 !important; color: #ef4444; }
    .input--sucesso             { color: #22c55e; font-weight: 600; }
    .resumo-linha--desconto strong { color: #22c55e; }
    .resumo-linha--desconto,
    .resumo-linha--frete        { animation: fadeIn .3s ease; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
  `;
    document.head.appendChild(style);
}

/* ============================================================
 * BOOTSTRAP * ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    injetarEstilosJS();
    inicializarProdutos();
    registrarListenersProdutos();
    registrarListenersResumo();
    atualizarResumo();
    verificarCarrinhoVazio();

    console.log('[LOCATEM] Carrinho inicializado ✓');
    console.log('Cupons disponíveis:', Object.keys(CUPONS).join(', '));
});