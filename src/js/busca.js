const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const pesquisa = input.value.trim();
    if (!pesquisa) return;

    const url = `https://www.omdbapi.com/?s=${pesquisa}&apikey=491135e0`;

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();

        const lista = document.getElementById("grid-anuncios");
        lista.innerHTML = "";

        if (!dados.Search) {
            lista.innerHTML = "<p>Nenhum resultado encontrado</p>";
            return;
        }

        dados.Search.forEach(produto => {
            const card = `
                  <li class="anuncio-card">
                        <div class="card-img">
                            <img src="${produto.imgFerramenta}" alt="${produto.nomeFerramenta}">
                        </div>

                        <div class="card-info">
                            <h3>${produto.nomeFerramenta}</h3>
                            <div class="proprietario">
                                <h4>${produto.Locatario}</h4>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                    class="bi bi-patch-check-fill" viewBox="0 0 16 16">
                                    <path
                                        d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708" />
                                </svg>
                            </div>
                             <p>${produto.preco}<span>/${produto.tempo}</span></p>
                        </div>
                </li>
            `;

            lista.innerHTML += card;
        });

    } catch (erro) {
        console.error("Erro:", erro);
    }
});
