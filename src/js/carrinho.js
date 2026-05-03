/* ========================================================
    1. ESTADO GLOBAL E CONSTANTES
======================================================== */

/**
    * Pensa nesse objeto como a "memória central" do carrinho.
    * Ele guarda só o que NÃO pertence a nenhum produto específico:
    * o frete (que vale pro pedido todo) e o cupom (um por carrinho).
    *
    * Cada produto tem seu próprio "estado" guardado no próprio elemento HTML via dataset (data-dias, data-unidades) — você vai ver isso mais pra frente.
*/
const estado = {
    frete: 0,
    cupomAplicado: false,
    cupomCodigo: '',
};

/**
    * Tabela de cupons válidos. Em produção isso viria de uma API, mas por enquanto está hardcoded aqui pra simular.
    *
    * Cada cupom tem um "tipo" que define como ele é calculado:
    *  - 'percentual' → desconta % do subtotal
    *  - 'fixo'       → desconta um valor fixo em reais
    *  - 'frete'      → zera o frete, sem mexer no subtotal
*/
const CUPONS = {
    DESCONTO10: { tipo: 'percentual', valor: 10, label: '10% de desconto' },
    FRETEGRATIS: { tipo: 'frete', valor: 0, label: 'Frete grátis' },
    FIXO50: { tipo: 'fixo', valor: 50, label: 'R$\u00a050,00 de desconto' },
};

// Regras de negócio centralizadas em constantes.
// Vantagem: se o limite mudar amanhã, você altera em um só lugar.
const DIAS_MIN = 1;
const DIAS_MAX = 30;
const UNID_MIN = 1;
const UNID_MAX = 10;
const TOTAL_MAX_UNID = 10; // limite global: soma de TODOS os produtos no carrinho
const FRETE_FIXO = 20; // simulado; em produção vem de uma API de frete


/* ========================================================
    2. HELPERS DE LEITURA / ESCRITA DE ESTADO POR CARD
======================================================== */

/**
    * Essas funções leem e salvam os dados de cada produto diretamente no elemento HTML via `dataset`.
    *
    * Por que no dataset e não numa variável JS?
    * Porque o elemento HTML já existe na página — usar o dataset evita ter que manter um objeto JS separado "sincronizado" com o DOM.
    * O elemento É a fonte da verdade.
*/

// Lê o preço/dia do atributo data-preco-dia que está no HTML.
// O `|| 0` garante que nunca vai retornar NaN caso o atributo falte.
const getPrecoDia = (card) => parseFloat(card.dataset.precoDia) || 0;

// Lê a quantidade de dias do dataset do card.
const getDias = (card) => parseInt(card.dataset.dias) || DIAS_MIN;

// Lê a quantidade de unidades do dataset do card.
const getUnidades = (card) => parseInt(card.dataset.unidades) || UNID_MIN;

/**
    * Salva a quantidade de dias no card, mas com um limite de segurança.
    * Math.min e Math.max juntos formam um "clamp": garantem que o valor fique sempre entre DIAS_MIN e DIAS_MAX, sem precisar de if/else.
    *
    * Ex: se o usuário tentar ir para 31, Math.min(30, 31) retorna 30. ✅
*/
function setDias(card, valor) {
    card.dataset.dias = Math.min(DIAS_MAX, Math.max(DIAS_MIN, valor));
}

// Mesma lógica de clamp, mas para unidades.
function setUnidades(card, valor) {
    card.dataset.unidades = Math.min(UNID_MAX, Math.max(UNID_MIN, valor));
}


/* ========================================================
    3. CÁLCULOS PUROS
    (sem side effects; recebem dados, devolvem números)
======================================================== */

/**
    * "Funções puras" são funções que não alteram nada fora delas — só recebem dados e devolvem um resultado. Isso facilita testar e entender o código: você sabe exatamente o que entra e o que sai, sem surpresas.
*/

// Total de um produto: preço × dias × unidades.
const calcularTotalCard = (card) =>
    getPrecoDia(card) * getDias(card) * getUnidades(card);

/**
    * Soma o total de todos os produtos do carrinho.
    *
    * Recebe o array `cards` como parâmetro em vez de chamar document.querySelectorAll() internamente. Por quê? Para evitar que o navegador percorra o DOM várias vezes dentro de um loop — imagine isso com 50 produtos. 
    * Quem chama essa função já tem a lista pronta e passa aqui.
*/
const calcularSubtotal = (cards) =>
    cards.reduce((soma, card) => soma + calcularTotalCard(card), 0);

