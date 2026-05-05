//Carrossel
// Navega entre itens com botões, indicadores e swipe touch
const initCarrossel = () => {
  const lista    = document.querySelector('.carrossel-lista');
  const itens    = document.querySelectorAll('.carrossel-item');
  const circulos = document.querySelectorAll('.circulo');
  const btnAntes = document.querySelector('.btn-anterior');
  const btnProx  = document.querySelector('.btn-proximo');

  if (!lista || itens.length === 0) return;

  let indexAtual = 0;

  const irPara = (novoIndex) => {
    itens[indexAtual].classList.remove('ativo');
    circulos[indexAtual]?.classList.remove('ativo');
    indexAtual = (novoIndex + itens.length) % itens.length;
    itens[indexAtual].classList.add('ativo');
    circulos[indexAtual]?.classList.add('ativo');
  };

  btnAntes?.addEventListener('click', () => irPara(indexAtual - 1));
  btnProx?.addEventListener('click',  () => irPara(indexAtual + 1));

  // Swipe touch
  let touchStartX = 0;
  lista.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lista.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) irPara(diff > 0 ? indexAtual + 1 : indexAtual - 1);
  }, { passive: true });

  // Clique nos indicadores
  circulos.forEach((circulo, i) => {
    circulo.addEventListener('click', () => irPara(i));
  });
};

//================================
//Favoritar
//================================

const initFavoritar = () => {
  const btn = document.querySelector('.btn-favoritar');
  if (!btn) return;

  let favoritado = btn.dataset.favoritado === 'true';

  const atualizar = () => {
    btn.setAttribute('aria-pressed', favoritado);
    btn.setAttribute('aria-label', favoritado
      ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    btn.classList.toggle('ativo', favoritado);

    const img = btn.querySelector('img');
    if (img) img.style.filter = favoritado
      ? 'invert(50%) sepia(100%) saturate(500%) hue-rotate(330deg)' : '';
  };

  btn.addEventListener('click', () => { favoritado = !favoritado; atualizar(); });
  atualizar();
};

//================================
//Voltagem
//================================
const initVoltagem = () => {
  const botoes = document.querySelectorAll('.btn-voltagem');
  if (!botoes.length) return;

  botoes.forEach((btn) => {
    btn.addEventListener('click', () => {
      botoes.forEach((b) => b.classList.remove('selecionado'));
      btn.classList.add('selecionado');
    });
  });
};

//================================
//quantidade
//================================
const initQuantidade = () => {
  const grupo = document.querySelector('.controle-grupo');
  if (!grupo) return;

  const btnDecr   = grupo.querySelector('[data-action="decrement"]');
  const btnIncr   = grupo.querySelector('[data-action="increment"]');
  const valorSpan = grupo.querySelector('.controle-valor');
  const MIN = 1, MAX = 99;
  let quantidade = parseInt(valorSpan?.textContent, 10) || 1;

  const atualizar = () => {
    if (valorSpan) valorSpan.textContent = quantidade;
    if (btnDecr) btnDecr.disabled = quantidade <= MIN;
  };

  btnDecr?.addEventListener('click', () => { if (quantidade > MIN) { quantidade--; atualizar(); } });
  btnIncr?.addEventListener('click', () => { if (quantidade < MAX) { quantidade++; atualizar(); } });
  atualizar();
};

//================================
//Expansíveis
//================================
const initExpandiveis = () => {
  const secoes = document.querySelectorAll('.card-secao, .especificacoes-produto');

  secoes.forEach((secao) => {
    const btn      = secao.querySelector('.btn-expandir');
    const conteudo = secao.querySelector('.descricao-conteudo, .especificacoes-conteudo');
    if (!btn || !conteudo) return;

    let aberto = btn.classList.contains('aberto');

    const aplicarEstado = (animado = false) => {
      if (animado) conteudo.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
      conteudo.style.maxHeight = aberto ? conteudo.scrollHeight + 'px' : '0';
      conteudo.style.opacity   = aberto ? '1' : '0';
      conteudo.style.overflow  = aberto ? 'visible' : 'hidden';
      btn.classList.toggle('aberto', aberto);
      btn.setAttribute('aria-expanded', aberto);
    };

    btn.addEventListener('click', () => { aberto = !aberto; aplicarEstado(true); });
    aplicarEstado(false);
  });
};

//================================
//Foi util
//================================
const initFeedbackUtil = () => {
  document.querySelectorAll('.btn-util').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.votou === 'true') return; // evita múltiplos votos

      btn.dataset.votou     = 'true';
      btn.style.borderColor = 'var(--color-primary)';
      btn.style.color       = 'var(--color-primary-dark)';

      const contagem = btn.closest('.feedback-util')?.querySelector('.contagem-util');
      if (contagem) {
        const match = contagem.textContent.match(/\d+/);
        if (match) contagem.textContent =
          contagem.textContent.replace(/\d+/, parseInt(match[0], 10) + 1);
      }
    });
  });
};

//================================
//ver mais comentários
//================================
const initVerMais = () => {
  const btn = document.querySelector('.btn-ver-mais');
  if (!btn) return;

  let expandido = false;

  btn.addEventListener('click', () => {
    expandido = !expandido;
    const span = btn.querySelector('span');

    document.querySelectorAll('.comentario--oculto').forEach((el) => {
      el.style.display = expandido ? 'flex' : 'none';
    });

    if (span) span.textContent = expandido ? 'Ver menos' : 'Ver mais';
    const seta = btn.querySelector('img');
    if (seta) seta.style.transform = expandido ? 'rotate(180deg)' : '';
  });
};

//================================
//inicialização
//================================

(() => {
  'use strict';

  // ... (todas as funções acima aqui dentro)

  const init = () => {
    initCarrossel();
    initFavoritar();
    initVoltagem();
    initQuantidade();
    initExpandiveis();
    initFeedbackUtil();
    initVerMais();
  };

  // Aguarda DOM pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
