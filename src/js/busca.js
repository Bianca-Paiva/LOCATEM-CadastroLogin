// ===============================
// VARIÁVEIS GLOBAIS
// ===============================
let paginaAtual = 1;
let pesquisa = "";
let dadosSalvos = [];

const itensPorPagina = 8;


// ===============================
// IMAGENS DAS FURADEIRAS
// ===============================
const imagensFuradeira = [

    "https://static3.tcdn.com.br/img/img_prod/484956/furadeira_de_impacto_bosch_gsb_13_re_600w_com_100_acessorios_sem_embalagem_109773_3_20190710111100.jpg",

    "https://a-static.mlcdn.com.br/1500x1500/furadeira-de-impacto-de-alta-performance-1-2-710-watts-hp1630-220v-makita/dutramaquinas/hp1630-220v/740b4dda383e24fe98f4b0148a67624d.jpg",

    "https://cdn.leroymerlin.com.br/products/furadeira_de_impacto_650w_220v_dewalt_88029291_d12d_600x600.jpg"

];


// ===============================
// IMAGENS DAS SERRAS
// ===============================
const imagensSerra = [

    "https://brasmetal.com/wp-content/uploads/2019/02/oie_transparent-2-1.png",

    "https://a-static.mlcdn.com.br/undefinedxundefined/serra-marmore-125mm-1400w-dw862-dewalt/atlasferramentaseparafusos/12913245801/03a8c7ca56b1194e70cb6a0f64d76fcd.jpeg",

    "https://www.royalmaquinas.com.br/upload/produto/imagem/serra-tico-tico-com-velocidade-vari-vel-gst-75e-710w-110v-bosch.jpg?101"

];


// ===============================
// FUNÇÃO PARA PEGAR IMAGEM ALEATÓRIA
// ===============================
function pegarImagemAleatoria(lista) {

    const index = Math.floor(
        Math.random() * lista.length
    );

    return lista[index];

}


