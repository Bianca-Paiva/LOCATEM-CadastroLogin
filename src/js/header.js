document.addEventListener('DOMContentLoaded', () => {

    // ── Elementos ──────────────────────────────────────────────
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('drawerOverlay');
    const btnAbrir = document.getElementById('btnAbrirDrawer');
    const btnFechar = document.getElementById('btnFecharDrawer');

    const elPerfil = document.getElementById('drawerPerfil');
    const elSecaoLogado = document.getElementById('drawerSecaoLogado');
    const elSair = document.getElementById('drawerSair');
    const elItemEntrar = document.getElementById('drawerItemEntrar');

    // Verificação de segurança — avisa no console se algum elemento não for encontrado
    if (!drawer || !overlay || !btnAbrir || !btnFechar) {
        console.error('[Drawer] Um ou mais elementos não foram encontrados no DOM. Verifique os IDs no HTML.');
        return;
    }

    // ── Abrir / Fechar ─────────────────────────────────────────
    function abrirDrawer() {
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function fecharDrawer() {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    btnAbrir.addEventListener('click', abrirDrawer);
    btnFechar.addEventListener('click', fecharDrawer);
    overlay.addEventListener('click', fecharDrawer);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharDrawer();
    });

    // ── Estado de Login ────────────────────────────────────────
    function aplicarEstadoLogin(logado, dados = {}) {
        if (logado) {
            elPerfil.classList.add('visivel');
            elSecaoLogado.classList.add('visivel');
            elSair.classList.add('visivel');
            elItemEntrar.style.display = 'none';

            if (dados.nome) document.getElementById('drawerNome').textContent = 'Olá, ' + dados.nome + '!';
            if (dados.email) document.getElementById('drawerEmail').textContent = dados.email;
        } else {
            elPerfil.classList.remove('visivel');
            elSecaoLogado.classList.remove('visivel');
            elSair.classList.remove('visivel');
            elItemEntrar.style.display = '';
        }
    }

    // Por padrão: não logado.
    // Para testar logado, troque pela linha comentada abaixo:
    aplicarEstadoLogin(false);
    // aplicarEstadoLogin(true, { nome: 'João', email: 'joao.silva@email.com' });
});