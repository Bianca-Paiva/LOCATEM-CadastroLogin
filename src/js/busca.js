const busca = document.querySelector('#searchInput');
const form = document.getElementById("searchForm");

form.addEventListener('submit', buscarFilme);

async function buscarFilme(e) {
    e.preventDefault();

    const pesquisa = busca.value.trim();

    if (!pesquisa) return;

    const url = `https://www.omdbapi.com/?s=${pesquisa}&apikey=491135e0`;

    const resposta = await fetch(url);
    const dados = await resposta.json();

    console.log(dados);

    const lista = document.getElementById("grid-anuncios");
    lista.innerHTML = "";

    if (!dados.Search) {
        lista.innerHTML = "<p>Nenhum resultado encontrado</p>";
        return;
    }

    dados.Search.forEach(filme => {
        const card = `
            <li class="anuncio-card">
                <div class="card-img">
                    <img src="${filme.Poster}" alt="${filme.Title}">
                </div>

                <div class="card-info">
                    <h3>${filme.Title}</h3>
                    <div class="proprietario">
                        <h4>IMDb</h4>
                    </div>
                    <p>${filme.Year}</p>
                </div>
            </li>
        `;

        lista.innerHTML += card;
    });
}