// ===============================
// LISTA MOCKADA DE FERRAMENTAS
// ===============================
const ferramentasMockadas = [

    // ===========================
    // FURADEIRAS
    // ===========================

    {
        id: 1,
        nome: "Furadeira Bosch GSB 13",
        loja: "Ferramentas Pro",
        preco: 18,
        avaliacao: 4.8,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "pix",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 2,
        nome: "Furadeira Makita Impacto",
        loja: "Power Tools",
        preco: 22,
        avaliacao: 4.7,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "credito",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 3,
        nome: "Furadeira DeWalt 650W",
        loja: "Casa das Ferramentas",
        preco: 20,
        avaliacao: 4.9,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "boleto",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 4,
        nome: "Furadeira Industrial",
        loja: "Master Ferragens",
        preco: 28,
        avaliacao: 4.5,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "pix",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 5,
        nome: "Mini Furadeira",
        loja: "LocaTech",
        preco: 12,
        avaliacao: 4.1,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "credito",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 6,
        nome: "Furadeira Profissional",
        loja: "Ferramentas Pro",
        preco: 30,
        avaliacao: 5.0,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "pix",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 7,
        nome: "Furadeira Compacta",
        loja: "Tool Center",
        preco: 14,
        avaliacao: 4.2,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "boleto",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 8,
        nome: "Furadeira Hammer",
        loja: "Power Tools",
        preco: 21,
        avaliacao: 4.6,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "credito",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 9,
        nome: "Furadeira Titanium",
        loja: "LocaTech",
        preco: 26,
        avaliacao: 4.8,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "pix",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 10,
        nome: "Furadeira Elétrica 900W",
        loja: "Master Ferragens",
        preco: 32,
        avaliacao: 4.9,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "transferencia",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 11,
        nome: "Furadeira Smart 500W",
        loja: "Power Tools",
        preco: 17,
        avaliacao: 4.4,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "pix",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 12,
        nome: "Furadeira Turbo Impact",
        loja: "LocaTech",
        preco: 24,
        avaliacao: 4.7,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "credito",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 13,
        nome: "Furadeira Ultra Drill",
        loja: "Ferramentas Pro",
        preco: 19,
        avaliacao: 4.5,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "boleto",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 14,
        nome: "Furadeira StrongMax",
        loja: "Tool Center",
        preco: 27,
        avaliacao: 4.8,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "pix",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 15,
        nome: "Furadeira Compact Pro",
        loja: "Casa das Ferramentas",
        preco: 15,
        avaliacao: 4.1,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "credito",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 16,
        nome: "Furadeira Heavy Duty",
        loja: "Master Ferragens",
        preco: 35,
        avaliacao: 5.0,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "transferencia",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 17,
        nome: "Furadeira Eco Drill",
        loja: "Power Tools",
        preco: 16,
        avaliacao: 4.3,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "pix",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 18,
        nome: "Furadeira Speed 700W",
        loja: "Tool Center",
        preco: 29,
        avaliacao: 4.9,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "boleto",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 19,
        nome: "Furadeira Precision",
        loja: "Ferramentas Pro",
        preco: 20,
        avaliacao: 4.6,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "credito",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 20,
        nome: "Furadeira MaxPower",
        loja: "LocaTech",
        preco: 31,
        avaliacao: 4.8,
        imagem: pegarImagemAleatoria(imagensFuradeira),
        categoria: "furadeira",
        pagamento: "pix",
        disponibilidade: "1",
        novidade: false
    },



    // ===========================
    // SERRAS
    // ===========================

    {
        id: 21,
        nome: "Serra Circular Bosch",
        loja: "Ferramentas Pro",
        preco: 25,
        avaliacao: 4.8,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "pix",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 22,
        nome: "Serra Elétrica Makita",
        loja: "Power Tools",
        preco: 29,
        avaliacao: 4.7,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "credito",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 23,
        nome: "Serra Mármore DeWalt",
        loja: "Casa das Ferramentas",
        preco: 32,
        avaliacao: 4.9,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "boleto",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 24,
        nome: "Serra Tico Tico",
        loja: "Master Ferragens",
        preco: 19,
        avaliacao: 4.3,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "pix",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 25,
        nome: "Serra Industrial",
        loja: "LocaTech",
        preco: 45,
        avaliacao: 5.0,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "transferencia",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 26,
        nome: "Mini Serra",
        loja: "Ferramentas Pro",
        preco: 15,
        avaliacao: 4.1,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "credito",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 27,
        nome: "Serra Profissional",
        loja: "Tool Center",
        preco: 38,
        avaliacao: 4.9,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "pix",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 28,
        nome: "Serra Portátil",
        loja: "Casa das Ferramentas",
        preco: 24,
        avaliacao: 4.2,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "boleto",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 29,
        nome: "Serra Hammer",
        loja: "Power Tools",
        preco: 34,
        avaliacao: 4.6,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "credito",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 30,
        nome: "Serra Premium",
        loja: "Master Ferragens",
        preco: 50,
        avaliacao: 4.9,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "pix",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 31,
        nome: "Serra Turbo Cut",
        loja: "Power Tools",
        preco: 27,
        avaliacao: 4.6,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "pix",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 32,
        nome: "Serra Industrial X",
        loja: "Master Ferragens",
        preco: 48,
        avaliacao: 5.0,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "credito",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 33,
        nome: "Serra Precision",
        loja: "Ferramentas Pro",
        preco: 31,
        avaliacao: 4.8,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "boleto",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 34,
        nome: "Serra Compact Pro",
        loja: "Tool Center",
        preco: 18,
        avaliacao: 4.2,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "pix",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 35,
        nome: "Serra Heavy Duty",
        loja: "LocaTech",
        preco: 39,
        avaliacao: 4.9,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "transferencia",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 36,
        nome: "Serra Smart Cut",
        loja: "Casa das Ferramentas",
        preco: 22,
        avaliacao: 4.4,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "credito",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 37,
        nome: "Serra Nitro Blade",
        loja: "Power Tools",
        preco: 36,
        avaliacao: 4.8,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "pix",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 38,
        nome: "Serra Ultra Force",
        loja: "Ferramentas Pro",
        preco: 42,
        avaliacao: 5.0,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "boleto",
        disponibilidade: "1",
        novidade: false
    },

    {
        id: 39,
        nome: "Serra Eco Blade",
        loja: "Tool Center",
        preco: 16,
        avaliacao: 4.1,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "credito",
        disponibilidade: "1",
        novidade: true
    },

    {
        id: 40,
        nome: "Serra Ultimate Cut",
        loja: "Power Tools",
        preco: 44,
        avaliacao: 5.0,
        imagem: pegarImagemAleatoria(imagensSerra),
        categoria: "serra",
        pagamento: "pix",
        disponibilidade: "1",
        novidade: false
    }

];

// ===============================
// INPUTS DE BUSCA
// ===============================
const busca = [
    document.querySelector('#searchInput'),
    document.querySelector('#searchInputMobile')
];

const form = [
    document.getElementById("searchForm"),
    document.getElementById("searchFormMobile")
];


// ===============================
// EVENTOS DE BUSCA
// ===============================
form.forEach((formElement, index) => {

    if (formElement) {

        formElement.addEventListener('submit', (e) => {

            e.preventDefault();

            pesquisa = busca[index].value.trim();

            window.location.href =
                `busca.html?search=${encodeURIComponent(pesquisa)}`;

        });

    }

});