// Mesma lógica: soma as unidades de todos os cards.
// Usado para checar se o carrinho atingiu o limite global.
const totalUnidadesCarrinho = (cards) =>
    cards.reduce((total, card) => total + getUnidades(card), 0);

/**
    * Calcula o desconto com base no tipo do cupom ativo.
    *
    * O cupom FRETEGRATIS não entra aqui — ele não gera desconto em dinheiro, apenas zera o frete. A lógica do frete fica em atualizarResumo().
    *
    * Isso é chamado toda vez que o resumo é atualizado, então se o usuário adicionar mais itens depois de aplicar um cupom percentual, o desconto recalcula automaticamente. Comportamento correto!
*/
function calcularDesconto(subtotal) {
    if (!estado.cupomAplicado || !estado.cupomCodigo) return 0;

    const cupom = CUPONS[estado.cupomCodigo];
    if (!cupom) return 0;

    switch (cupom.tipo) {
        case 'percentual': return (subtotal * cupom.valor) / 100;
        case 'fixo': return Math.min(cupom.valor, subtotal); // desconto nunca ultrapassa o subtotal
        default: return 0;
    }
}


/* ========================================================
    4. INICIALIZAÇÃO
======================================================== */

/**
    * Roda uma vez quando a página carrega.
    * Faz a "ponte" entre o HTML estático e o JavaScript dinâmico:
    * lê os valores iniciais escritos pelo dev no HTML e os salva nos datasets pra que o JS passe a ser o responsável por eles.
*/
function inicializarProdutos() {
    document.querySelectorAll('.card-produto').forEach((card) => {

        // Injeta data-type em cada grupo de botões (dias ou unidades).
        // A classe .controle-unidade já existe no HTML — o JS apenas lê ela e adiciona um atributo mais explícito para usar depois. Assim o código não precisa adivinhar pelo índice (grupos[0], grupos[1]).
        card.querySelectorAll('.controle-grupo').forEach((grupo) => {
            grupo.dataset.type = grupo.classList.contains('controle-unidade')
                ? 'unidades'
                : 'dias';
        });

        // Lê os valores que o dev escreveu no HTML ("2 dias", "1 unidade") e extrai só o número para salvar no dataset.
        const grupoDias = card.querySelector('[data-type="dias"]');
        const grupoUnid = card.querySelector('[data-type="unidades"]');

        const diasIniciais = parseInt(grupoDias?.querySelector('.controle-valor')?.textContent) || DIAS_MIN;
        const unidIniciais = parseInt(grupoUnid?.querySelector('.controle-valor')?.textContent) || UNID_MIN;

        card.dataset.dias = diasIniciais;
        card.dataset.unidades = unidIniciais;

        // Já renderiza o estado inicial correto (botões desabilitados, totais, etc.)
        atualizarCardProduto(card, getTodosCards());
    });
}


/* ========================================================
    5. COLETA DE CARDS (cache leve)
======================================================== */

/**
    * Centraliza o querySelectorAll('.card-produto') em um único lugar.
    *
    * Por que isso importa?
    * Toda vez que você chama querySelectorAll, o navegador percorre o DOM inteiro.
    * Ao chamar getTodosCards() uma vez e passar o resultado como parâmetro, você faz essa varredura só quando necessário — não em loop.
    *
    * Array.from() converte NodeList para Array, pois NodeList não tem .reduce() e .forEach().
*/
const getTodosCards = () =>
    Array.from(document.querySelectorAll('.card-produto'));


/* ========================================================
    6. RENDERIZAÇÃO
======================================================== */

