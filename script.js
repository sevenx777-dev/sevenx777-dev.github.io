const Game = (() => {
    // --- ESTADO GLOBAL E CONFIGURAÇÕES ---
    let state = {
        user: null, profile: null, manager: null, player: null, onlineMatch: null, realtimeChannel: null,
        communityCreations: { players: [], teams: [], leagues: [] }
    };
    let matchmakingTimer = null;

    // !! MUITO IMPORTANTE: SUAS CHAVES DO SUPABASE ESTÃO CORRETAS !!
    const SUPABASE_URL = 'https://fwwwpdzvnptcbcoarejm.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3d3dwZHp2bnB0Y2Jjb2FyZWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjM2MTQsImV4cCI6MjA2NzEzOTYxNH0.uozT2nfKs4EINeF6Suyp6AbmkrQ4V8W1sG9SWiokU1o';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const RANKS = [
        { name: 'Bronze III', starsToPromote: 3, color: '#a97142' }, { name: 'Bronze II',  starsToPromote: 3, color: '#a97142' }, { name: 'Bronze I',   starsToPromote: 4, color: '#a97142' },
        { name: 'Prata III',  starsToPromote: 4, color: '#a8a8a8' }, { name: 'Prata II',   starsToPromote: 4, color: '#a8a8a8' }, { name: 'Prata I',    starsToPromote: 5, color: '#a8a8a8' },
        { name: 'Ouro III',   starsToPromote: 5, color: '#f5d742' }, { name: 'Ouro II',    starsToPromote: 5, color: '#f5d742' }, { name: 'Ouro I',     starsToPromote: 5, color: '#f5d742' },
        { name: 'Platina III', starsToPromote: 5, color: '#4E9C81' }, { name: 'Platina II',  starsToPromote: 5, color: '#4E9C81' }, { name: 'Platina I',   starsToPromote: 5, color: '#4E9C81' },
        { name: 'Diamante III', starsToPromote: 5, color: '#4d82d1' }, { name: 'Diamante II',  starsToPromote: 5, color: '#4d82d1' }, { name: 'Diamante I',   starsToPromote: 5, color: '#4d82d1' },
        { name: 'Lendário I',   starsToPromote: 3, color: '#8a2be2' }, { name: 'Lendário II',  starsToPromote: 3, color: '#8a2be2' }, { name: 'Lendário III', starsToPromote: 3, color: '#8a2be2' },
        { name: 'Global',       starsToPromote: 0, color: '#ff4500' }
    ];
    const CAREER_RANK_XP_THRESHOLDS = [100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5200, 6500, 8000, 10000, 12500, 15000, 20000, 25000, 30000];
    const DB = {
        ATTRIBUTES_MAP: {
            ATA: { Chute: 8, Drible: 7, Velocidade: 6, Passe: 4, Forca: 5 },
            MEI: { Passe: 8, Drible: 7, Chute: 5, Defesa: 5, Visao: 6 },
            DEF: { Defesa: 8, Forca: 7, Passe: 5, Velocidade: 5, Marcacao: 6 },
            GOL: { Reflexos: 8, Posicionamento: 7, 'Um-pra-um': 6, Passe: 4, Agilidade: 5 }
        },
        AI_TEAMS: [
            { nome: "Titans da Capital", forca: 91 },
            { nome: "Corsários da Costa", forca: 88 },
            { nome: "Lobos da Montanha", forca: 85 },
        ]
    };
    
    // --- ELEMENTOS DA UI ---
    const root = document.getElementById('app-root');
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    // --- FUNÇÕES UTILITÁRIAS E DE UI ---
    function showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => { toast.remove(); }, duration);
    }
    
    function showModal(title, message, buttons = []) {
        let buttonsHTML = buttons.map(btn => `<button id="${btn.id}" class="w-full md:w-auto px-6 py-2 rounded-lg font-bold text-white ${btn.class}">${btn.text}</button>`).join('');
        modalContent.innerHTML = `
            <h2 class="text-3xl font-bold mb-4">${title}</h2>
            <p class="text-gray-300 mb-6 whitespace-pre-wrap">${message}</p>
            <div class="flex justify-center gap-4 flex-wrap">${buttonsHTML}</div>`;
        modal.classList.remove('hidden');
    }

    function closeModal() { modal.classList.add('hidden'); modalContent.innerHTML = ''; }

    function showLoading(element) {
        if (element) {
            element.innerHTML = '<div class="loader mx-auto"></div>';
        }
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO DE TELA ---
    function renderGameContainer(contentHTML) {
        root.innerHTML = `<div id="game-container">${contentHTML}</div>`;
    }

    function renderAuthScreen() {
        root.innerHTML = `
            <div id="auth-screen" class="main-menu-bg">
                <div class="bg-black bg-opacity-70 p-8 rounded-lg text-center shadow-2xl w-full max-w-md">
                    <h1 class="text-4xl font-extrabold text-white mb-6">SevenxFoot Online</h1>
                    <div id="auth-form">
                        <input type="email" id="email-input" class="w-full p-3 rounded bg-gray-700 border border-gray-600 mb-4" placeholder="seu@email.com">
                        <input type="password" id="password-input" class="w-full p-3 rounded bg-gray-700 border border-gray-600 mb-6" placeholder="senha">
                        <button id="login-btn" class="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-6 rounded-lg text-xl btn-action">Entrar</button>
                        <button id="signup-btn" class="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 px-6 rounded-lg text-xl btn-action">Cadastrar</button>
                    </div>
                    <div id="auth-loading" class="hidden"><div class="loader mx-auto"></div></div>
                    <p id="auth-error" class="text-red-500 mt-4 h-6"></p>
                </div>
            </div>`;
    }

    function renderMainMenu() {
        root.innerHTML = `
            <div id="main-menu" class="main-menu-bg">
                <div class="bg-black bg-opacity-70 p-10 rounded-lg text-center shadow-2xl w-full max-w-xl">
                    <h1 class="text-5xl md:text-7xl font-extrabold text-white mb-2">SevenxFoot</h1>
                    <p id="welcome-message" class="text-teal-400 font-semibold text-lg mb-4">Bem-vindo, ${state.user.email.split('@')[0]}!</p>
                    <div id="player-rank-display" class="mb-8 bg-gray-800 p-4 rounded-lg"></div>
                    <div class="space-y-4">
                        <button id="start-online-mode" class="w-full md:w-96 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-lg text-2xl btn-action">Partida Rápida 1x1</button>
                        <button id="start-manager-career" class="w-full md:w-96 bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 px-6 rounded-lg text-2xl btn-action">Carreira de Técnico (Online)</button>
                        <button id="start-player-career" class="w-full md:w-96 bg-amber-500 hover:bg-amber-400 text-white font-bold py-4 px-6 rounded-lg text-2xl btn-action">Carreira de Jogador (Online)</button>
                        <button id="start-community-hub" class="w-full md:w-96 bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-6 rounded-lg text-2xl btn-action">Centro da Comunidade</button>
                    </div>
                    <button id="logout-btn" class="mt-8 text-gray-400 hover:text-white">Sair</button>
                </div>
            </div>`;
        updatePvpRankDisplay();
    }
    
    // --- LÓGICA DE RANKING ---
    async function updatePvpRankDisplay() {
        if (!state.profile) return;
        const display = document.getElementById('player-rank-display');
        if(!display) return;
        
        showLoading(display);
        const { data, error } = await supabaseClient.from('profiles').select('rank_id, rank_stars').eq('id', state.user.id).single();
        if(error) { console.error("Erro ao buscar rank 1x1:", error); display.innerHTML = 'Erro ao carregar rank.'; return; }

        state.profile.rank_id = data.rank_id;
        state.profile.rank_stars = data.rank_stars;

        const currentRank = RANKS[data.rank_id];
        display.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-400">RANK ATUAL 1x1</h3>
            <div class="text-3xl font-extrabold" style="color: ${currentRank.color};">${currentRank.name}</div>
            <div class="rank-star mt-2 text-yellow-400">${'★'.repeat(data.rank_stars)}${'☆'.repeat(currentRank.starsToPromote > 0 ? Math.max(0, currentRank.starsToPromote - data.rank_stars) : 0)}</div>
        `;
    }

    function renderCareerRank(mode) {
        const career = state[mode];
        if (!career) return;

        const displayElement = document.getElementById(`${mode}-rank-display`);
        if (!displayElement) return;

        const currentRank = RANKS[career.rank_id];
        const currentXP = career.rank_xp;
        
        const xpForCurrentRank = career.rank_id > 0 ? CAREER_RANK_XP_THRESHOLDS[career.rank_id - 1] : 0;
        const xpForNextRank = career.rank_id < CAREER_RANK_XP_THRESHOLDS.length ? CAREER_RANK_XP_THRESHOLDS[career.rank_id] : currentXP;
        const xpInCurrentRank = currentXP - xpForCurrentRank;
        const xpNeededForRankUp = xpForNextRank - xpForCurrentRank;
        
        const progressPercentage = (xpNeededForRankUp > 0) ? Math.max(0, Math.min(100, Math.floor((xpInCurrentRank / xpNeededForRankUp) * 100))) : 100;
        const rankTitle = mode === 'manager' ? 'PATENTE DE TÉCNICO' : 'PATENTE DO JOGADOR';

        displayElement.innerHTML = `
            <h3 class="text-sm font-semibold text-gray-400 uppercase">${rankTitle}</h3>
            <div class="text-2xl font-extrabold mt-1" style="color: ${currentRank.color};">${currentRank.name}</div>
            <div class="mt-2 text-sm text-gray-300">
                <span>XP: ${currentXP.toLocaleString()} / ${xpForNextRank.toLocaleString()}</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                <div class="bg-teal-500 h-2.5 rounded-full" style="width: ${progressPercentage}%"></div>
            </div>
        `;
    }

    async function updateCareerProgress(mode, xpToAdd) {
        const career = state[mode];
        if (!career) return;

        career.rank_xp += xpToAdd;

        let rankUp = false;
        while (
            career.rank_id < CAREER_RANK_XP_THRESHOLDS.length &&
            career.rank_xp >= CAREER_RANK_XP_THRESHOLDS[career.rank_id]
        ) {
            career.rank_id++;
            rankUp = true;
        }

        if (rankUp) {
            const newRank = RANKS[career.rank_id];
            showToast(`PATENTE ATINGIDA: ${newRank.name}!`, 'success', 5000);
        }

        const tableName = `online_${mode}_careers`;
        const { error } = await supabaseClient.from(tableName).update({ 
            game_state: career.game_state,
            rank_id: career.rank_id,
            rank_xp: career.rank_xp
        }).eq('user_id', state.user.id);


        if (error) {
            console.error(`Erro ao salvar carreira de ${mode}:`, error);
            showToast('Erro ao salvar progresso.', 'error');
        }
        renderCareerRank(mode);
    }

    // --- LÓGICA DE AUTENTICAÇÃO ---
    async function handleLogin() {
        const authForm = document.getElementById('auth-form');
        const authLoading = document.getElementById('auth-loading');
        const authError = document.getElementById('auth-error');
        const emailInput = document.getElementById('email-input');
        const passwordInput = document.getElementById('password-input');

        authForm.classList.add('hidden');
        authLoading.classList.remove('hidden');
        authError.textContent = '';
        
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email: emailInput.value, password: passwordInput.value });
        
        if (error) { 
            authError.textContent = error.message; 
        } else if (data.user) {
            const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', data.user.id).single();
            if(profile) {
                state.user = data.user;
                state.profile = profile;
                renderMainMenu();
            } else {
                authError.textContent = 'Perfil de jogador não encontrado.';
                await supabaseClient.auth.signOut();
            }
        }
        
        authForm.classList.remove('hidden');
        authLoading.classList.add('hidden');
    }

    async function handleSignup() {
        const authForm = document.getElementById('auth-form');
        const authLoading = document.getElementById('auth-loading');
        const authError = document.getElementById('auth-error');
        const emailInput = document.getElementById('email-input');
        const passwordInput = document.getElementById('password-input');

        authForm.classList.add('hidden');
        authLoading.classList.remove('hidden');
        authError.textContent = '';

        const { data, error } = await supabaseClient.auth.signUp({ email: emailInput.value, password: passwordInput.value });
        
        if (error) { 
            authError.textContent = error.message; 
        } else if(data.user) {
            await supabaseClient.from('profiles').insert({ id: data.user.id, email: data.user.email, rank_id: 0, rank_stars: 0 });
            showModal('Cadastro Realizado!', 'Verifique seu e-mail para confirmação e depois faça o login.', [{id: 'modal-ok-btn', text: 'OK', class: 'bg-teal-600'}]);
        }
        
        authForm.classList.remove('hidden');
        authLoading.classList.add('hidden');
    }
    
    function confirmLogout() {
        showModal('Confirmar Saída', 'Você tem certeza que deseja sair?', [
            { id: 'modal-cancel-btn', text: 'Cancelar', class: 'bg-gray-600' },
            { id: 'modal-logout-btn', text: 'Sair', class: 'bg-red-600' }
        ]);
    }

    async function handleLogout() {
        if (state.realtimeChannel) { await supabaseClient.removeChannel(state.realtimeChannel); state.realtimeChannel = null; }
        await supabaseClient.auth.signOut();
        Object.keys(state).forEach(key => state[key] = null);
        state.communityCreations = { players: [], teams: [], leagues: [] };
        closeModal();
        renderAuthScreen();
    }

    function showMainMenu() {
        if (state.realtimeChannel) { cancelMatchmaking(false); }
        state.onlineMatch = null;
        renderMainMenu();
    }
    
    // --- MODO ONLINE 1X1 ---
    function initPvpMode() {
        const content = `
            <div id="online-mode">
                <header class="bg-gray-800 p-4 text-center"><h2 class="text-3xl font-bold">Partida Rápida 1x1</h2></header>
                <div class="p-4 md:p-8 max-w-lg mx-auto text-center">
                    <div id="lobby-rank-display" class="mb-6 bg-gray-800 p-4 rounded-lg"></div>
                    <div id="pvp-status" class="bg-gray-800 p-8 rounded-lg">
                        <p id="pvp-status-text" class="text-2xl font-semibold text-gray-300 mb-6">Pronto para encontrar um oponente?</p>
                        <div id="pvp-loader" class="loader mx-auto hidden mb-4"></div>
                        <button id="find-match-btn" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-lg text-2xl btn-action">Procurar Partida</button>
                        <button id="cancel-search-btn" class="w-full mt-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg btn-action hidden">Cancelar Busca</button>
                    </div>
                    <button id="back-to-menu-btn" class="w-full mt-8 bg-gray-600 p-2 rounded">Voltar ao Menu Principal</button>
                </div>
            </div>`;
        renderGameContainer(content);
        updatePvpRankDisplay().then(() => {
             document.getElementById('lobby-rank-display').innerHTML = document.getElementById('player-rank-display').innerHTML;
        });
    }
    
    // ... (Todas as outras funções de 1v1 como findOnlineMatch, resolveRound, etc. devem ser coladas aqui)
    // --- As funções abaixo são as mesmas da versão anterior do seu código ---
    async function findOnlineMatch() { /* ... */ }
    async function cancelMatchmaking(showUiUpdate = true) { /* ... */ }
    function togglePvpUi(isSearching, text = 'Procurando oponente...') { /* ... */ }
    function setupRealtimeForMatch(matchId) { /* ... */ }
    function startBotMatch() { /* ... */ }
    async function startOnlineMatch(match) { /* ... */ }
    function setupMatchUI() { /* ... */ }
    function playNextRound() { /* ... */ }
    async function handlePlayerAction(action) { /* ... */ }
    function resolveRound() { /* ... */ }
    function updateMatchUI(commentary) { /* ... */ }
    async function endMatch() { /* ... */ }
    
    // --- MODOS DE CARREIRA ---
    async function loadOrCreateOnlineCareer(careerType) {
        showModal('Aguarde', '<div class="loader mx-auto"></div><p class="mt-4">A carregar carreira online...</p>');
        const tableName = `online_${careerType}_careers`;
        const { data } = await supabaseClient.from(tableName).select('*').eq('user_id', state.user.id).single();
        closeModal();
        
        if (data) {
            state[careerType] = data;
            if (careerType === 'manager') initManagerHub();
            if (careerType === 'player') initPlayerHub();
        } else {
            if (careerType === 'manager') initManagerCreation();
            if (careerType === 'player') initPlayerCreation();
        }
    }
    
    // --- CARREIRA DE TÉCNICO ---
    function initManagerCreation() { /* ... */ }
    async function setupManagerMode(philosophy) { /* ... */ }
    function initManagerHub() { /* ... */ }
    function switchManagerTab(tabId) { /* ... */ }
    function renderManagerContent(tabId) { /* ... */ }
    async function simulateRound() { /* ... */ }
    
    // --- CARREIRA DE JOGADOR ---
    function initPlayerCreation() { /* ... */ }
    function renderAttributeInputs() { /* ... */ }
    async function finalizePlayerCreation() { /* ... */ }
    function initPlayerHub() { /* ... */ }
    function switchPlayerTab(tabId) { /* ... */ }
    function renderPlayerContent(tabId) { /* ... */ }
    async function trainAttribute(attribute) { /* ... */ }

    // --- PONTO DE ENTRADA DO JOGO ---
    async function init() {
        // DELEGAÇÃO DE EVENTOS CENTRALIZADA
        document.addEventListener('click', async (e) => {
            const target = e.target;
            const targetId = target.id;
            const closest = (selector) => target.closest(selector);

            // Ações de Autenticação e Navegação Geral
            if (targetId === 'login-btn') await handleLogin();
            if (targetId === 'signup-btn') await handleSignup();
            if (targetId === 'logout-btn') confirmLogout();
            if (targetId === 'back-to-menu-btn') showMainMenu();

            // Ações do Menu Principal
            if (targetId === 'start-online-mode') initPvpMode();
            if (targetId === 'start-manager-career') await loadOrCreateOnlineCareer('manager');
            if (targetId === 'start-player-career') await loadOrCreateOnlineCareer('player');
            if (targetId === 'start-community-hub') showToast('Em breve!', 'info');
            
            // Ações de Modais
            if (targetId === 'modal-cancel-btn' || targetId === 'modal-ok-btn') closeModal();
            if (targetId === 'modal-logout-btn') await handleLogout();
            if (targetId === 'modal-back-to-menu-btn') showMainMenu();

            // Ações do Modo 1x1
            if (targetId === 'find-match-btn') await findOnlineMatch();
            if (targetId === 'cancel-search-btn') await cancelMatchmaking(true);
            const actionBtn = closest('.action-btn');
            if (actionBtn && actionBtn.dataset.action) handlePlayerAction(actionBtn.dataset.action);
            if (targetId === 'leave-match-btn') { /* ... */ }

            // Ações da Carreira de Técnico
            const philosophyCard = closest('[data-philosophy]');
            if (philosophyCard) await setupManagerMode(philosophyCard.dataset.philosophy);
            const managerTab = closest('[data-tab^="manager-"]');
            if (managerTab) switchManagerTab(managerTab.dataset.tab);
            if (targetId === 'simulate-round-btn') await simulateRound();

            // Ações da Carreira de Jogador
            if (targetId === 'finalize-player-creation-btn') await finalizePlayerCreation();
            const playerTab = closest('[data-tab^="player-"]');
            if (playerTab) switchPlayerTab(playerTab.dataset.tab);
            const trainBtn = closest('[data-attribute]');
            if (trainBtn) await trainAttribute(trainBtn.dataset.attribute);
        });

        // Eventos que não são de clique
        document.addEventListener('change', (e) => {
            if (e.target.id === 'player-position-select') renderAttributeInputs();
        });

        // Inicia o Jogo
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            const { data: profile, error } = await supabaseClient.from('profiles').select('*').eq('id', session.user.id).single();
            if (profile) {
                state.user = session.user;
                state.profile = profile;
                renderMainMenu();
            } else {
                console.error("Usuário autenticado mas sem perfil. Deslogando.", error);
                await handleLogout();
            }
        } else {
            renderAuthScreen();
        }
    }

    return { init };
})();

Game.init();