// ===============================
// CARREGAR PESQUISA DA URL
// ===============================
function IrparaBuscar() {

    const urlParams = new URLSearchParams(window.location.search);

    const searchQuery = urlParams.get('search');

    if (searchQuery) {

        busca.forEach(input => {

            if (input) {
                input.value = searchQuery;
            }

        });

        pesquisa = searchQuery;

    }

    buscarProduto();

}


// ===============================
// FUNÇÃO SIMULANDO API
// ===============================
function fakeApiBuscarFerramentas(nomeFerramenta) {

    return new Promise((resolve) => {

        setTimeout(() => {

            const resultado =
                ferramentasMockadas.filter(item =>
                    item.nome
                        .toLowerCase()
                        .includes(nomeFerramenta.toLowerCase())
                );

            resolve(resultado);

        }, 500);

    });

}


// ===============================
// BUSCAR PRODUTOS
// ===============================
async function buscarProduto() {

    paginaAtual = 1;

    const lista =
        document.getElementById("grid-anuncios");

    lista.innerHTML = "<p>Carregando...</p>";

    // SEM PESQUISA
    if (!pesquisa) {

        dadosSalvos = [];

        lista.innerHTML =
            "<p>Pesquise por uma ferramenta</p>";

        return;

    }

    // BUSCA
    const resultado =
        await fakeApiBuscarFerramentas(pesquisa);

    dadosSalvos = resultado;

    renderizarLista(dadosSalvos);

    // TOTAL RESULTADOS
    const totalResultados =
        document.getElementById("totalResultados");

    totalResultados.textContent =
        `${dadosSalvos.length} resultados encontrados`;

}


// ===============================
// RENDERIZAR LISTA COM PAGINAÇÃO
// ===============================
function renderizarLista(lista) {

    const container =
        document.getElementById("grid-anuncios");

    const paginacao =
        document.getElementById("paginacao");

    container.innerHTML = "";

    // SEM RESULTADOS
    if (lista.length === 0) {

        container.innerHTML =
            "<p>Nenhuma ferramenta encontrada.</p>";

        paginacao.innerHTML = "";

        return;

    }

    // ===========================
    // PAGINAÇÃO
    // ===========================
    const inicio =
        (paginaAtual - 1) * itensPorPagina;

    const fim =
        inicio + itensPorPagina;

    const itensPagina =
        lista.slice(inicio, fim);

    // ===========================
    // RENDERIZAR CARDS
    // ===========================
    itensPagina.forEach(ferramenta => {

        container.innerHTML += `
        
            <li class="anuncio-card">

                <div class="card-img">

                    <img 
                        src="${ferramenta.imagem}" 
                        alt="${ferramenta.nome}"
                    >

                </div>

                <div class="card-info">

                    <h3>
                        ${ferramenta.nome}
                    </h3>

                    <div class="loja">

                        <h4>
                            ${ferramenta.loja}
                        </h4>

                        <div class="verificado">
                            ✓
                        </div>

                    </div>

                    <div class="card-footer">

                        <div class="preco">
                            R$${ferramenta.preco}
                            <span>/dia</span>
                        </div>

                        <div class="avaliacao">
                            ⭐ ${ferramenta.avaliacao}
                        </div>

                    </div>

                </div>

            </li>

        `;

    });

    // ===========================
    // CRIAR PAGINAÇÃO
    // ===========================
    const totalPaginas =
        Math.ceil(lista.length / itensPorPagina);

    paginacao.innerHTML = "";

    // BOTÃO ANTERIOR
    paginacao.innerHTML += `
    
        <button
            onclick="trocarPagina(${paginaAtual - 1})"
            ${paginaAtual === 1 ? "disabled" : ""}
        >
            ←
        </button>
    
    `;

    // BOTÕES NUMÉRICOS
    for (let i = 1; i <= totalPaginas; i++) {

        paginacao.innerHTML += `
        
            <button
                class="${i === paginaAtual ? 'ativo' : ''}"
                onclick="trocarPagina(${i})"
            >
                ${i}
            </button>
        
        `;

    }

    // BOTÃO PRÓXIMO
    paginacao.innerHTML += `
    
        <button
            onclick="trocarPagina(${paginaAtual + 1})"
            ${paginaAtual === totalPaginas ? "disabled" : ""}
        >
            →
        </button>
    
    `;

}


// ===============================
// TROCAR PÁGINA
// ===============================
function trocarPagina(novaPagina) {

    paginaAtual = novaPagina;

    renderizarLista(dadosSalvos);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ===============================
// INICIAR PÁGINA
// ===============================
document.addEventListener("DOMContentLoaded", () => {

    IrparaBuscar();

});