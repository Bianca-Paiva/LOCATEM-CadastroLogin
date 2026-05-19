/* =========================================================
       MENU LATERAL — OPEN / CLOSE
    ========================================================= */
    const btnAbrirMenu   = document.getElementById('btnAbrirMenu');
    const btnFecharMenu  = document.getElementById('btnFecharMenu');
    const menuLateral    = document.getElementById('menuLateral');
    const overlay        = document.getElementById('menuLateralOverlay');
 
    function abrirMenu() {
        menuLateral.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
 
    function fecharMenu() {
        menuLateral.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
 
    btnAbrirMenu?.addEventListener('click', abrirMenu);
    btnFecharMenu?.addEventListener('click', fecharMenu);
    overlay?.addEventListener('click', fecharMenu);
 
    /* Fechar com ESC */
    document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharMenu(); });
 
    /* =========================================================
       NOTIFICAÇÕES
    ========================================================= */
 
    // --- Limpar tudo ---
    document.getElementById('btnLimparTudo').addEventListener('click', function () {
        const cards = document.querySelectorAll('.notif-card');
        if (cards.length === 0) return;
 
        cards.forEach((card, i) => {
            card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            card.style.transitionDelay = (i * 60) + 'ms';
            card.style.opacity = '0';
            card.style.transform = 'translateY(-8px)';
        });
 
        setTimeout(() => {
            document.getElementById('notifLista').innerHTML = '';
            document.getElementById('notifVazio').style.display = 'flex';
            document.getElementById('notifPaginacao').style.display = 'none';
        }, 400 + cards.length * 60);
    });
 
    // --- Ver detalhes (placeholder) ---
    function verDetalhes(id) {
        alert('Abrindo detalhes da notificação #' + id + '...');
    }
 
    // --- Renovar (placeholder) ---
    function renovar(id) {
        alert('Solicitando renovação para a notificação #' + id + '...');
    }
 
    // --- Paginação ---
    let paginaAtual = 1;
    const totalPaginas = 2;
 
    const btnAnterior = document.getElementById('btnPagAnterior');
    const btnProxima  = document.getElementById('btnPagProxima');
    const numeros     = document.querySelectorAll('.notif-pag-num');
 
    function atualizarPaginacao() {
        btnAnterior.disabled = paginaAtual === 1;
        btnProxima.disabled  = paginaAtual === totalPaginas;
 
        numeros.forEach(btn => {
            const p = parseInt(btn.dataset.pag);
            btn.classList.toggle('ativo', p === paginaAtual);
        });
    }
 
    btnAnterior.addEventListener('click', () => {
        if (paginaAtual > 1) { paginaAtual--; atualizarPaginacao(); }
    });
 
    btnProxima.addEventListener('click', () => {
        if (paginaAtual < totalPaginas) { paginaAtual++; atualizarPaginacao(); }
    });
 
    numeros.forEach(btn => {
        btn.addEventListener('click', () => {
            paginaAtual = parseInt(btn.dataset.pag);
            atualizarPaginacao();
        });
    });
 
    // --- Filtro (placeholder visual) ---
    document.getElementById('filtroSelect').addEventListener('change', function () {
        // Em produção: filtrar lista via API ou array de dados
        console.log('Filtro alterado para:', this.value);
    });