// Formata um número como moeda brasileira. Ex: 15 → "R$ 15,00"
const formatarMoeda = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/**
    * Atualiza tudo que é visual em um card de produto:
    * textos de dias/unidades, preço detalhado, total e estado dos botões.
    *
    * Recebe `todosCards` como parâmetro para checar o limite global de unidades sem precisar chamar querySelectorAll de novo.
*/
function atualizarCardProduto(card, todosCards) {
    const dias = getDias(card);
    const unidades = getUnidades(card);
    const precoDia = getPrecoDia(card);
    const totalCard = calcularTotalCard(card);

    const grupoDias = card.querySelector('[data-type="dias"]');
    const grupoUnid = card.querySelector('[data-type="unidades"]');

    /* ── Grupo de dias ── */
    if (grupoDias) {
        // Atualiza o texto ("2 dias", "1 dia")
        grupoDias.querySelector('.controle-valor').textContent =
            `${dias} ${dias === 1 ? 'dia' : 'dias'}`;

        // Desabilita o "−" se já está no mínimo, e o "+" se já está no máximo
        setBotaoEstado(grupoDias.querySelector('[data-action="decrement"]'), dias <= DIAS_MIN);
        setBotaoEstado(grupoDias.querySelector('[data-action="increment"]'), dias >= DIAS_MAX);
    }

    /* ── Grupo de unidades ── */
    if (grupoUnid) {
        grupoUnid.querySelector('.controle-valor').textContent =
            `${unidades} ${unidades === 1 ? 'unidade' : 'unidades'}`;

        // Checa o limite global: soma de TODAS as unidades do carrinho.
        // Se o total chegou em 10, o "+" de TODOS os cards deve ser bloqueado.
        // `todosCards` já veio pronto — sem nova consulta ao DOM aqui.
        const totalGlobal = totalUnidadesCarrinho(todosCards);
        const atingiuLimiteMax = totalGlobal >= TOTAL_MAX_UNID;

        setBotaoEstado(grupoUnid.querySelector('[data-action="decrement"]'), unidades <= UNID_MIN);
        // Bloqueia se atingiu limite do próprio card (UNID_MAX) OU o limite global
        setBotaoEstado(grupoUnid.querySelector('[data-action="increment"]'), unidades >= UNID_MAX || atingiuLimiteMax);
    }

    /* ── Textos de preço ── */

    const detalheEl = card.querySelector('.produto_preco');
    if (detalheEl) {
        const precoDiaStr = formatarMoeda(precoDia);
        detalheEl.textContent = `${precoDiaStr}/dia × ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
    }

    const totalEl = card.querySelector('.produto_total');
    if (totalEl) totalEl.textContent = `Total: ${formatarMoeda(totalCard)}`;
}

/**
    * Liga ou desliga um botão de controle de forma acessível.
    *
    * Por que setar aria-disabled além de disabled?
    * O atributo `disabled` bloqueia clique e teclado para usuários comuns.
    * O `aria-disabled` comunica o estado para leitores de tela (acessibilidade).
    * Ambos juntos cobrem todos os públicos. 
*/
function setBotaoEstado(btn, desabilitado) {
    if (!btn) return;
    btn.disabled = desabilitado;
    btn.setAttribute('aria-disabled', String(desabilitado));
    btn.classList.toggle('btn-controle--desabilitado', desabilitado);
}

/**
    * Recalcula e exibe o resumo do pedido inteiro:
    * subtotal, desconto (se cupom ativo), frete e total final.
    *
    * É o "maestro" da seção de resumo — chama os outros para calcular e depois escreve os resultados na tela.
*/
function atualizarResumo() {
    const cards = getTodosCards();
    const subtotal = calcularSubtotal(cards);
    const desconto = calcularDesconto(subtotal); // recalcula sempre com subtotal atual

    // Se o cupom for FRETEGRATIS, o frete real é zero; caso contrário, usa o valor calculado
    const freteIsento = estado.cupomCodigo === 'FRETEGRATIS';
    const freteReal = freteIsento ? 0 : estado.frete;

    // Math.max(0, ...) garante que o total nunca fique negativo
    // (ex: cupom FIXO50 em pedido de R$30 não pode resultar em -R$20)
    const total = Math.max(0, subtotal + freteReal - desconto);

    const elSubtotal = document.querySelector('.resumo-linha strong');
    if (elSubtotal) elSubtotal.textContent = formatarMoeda(subtotal);

    renderizarLinhaDesconto(desconto);

    const elTotal = document.querySelector('.resumo-total strong');
    if (elTotal) elTotal.textContent = formatarMoeda(total);

    // Atualiza o texto de frete que aparece na parte superior do resumo
    const elFreteTopo = document.querySelector('.resumo-frete-topo');

    if (elFreteTopo) {
        if (freteIsento) {
            elFreteTopo.textContent = 'Grátis';
        } else if (freteReal > 0) {
            elFreteTopo.textContent = formatarMoeda(estado.frete);
        } else {
            elFreteTopo.textContent = '--'; // frete ainda não calculado
        }
    }
}

/**
    * Cria, atualiza ou remove a linha de desconto no resumo.
    *
    * Por que criar o elemento via JS em vez de deixá-lo no HTML?
    * Porque a linha só faz sentido existir quando há um desconto ativo.
    * Deixar "Desconto: R$0,00" sempre visível poluiria o resumo.
    *
    * Pensa como uma linha que aparece e desaparece conforme necessário. ✨
*/
function renderizarLinhaDesconto(desconto) {
    const resumo = document.querySelector('.card-resumo');
    const divisor = resumo?.querySelector('.linha-divisoria');
    let linhaEl = resumo?.querySelector('.resumo-linha--desconto');

    // Se não tem desconto, remove a linha se ela existir e para por aqui
    if (desconto <= 0) {
        if (linhaEl) linhaEl.remove();
        return;
    }

    // Se chegou aqui, tem desconto. Cria a linha se ainda não existe.
    if (!linhaEl) {
        linhaEl = document.createElement('div');
        linhaEl.className = 'resumo-linha resumo-linha--desconto';
        linhaEl.innerHTML = '<span>Desconto</span><strong class="resumo-desconto-valor"></strong>';
        // Insere a linha logo antes da linha divisória (hr) — posição correta no layout
        divisor?.parentNode.insertBefore(linhaEl, divisor);
    }

    // Atualiza o valor (seja linha nova ou existente)
    linhaEl.querySelector('.resumo-desconto-valor')
        .textContent = `− ${formatarMoeda(desconto)}`;
}

/**
    * Redireciona para a página de carrinho vazio se não sobrar nenhum produto.
    * Recebe os cards como parâmetro para garantir que está vendo a lista APÓS a remoção — não antes.
*/
function verificarCarrinhoVazio(cardsRestantes) {
    if (cardsRestantes.length === 0) {
        window.location.href = '/carrinhoVazio.html';
    }
}


/* ========================================================
    7. HANDLERS DE EVENTOS
======================================================== */

/**
    * Remove um produto do carrinho com animação de fade.
    *
    * Por que usar setTimeout para o remove()?
    * A animação de opacity leva 250ms. Se remover o elemento imediatamente,a animação não termina. O setTimeout espera o CSS acabar antes de retirar o card do DOM.
*/
function handleRemoverProduto(btn) {
    const card = btn.closest('.card-produto');
    if (!card) return;

    card.style.transition = 'opacity .25s';
    card.style.opacity = '0';

    setTimeout(() => {
        const grupoPai = card.closest('.lista-produtos');
        card.remove();

        // Se a loja ficou sem nenhum produto, remove o grupo dela também
        if (grupoPai && !grupoPai.querySelector('.card-produto')) {
            grupoPai.closest('.grupo-loja')?.remove();
        }

        // getTodosCards() chamado DEPOIS do remove() — a lista já não inclui o card removido.
        // Isso é importante para o limite global de unidades ser recalculado corretamente.
        const cardsRestantes = getTodosCards();

        cardsRestantes.forEach((c) => atualizarCardProduto(c, cardsRestantes));
        atualizarResumo();
        verificarCarrinhoVazio(cardsRestantes);
    }, 250);
}

/**
    * Incrementa ou decrementa dias ou unidades de um produto.
    *
    * Usa data-type do grupo pra saber o que está sendo alterado, e data-action do botão para saber a direção (+1 ou -1).
    * Assim o mesmo handler serve para os 4 botões de controle de cada card.
    */
function handleControle(btn) {
    const grupo = btn.closest('.controle-grupo');
    const card = btn.closest('.card-produto');
    if (!grupo || !card) return;

    const tipo = grupo.dataset.type;  // 'dias' ou 'unidades'
    const delta = btn.dataset.action === 'increment' ? 1 : -1;

    const todosCards = getTodosCards();

    if (tipo === 'dias') {
        setDias(card, getDias(card) + delta);

    } else if (tipo === 'unidades') {
        // Guard duplo: o botão já deve estar desabilitado ao chegar no limite,
        // mas esse if protege contra spam click rápido antes da UI atualizar.
        if (delta > 0 && totalUnidadesCarrinho(todosCards) >= TOTAL_MAX_UNID) {
            exibirAviso(`Limite de ${TOTAL_MAX_UNID} unidades no carrinho atingido.`, 'erro');
            return;
        }
        setUnidades(card, getUnidades(card) + delta);
    }

    // Atualiza TODOS os cards porque o limite global pode ter mudado para outros
    // Ex: se o total chegou a 10, os botões "+" de todos os outros cards devem travar
    todosCards.forEach((c) => atualizarCardProduto(c, todosCards));
    atualizarResumo();
}


/* ========================================================
    8. CUPONS E FRETE
======================================================== */

/**
    * Variável que guarda o ID do timeout do frete.
    * Serve para cancelar uma requisição pendente se o usuário clicar em "Usar" várias vezes seguidas. 
*/
let _freteTimeout = null;

/**
    * Simula uma consulta de frete por CEP.
    *
    * O clearTimeout antes do novo setTimeout garante que só uma "requisição" rode por vez — o clique anterior é cancelado.
    * Sem isso, clicar 5x em "Usar" dispararia 5 atualizações de frete.
*/
function handleCalcularFrete() {
    // Remove tudo que não for número antes de validar
    const cep = document.querySelector('.input-cep')?.value.replace(/\D/g, '') ?? '';
    const btnUso = document.querySelector('.btn-usar');

    if (!cep) {
        estado.frete = 0;
        atualizarResumo();
        exibirAviso('Informe um CEP válido.', 'erro');
        return;
    }

    clearTimeout(_freteTimeout); // cancela qualquer timeout anterior ainda pendente

    if (btnUso) {
        btnUso.textContent = '';
        btnUso.classList.add('btn-loading'); // mostra spinner de carregamento
        btnUso.disabled = true;
    }

    // Simula delay de API (800ms). Em produção, aqui entraria um fetch().
    _freteTimeout = setTimeout(() => {
        estado.frete = FRETE_FIXO;
        atualizarResumo();
        if (btnUso) {
            btnUso.textContent = 'Usar';
            btnUso.classList.remove('btn-loading');
            btnUso.disabled = false;
        }
        exibirAviso(`Frete calculado: ${formatarMoeda(FRETE_FIXO)}`, 'sucesso');
    }, 800);
}

/**
    * Valida e aplica o cupom digitado pelo usuário.
    *
    * Fluxo: verifica se já tem cupom → simula delay → valida o código → aplica no estado → atualiza a UI.
*/
function handleAplicarCupom() {
    // Impede aplicar dois cupons ao mesmo tempo
    if (estado.cupomAplicado) {
        exibirAviso('Já existe um cupom aplicado. Remova-o para usar outro.', 'erro');
        return;
    }

    const inputCupom = document.querySelector('.input-cupom');
    const btnAplicar = document.querySelector('.btn-aplicar');
    const btnRemover = document.querySelector('.btn-remover-cupom');

    const codigo = (inputCupom?.value ?? '').trim().toUpperCase();

    if (!codigo) {
        exibirAviso('Digite um código de cupom.', 'erro');
        return;
    }

    // Mostra spinner enquanto "consulta" (simula delay de API)
    if (btnAplicar) {
        btnAplicar.textContent = '';
        btnAplicar.classList.add('btn-loading');
        btnAplicar.disabled = true;
    }

    setTimeout(() => {

        const cupom = Object.prototype.hasOwnProperty.call(CUPONS, codigo)
            ? CUPONS[codigo]
            : null;

        if (!cupom) {
            exibirAviso('Cupom inválido ou expirado.', 'erro');
            inputCupom?.classList.add('input--erro');

            if (btnAplicar) {
                // o botão permanentemente após um cupom inválido. O usuário ficava
                // sem como tentar outro código. Corrigido para `false`.
                btnAplicar.disabled = false;
                btnAplicar.textContent = 'Aplicar';
                btnAplicar.classList.remove('btn-loading');
            }

            return;
        }

        // Cupom válido: salva no estado global
        estado.cupomAplicado = true;
        estado.cupomCodigo = codigo;

        // Bloqueia o input para não editar o cupom depois de aplicado
        if (inputCupom) {
            inputCupom.value = codigo;
            inputCupom.disabled = true;
            inputCupom.classList.remove('input--erro', 'input--sucesso');
        }

        // Exibe o botão de remover cupom
        if (btnRemover) {
            btnRemover.style.display = 'inline-block';
        }

        atualizarResumo();

        // Antes dependia implicitamente do valor padrão do parâmetro `tipo`.
        // Se o default mudar no futuro, essa chamada ficaria quebrada silenciosamente.
        exibirAviso(`Cupom "${cupom.label}" aplicado com sucesso`, 'sucesso');

        if (btnAplicar) {
            btnAplicar.textContent = 'Aplicar';
            btnAplicar.classList.remove('btn-loading');
            btnAplicar.disabled = false;
        }

    }, 800);
}

/**
    * Remove o cupom aplicado e volta tudo ao estado inicial.
    * É o "desfazer" do handleAplicarCupom.
*/
function handleRemoverCupom() {
    if (!estado.cupomAplicado) {
        exibirAviso('Nenhum cupom para remover.', 'erro');
        return;
    }

    const inputCupom = document.querySelector('.input-cupom');
    const btnRemover = document.querySelector('.btn-remover-cupom');
    const btnAplicar = document.querySelector('.btn-aplicar');

    if (btnAplicar) {
        btnAplicar.disabled = false;
    }

    // Limpa o estado global do cupom
    estado.cupomAplicado = false;
    estado.cupomCodigo = '';

    // Reseta o campo de texto: habilita, limpa e remove classes visuais
    if (inputCupom) {
        inputCupom.value = '';
        inputCupom.disabled = false;
        inputCupom.classList.remove('input--sucesso', 'input--erro');
    }

    // Esconde o botão de remover (só aparece quando há cupom ativo)
    if (btnRemover) {
        btnRemover.style.display = 'none';
    }

    atualizarResumo();

    exibirAviso('Cupom removido com sucesso', 'sucesso');
}


/* ========================================================
    9. TOAST DE FEEDBACK (não-bloqueante)
======================================================== */

let _avisoTimeout = null;
let _ultimaMensagem = ''; // guarda a última mensagem exibida para evitar duplicatas

/**
    * Exibe um aviso flutuante (toast) na parte superior da tela.
    *
    * Por que guardar _ultimaMensagem?
    * Se o usuário clicar 10x no mesmo botão travado, não queremos que o toast pisque 10 vezes. Ele só reaparece se a mensagem mudar ou o timeout expirar.
    *
    * O elemento #aviso-global existe no HTML — o JS apenas controla visibilidade e conteúdo via opacity e textContent.
*/
function exibirAviso(msg, tipo = 'sucesso') {
    if (msg === _ultimaMensagem && _avisoTimeout) return;

    _ultimaMensagem = msg;

    const aviso = document.getElementById('aviso-global');
    if (!aviso) return;

    aviso.textContent = msg;
    aviso.style.opacity = '1';
    aviso.style.background = tipo === 'sucesso' ? '#22c55e' : '#ef4444';
    aviso.style.color = '#fff';

    clearTimeout(_avisoTimeout);
    _avisoTimeout = setTimeout(() => {
        aviso.style.opacity = '0';
        _ultimaMensagem = ''; // libera para a mesma mensagem aparecer de novo no futuro
    }, 3000);
}


/* ========================================================
    10. CSS DINÂMICO (estados funcionais injetados por JS)
======================================================== */

/**
    * Injeta estilos de estado (loading, erro, sucesso) via JS.
    *
    * Por que não colocar isso no arquivo .css normal?
    * Esses estilos dependem de classes que o JS adiciona e remove dinamicamente.
    * Mantê-los aqui junto da lógica facilita entender a relação entre os dois.
    * Em projetos maiores, o ideal seria um arquivo CSS separado.
*/
function injetarEstilosJS() {
    const style = document.createElement('style');
    style.textContent = `
    /* Botão de controle desabilitado */
    .btn-controle--desabilitado {
        opacity: .35;
        cursor: not-allowed;
        pointer-events: none;
    }

    /* Estados de input */
    .input--erro    { border-color: #ef4444 !important; color: #ef4444; }
    .input--sucesso { color: #22c55e; font-weight: 600; }

    /* Linha de desconto no resumo */
    .resumo-linha--desconto strong { color: #22c55e; }

    /* Entrada animada das linhas de desconto e frete */
    .resumo-linha--desconto,
    .resumo-linha--frete { animation: fadeIn .3s ease; }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to   { opacity: 1; transform: translateY(0);    }
    }

    /* Toast global */
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
        opacity: 0; /* começa invisível; exibirAviso seta para 1 */
    }

    /* SPINNER DE LOADING NOS BOTÕES */

    .btn-loading {
        position: relative;
        pointer-events: none;
        opacity: 0.7;
    }

    /* O spinner é criado via pseudo-elemento ::after — sem HTML extra */
    .btn-loading::after {
        content: '';
        width: 14px;
        height: 14px;

        border: 2px solid currentColor;
        border-top-color: transparent; /* a "abertura" que cria o efeito giratório */
        border-radius: 50%;

        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%); /* centraliza o spinner dentro do botão */

        animation: spin .6s linear infinite;
    }

    @keyframes spin {
        from {
            transform: translate(-50%, -50%) rotate(0deg);
        }
        to {
            transform: translate(-50%, -50%) rotate(360deg);
        }
    }
`;
    document.head.appendChild(style);
}


/* ========================================================
    11. REGISTRO DE EVENTOS (delegação)
======================================================== */

/**
    * Em vez de adicionar um listener em cada botão individualmente adicionamos UM listener no container pai (.coluna-produtos).
    *
    * Isso é chamado de "delegação de eventos".
    * Funciona porque cliques "sobem" pelo DOM (evento bubbling):
    * clicar num botão filho dispara o listener do pai também.
    *
    * Vantagem: se novos produtos forem adicionados dinamicamente, eles funcionam automaticamente — sem precisar registrar novos listeners.
*/
function registrarListenersProdutos() {
    const coluna = document.querySelector('.coluna-produtos');
    if (!coluna) return;

    coluna.addEventListener('click', (e) => {
        // Sobe na árvore do DOM a partir do elemento clicado até encontrar um botão com data-action (ou retorna null se não existir)
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
    * Listeners da seção de resumo (frete e cupom).
    * Aqui cada campo tem listener próprio — são elementos únicos e fixos na página.
*/
function registrarListenersResumo() {
    const inputCep = document.querySelector('.input-cep');
    const inputCupom = document.querySelector('.input-cupom');

    document.querySelector('.btn-usar')
        ?.addEventListener('click', handleCalcularFrete);

    inputCep?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); handleCalcularFrete(); }
    });

    // Aplica máscara de CEP em tempo real enquanto o usuário digita
    inputCep?.addEventListener('input', () => {
        let valor = inputCep.value.replace(/\D/g, ''); // remove tudo que não for número
        valor = valor.slice(0, 8); // limita a 8 dígitos

        // Formata como XXXXX-XXX a partir do 6º dígito
        if (valor.length > 5) {
            valor = valor.replace(/^(\d{5})(\d{0,3})$/, '$1-$2');
        }

        inputCep.value = valor;

        // Se apagou tudo, reseta o frete calculado
        if (!valor) {
            estado.frete = 0;
            atualizarResumo();
        }
    });

    document.querySelector('.btn-aplicar')
        ?.addEventListener('click', handleAplicarCupom);

    inputCupom?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); handleAplicarCupom(); }
    });

    inputCupom?.addEventListener('input', () => {
        inputCupom.value = inputCupom.value.toUpperCase(); // força maiúsculo em tempo real
        inputCupom.classList.remove('input--erro'); // limpa o erro ao começar a reeditar
    });

    document.querySelector('.btn-remover-cupom')
        ?.addEventListener('click', handleRemoverCupom);
}


/* ========================================================
    BOOTSTRAP — ponto de entrada
======================================================== */

/**
    * DOMContentLoaded dispara quando o HTML foi carregado e parseado, mas antes das imagens e fontes terminarem.
    * É o momento certo para iniciar o JS — o DOM já está disponível.
    *
    * A ordem de chamadas aqui importa:
    * 1. Injeta estilos (CSS precisa estar pronto antes de renderizar)
    * 2. Inicializa produtos (lê HTML → popula datasets)
    * 3. Registra eventos (ouve interações do usuário)
    * 4. Atualiza resumo (estado inicial do painel direito)
    * 5. Verifica carrinho vazio (segurança na carga)
*/
document.addEventListener('DOMContentLoaded', () => {
    injetarEstilosJS();
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

    Esse carrinho funciona em 3 camadas que se comunicam em sentido único:

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
    │  → escrevem no DOM, nunca calculam nada                  │
    └──────────────────────────────────────────────────────────┘

    Fluxo de um clique no botão "+":
    1. Evento bubbling chega no listener da coluna-produtos
    2. handleControle identifica card + tipo + direção
    3. setUnidades() salva o novo valor no dataset do card
    4. atualizarCardProduto() escreve o resultado na tela
    5. atualizarResumo() recalcula e exibe o novo total

======================================================== */