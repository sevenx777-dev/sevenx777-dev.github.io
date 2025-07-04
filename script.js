const Game = (() => {
    // --- 1. ESTADO GLOBAL E CONFIGURAÇÕES ---
    let state = {
        user: null, profile: null, manager: null, player: null, onlineMatch: null, realtimeChannel: null,
    };
    let matchmakingTimer = null;

    const SUPABASE_URL = 'https://fwwwpdzvnptcbcoarejm.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJzdXBhYmFzZSIsInJlZiI6ImZ3d3dwZHp2bnB0Y2Jjb2FyZWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjM2MTQsImV4cCI6MjA2NzEzOTYxNH0.uozT2nfKs4EINeF6Suyp6AbmkrQ4V8W1sG9SWiokU1o';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const CONSTANTS = {
        RANKS: [
            { name: 'Bronze III', starsToPromote: 3, color: '#a97142' }, { name: 'Bronze II',  starsToPromote: 3, color: '#a97142' }, { name: 'Bronze I',   starsToPromote: 4, color: '#a97142' },
            { name: 'Prata III',  starsToPromote: 4, color: '#a8a8a8' }, { name: 'Prata II',   starsToPromote: 4, color: '#a8a8a8' }, { name: 'Prata I',    starsToPromote: 5, color: '#a8a8a8' },
            { name: 'Ouro III',   starsToPromote: 5, color: '#f5d742' }, { name: 'Ouro II',    starsToPromote: 5, color: '#f5d742' }, { name: 'Ouro I',     starsToPromote: 5, color: '#f5d742' },
            { name: 'Platina III', starsToPromote: 5, color: '#4E9C81' }, { name: 'Platina II',  starsToPromote: 5, color: '#4E9C81' }, { name: 'Platina I',   starsToPromote: 5, color: '#4E9C81' },
            { name: 'Diamante III', starsToPromote: 5, color: '#4d82d1' }, { name: 'Diamante II',  starsToPromote: 5, color: '#4d82d1' }, { name: 'Diamante I',   starsToPromote: 5, color: '#4d82d1' },
            { name: 'Lendário I',   starsToPromote: 3, color: '#8a2be2' }, { name: 'Lendário II',  starsToPromote: 3, color: '#8a2be2' }, { name: 'Lendário III', starsToPromote: 3, color: '#8a2be2' },
            { name: 'Global',       starsToPromote: 0, color: '#ff4500' }
        ],
        CAREER_RANK_XP_THRESHOLDS: [100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5200, 6500, 8000, 10000, 12500, 15000, 20000, 25000, 30000],
        DB: {
            ATTRIBUTES_MAP: {
                ATA: { "Chute": 8, "Drible": 7, "Velocidade": 6, "Passe": 4, "Forca": 5 },
                MEI: { "Passe": 8, "Drible": 7, "Chute": 5, "Defesa": 5, "Visao": 6 },
                DEF: { "Defesa": 8, "Forca": 7, "Passe": 5, "Velocidade": 5, "Marcacao": 6 },
                GOL: { "Reflexos": 8, "Posicionamento": 7, "Um-pra-um": 6, "Passe": 4, "Agilidade": 5 }
            },
            AI_TEAMS: [
                { nome: "Tubarões do Litoral", forca: 72 }, { nome: "Espectros Urbanos", forca: 68 },
                { nome: "Guerreiros do Vale", forca: 79 }, { nome: "Dragões do Norte", forca: 75 },
                { nome: "Fênix do Deserto", forca: 82 }, { nome: "Corsários da Costa", forca: 88 },
                { nome: "Lobos da Montanha", forca: 85 }, { nome: "Titans da Capital", forca: 91 }
            ],
            FIRST_NAMES: ["Carlos", "Bruno", "Leo", "Marcos", "Lucas", "André", "Felipe", "Ricardo", "Paulo", "Fernando"],
            LAST_NAMES: ["Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Gomes", "Alves", "Ribeiro", "Martins"]
        }
    };
    
    // --- 2. ELEMENTOS DA UI ---
    const root = document.getElementById('app-root');
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    // --- 3. FUNÇÕES UTILITÁRIAS E DE UI ---
    function showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
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
            <div class="text-gray-300 mb-6 whitespace-pre-wrap">${message}</div>
            <div class="flex justify-center gap-4 flex-wrap">${buttonsHTML}</div>`;
        modal.classList.remove('hidden');
    }

    function closeModal() { modal.classList.add('hidden'); modalContent.innerHTML = ''; }

    function showLoading(element) {
        if (element) element.innerHTML = '<div class="loader mx-auto"></div>';
    }

    function renderGameContainer(contentHTML) {
        root.innerHTML = `<div id="game-container">${contentHTML}</div>`;
    }

    // --- 4. FUNÇÕES DE RENDERIZAÇÃO DE TELA ---
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
                    <p class="text-teal-400 font-semibold text-lg mb-4">Bem-vindo, ${state.user.email.split('@')[0]}!</p>
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
    
    // --- 5. LÓGICA DE RANKING E CARREIRA ---
    async function updatePvpRankDisplay() {
        const display = document.getElementById('player-rank-display');
        if (!state.profile || !display) return;
        
        showLoading(display);
        const { data, error } = await supabaseClient.from('profiles').select('rank_id, rank_stars').eq('id', state.user.id).single();
        if(error) { console.error("Erro ao buscar rank 1x1:", error); display.innerHTML = 'Erro ao carregar rank.'; return; }

        state.profile.rank_id = data.rank_id;
        state.profile.rank_stars = data.rank_stars;

        const currentRank = CONSTANTS.RANKS[data.rank_id];
        display.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-400">RANK ATUAL 1x1</h3>
            <div class="text-3xl font-extrabold" style="color: ${currentRank.color};">${currentRank.name}</div>
            <div class="rank-star mt-2 text-yellow-400">${'★'.repeat(data.rank_stars)}${'☆'.repeat(currentRank.starsToPromote > 0 ? Math.max(0, currentRank.starsToPromote - data.rank_stars) : 0)}</div>
        `;
    }

    function renderCareerRank(mode) {
        const career = state[mode];
        const displayElement = document.getElementById(`${mode}-rank-display`);
        if (!career || !displayElement) return;

        const currentRank = CONSTANTS.RANKS[career.rank_id];
        const currentXP = career.rank_xp;
        
        const xpForCurrentRank = career.rank_id > 0 ? CONSTANTS.CAREER_RANK_XP_THRESHOLDS[career.rank_id - 1] : 0;
        const xpForNextRank = career.rank_id < CONSTANTS.CAREER_RANK_XP_THRESHOLDS.length ? CONSTANTS.CAREER_RANK_XP_THRESHOLDS[career.rank_id] : currentXP;
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
            career.rank_id < CONSTANTS.CAREER_RANK_XP_THRESHOLDS.length &&
            career.rank_xp >= CONSTANTS.CAREER_RANK_XP_THRESHOLDS[career.rank_id]
        ) {
            career.rank_id++;
            rankUp = true;
        }
    
        if (rankUp) {
            const newRank = CONSTANTS.RANKS[career.rank_id];
            showToast(`PATENTE ATINGIDA: ${newRank.name}!`, 'success', 5000);
        }
    
        await saveCareer(mode); 
    }
    
    async function saveCareer(mode) {
        const career = state[mode];
        if (!career) return;
        
        const tableName = `online_${mode}_careers`;
        const { error } = await supabaseClient.from(tableName)
            .update({
                game_state: career.game_state,
                rank_id: career.rank_id,
                rank_xp: career.rank_xp
            })
            .eq('user_id', state.user.id);
    
        if (error) {
            console.error(`Erro ao salvar carreira de ${mode}:`, error);
            showToast("Erro ao salvar progresso.", "error");
        }
    }

    // --- 6. AUTENTICAÇÃO E NAVEGAÇÃO ---
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
            authError.textContent = "Email ou senha inválidos."; 
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

        const { data: authData, error: authErrorMsg } = await supabaseClient.auth.signUp({ 
            email: emailInput.value, 
            password: passwordInput.value 
        });
        
        if (authErrorMsg) {
            authError.textContent = "Não foi possível registar. Verifique os dados ou tente um email diferente."; 
            authForm.classList.remove('hidden');
            authLoading.classList.add('hidden');
            return;
        }

        if (authData.user) {
            showModal('Aguarde', 'A finalizar a criação do seu perfil de jogador...', []);
            
            const { data: profile, error: profileError } = await supabaseClient
                .from('profiles')
                .insert({ 
                    id: authData.user.id, 
                    email: authData.user.email,
                    rank_id: 0,
                    rank_stars: 0
                })
                .select()
                .single();

            if (profileError) {
                console.error("Erro crítico ao criar perfil:", profileError);
                authError.textContent = 'Erro ao criar o perfil. Tente fazer login.';
                authForm.classList.remove('hidden');
                authLoading.classList.add('hidden');
                closeModal();
                return;
            }

            state.user = authData.user;
            state.profile = profile;
            closeModal();
            renderMainMenu();
        } else {
             authError.textContent = 'Ocorreu um erro inesperado durante o registo.';
             authForm.classList.remove('hidden');
             authLoading.classList.add('hidden');
        }
    }
    
    function confirmLogout() {
        showModal('Confirmar Saída', 'Você tem certeza que deseja sair?', [
            { id: 'modal-cancel-btn', text: 'Cancelar', class: 'bg-gray-600' },
            { id: 'modal-logout-btn', text: 'Sair', class: 'bg-red-600' }
        ]);
    }

    async function handleLogout() {
        if (state.realtimeChannel) { await supabaseClient.removeChannel(state.realtimeChannel); }
        await supabaseClient.auth.signOut();
        Object.keys(state).forEach(key => state[key] = null);
        closeModal();
        renderAuthScreen();
    }

    function showMainMenu() {
        if (state.realtimeChannel) { cancelMatchmaking(false); }
        state.onlineMatch = null;
        renderMainMenu();
    }
    
    // --- 7. MODO ONLINE 1X1 (PVP) ---
    function initPvpMode() {
        const content = `
            <div id="online-mode">
                <header class="bg-gray-800 p-4 text-center"><h2 class="text-3xl font-bold">Partida Rápida 1x1</h2></header>
                <div class="p-4 md:p-8 max-w-lg mx-auto text-center">
                    <div id="lobby-rank-display" class="mb-6 bg-gray-800 p-4 rounded-lg"></div>
                    <div class="bg-gray-800 p-8 rounded-lg">
                        <p id="pvp-status-text" class="text-2xl font-semibold text-gray-300 mb-6">Pronto para encontrar um oponente?</p>
                        <div id="pvp-loader" class="loader mx-auto hidden mb-4"></div>
                        <button id="find-match-btn" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-lg text-2xl btn-action">Procurar Partida</button>
                        <button id="cancel-search-btn" class="w-full mt-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg btn-action hidden">Cancelar Busca</button>
                    </div>
                    <button id="back-to-menu-btn" class="w-full mt-8 bg-gray-600 p-2 rounded">Voltar ao Menu Principal</button>
                </div>
            </div>`;
        renderGameContainer(content);
        const lobbyRankDisplay = document.getElementById('lobby-rank-display');
        const currentRankHTML = document.getElementById('player-rank-display').innerHTML;
        lobbyRankDisplay.innerHTML = currentRankHTML;
    }

    async function findOnlineMatch() {
        togglePvpUi(true, 'Procurando oponente...');
        const { data: match, error } = await supabaseClient.rpc('find_or_create_match');

        if (error) {
            showToast('Erro ao procurar partida.', 'error');
            togglePvpUi(false, 'Pronto para encontrar um oponente?');
            return;
        }

        state.onlineMatch = match;
        if (match.status === 'in_progress') {
            clearTimeout(matchmakingTimer);
            showToast('Oponente encontrado!', 'success');
            await startOnlineMatch(match);
        } else {
            setupRealtimeForMatch(match.id);
            matchmakingTimer = setTimeout(() => {
                showToast('Nenhum jogador encontrado. Iniciando partida contra um bot.', 'info');
                startBotMatch();
            }, 15000);
        }
    }

    async function cancelMatchmaking(showUiUpdate = true) {
        clearTimeout(matchmakingTimer);
        matchmakingTimer = null;
        if (state.realtimeChannel) {
            await supabaseClient.removeChannel(state.realtimeChannel);
            state.realtimeChannel = null;
        }
        if (state.onlineMatch && state.onlineMatch.status === 'searching') {
            await supabaseClient.from('online_matches').delete().eq('id', state.onlineMatch.id);
        }
        state.onlineMatch = null;
        if (showUiUpdate) togglePvpUi(false, 'Busca cancelada.');
    }

    function togglePvpUi(isSearching, text) {
        document.getElementById('pvp-status-text').textContent = text;
        document.getElementById('pvp-loader').classList.toggle('hidden', !isSearching);
        document.getElementById('find-match-btn').classList.toggle('hidden', isSearching);
        document.getElementById('cancel-search-btn').classList.toggle('hidden', !isSearching);
    }

    function setupRealtimeForMatch(matchId) {
        if (state.realtimeChannel) supabaseClient.removeChannel(state.realtimeChannel);
        
        state.realtimeChannel = supabaseClient.channel(`online-match-${matchId}`);
        state.realtimeChannel
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'online_matches', filter: `id=eq.${matchId}` }, async payload => {
                if (payload.new.status === 'in_progress' && payload.new.player2_id) {
                    clearTimeout(matchmakingTimer);
                    showToast('Oponente encontrado!', 'success');
                    await startOnlineMatch(payload.new);
                }
            })
            .on('broadcast', { event: 'player_action' }, ({ payload }) => {
                if (payload.sender_id !== state.user.id) {
                    state.onlineMatch.opponentAction = payload.action;
                    if (state.onlineMatch.myAction) resolveRound();
                }
            })
            .on('broadcast', { event: 'rematch_request' }, ({payload}) => {
                if(payload.sender_id !== state.user.id) {
                    showModal('Revanche?', 'Seu oponente quer jogar de novo. Aceita?', [
                        {id: 'modal-accept-rematch', text: 'Aceitar', class: 'bg-green-600'},
                        {id: 'modal-decline-rematch', text: 'Recusar', class: 'bg-red-600'}
                    ]);
                    document.getElementById('modal-accept-rematch').onclick = async () => {
                        await state.realtimeChannel.send({type: 'broadcast', event: 'rematch_accepted', payload: {}});
                        closeModal();
                        startOnlineMatch(state.onlineMatch, true);
                    };
                    document.getElementById('modal-decline-rematch').onclick = () => { closeModal(); showMainMenu(); };
                }
            })
            .on('broadcast', { event: 'rematch_accepted' }, () => {
                showToast('Revanche aceita!', 'success');
                closeModal();
                startOnlineMatch(state.onlineMatch, true);
            })
            .subscribe(status => {
                if (status !== 'SUBSCRIBED') { console.error('Falha ao conectar ao canal Realtime'); }
            });
    }
    
    function startBotMatch() {
        cancelMatchmaking(false);
        state.onlineMatch = {
            isBotMatch: true,
            myScore: 0,
            opponentScore: 0,
            opponentName: "Robô Treinador"
        };
        setupMatchUI();
    }

    async function startOnlineMatch(match, isRematch = false) {
        if (state.realtimeChannel && !isRematch) {
            await supabaseClient.removeChannel(state.realtimeChannel);
            state.realtimeChannel = null;
        }

        const opponentId = match.player1_id === state.user.id ? match.player2_id : match.player1_id;
        const { data: opponentProfile } = await supabaseClient.from('profiles').select('email').eq('id', opponentId).single();
        
        state.onlineMatch = {
            ...match,
            isBotMatch: false,
            myScore: 0,
            opponentScore: 0,
            myAction: null,
            opponentAction: null,
            opponentName: opponentProfile.email.split('@')[0],
            opponentId: opponentId
        };
        
        if (!isRematch) setupRealtimeForMatch(match.id);
        setupMatchUI();
    }

    function setupMatchUI() {
        const myName = state.user.email.split('@')[0];
        const opponentName = state.onlineMatch.opponentName;

        const content = `
            <div id="match-screen" class="p-4 md:p-8 max-w-4xl mx-auto">
                <div class="grid grid-cols-3 items-center text-center mb-4">
                    <div id="my-player-name" class="text-xl font-bold text-blue-400">${myName}</div>
                    <div id="score" class="text-4xl font-extrabold">${state.onlineMatch.myScore} x ${state.onlineMatch.opponentScore}</div>
                    <div id="opponent-player-name" class="text-xl font-bold text-red-400">${opponentName}</div>
                </div>
                <div id="match-commentary" class="bg-gray-800 p-4 rounded-lg mb-6 overflow-y-auto text-gray-300 h-32">
                    <p>A partida começou! Escolha sua ação.</p>
                </div>
                <div id="action-panel" class="grid grid-cols-3 gap-4">
                    <button data-action="attack" class="action-btn bg-red-600 p-6 rounded-lg text-xl font-bold btn-action">Ataque</button>
                    <button data-action="defend" class="action-btn bg-blue-600 p-6 rounded-lg text-xl font-bold btn-action">Defesa</button>
                    <button data-action="counter" class="action-btn bg-green-600 p-6 rounded-lg text-xl font-bold btn-action">Contra-Ataque</button>
                </div>
                <div id="waiting-panel" class="hidden text-center p-6 bg-gray-700 rounded-lg">
                    <p class="text-xl">Aguardando oponente...</p>
                    <div class="loader mx-auto mt-4"></div>
                </div>
                <button id="leave-match-btn" class="w-full mt-8 bg-gray-600 p-2 rounded">Desistir da Partida</button>
            </div>
        `;
        renderGameContainer(content);
    }
    
    function playNextRound() {
        state.onlineMatch.myAction = null;
        state.onlineMatch.opponentAction = null;
        document.getElementById('action-panel').classList.remove('hidden');
        document.getElementById('waiting-panel').classList.add('hidden');
        document.querySelectorAll('.action-btn').forEach(b => b.classList.remove('selected'));
    }

    async function handlePlayerAction(action) {
        state.onlineMatch.myAction = action;
        document.getElementById('action-panel').classList.add('hidden');
        document.getElementById('waiting-panel').classList.remove('hidden');
        document.querySelector(`.action-btn[data-action="${action}"]`).classList.add('selected');

        if (state.onlineMatch.isBotMatch) {
            const actions = ['attack', 'defend', 'counter'];
            state.onlineMatch.opponentAction = actions[Math.floor(Math.random() * actions.length)];
            setTimeout(resolveRound, 1000); 
        } else {
            await state.realtimeChannel.send({
                type: 'broadcast',
                event: 'player_action',
                payload: { sender_id: state.user.id, action: action }
            });
            if (state.onlineMatch.opponentAction) resolveRound();
        }
    }

    function resolveRound() {
        const myAction = state.onlineMatch.myAction;
        const opAction = state.onlineMatch.opponentAction;
        let commentaryText = `Você jogou ${myAction}. Oponente jogou ${opAction}.\n`;
        
        if (myAction === opAction) {
            commentaryText += "Ações iguais! Ninguém marcou.";
        } else if (
            (myAction === 'attack' && opAction === 'counter') ||
            (myAction === 'counter' && opAction === 'defend') ||
            (myAction === 'defend' && opAction === 'attack')
        ) {
            commentaryText += "Você levou a melhor na disputa! GOL!";
            state.onlineMatch.myScore++;
        } else {
            commentaryText += "O oponente previu sua jogada! Gol deles.";
            state.onlineMatch.opponentScore++;
        }
        
        updateMatchUI(commentaryText);

        if (state.onlineMatch.myScore >= 3 || state.onlineMatch.opponentScore >= 3) {
            setTimeout(endMatch, 2000);
        } else {
            setTimeout(playNextRound, 2000);
        }
    }

    function updateMatchUI(commentary) {
        document.getElementById('score').textContent = `${state.onlineMatch.myScore} x ${state.onlineMatch.opponentScore}`;
        const commentaryBox = document.getElementById('match-commentary');
        commentaryBox.innerHTML = `<p>${commentary}</p>` + commentaryBox.innerHTML;
    }
    
    async function endMatch() {
        const iWon = state.onlineMatch.myScore > state.onlineMatch.opponentScore;
        const title = iWon ? "VITÓRIA!" : "DERROTA";
        const message = iWon ? "Você venceu a partida!" : "Não foi dessa vez. Mais sorte na próxima!";
        
        if (!state.onlineMatch.isBotMatch) {
            const winner = iWon ? state.user.id : state.onlineMatch.opponentId;
            const loser = iWon ? state.onlineMatch.opponentId : state.user.id;
            await supabaseClient.rpc('handle_match_result', { winner_id: winner, loser_id: loser });
            showModal(title, message, [
                {id: 'modal-rematch-btn', text: 'Revanche', class: 'bg-green-600'},
                {id: 'modal-back-to-menu-btn', text: 'Voltar ao Menu', class: 'bg-gray-600'}
            ]);
            document.getElementById('modal-rematch-btn').onclick = async () => {
                showModal('Aguarde', 'Enviando pedido de revanche...', []);
                await state.realtimeChannel.send({type: 'broadcast', event: 'rematch_request', payload: {sender_id: state.user.id}});
            };
        } else {
            showToast('Partida contra o bot finalizada.', 'info');
            showModal(title, message, [{id: 'modal-back-to-menu-btn', text: 'Voltar ao Menu', class: 'bg-gray-600'}]);
        }
    }

    // --- 8. MODOS DE CARREIRA (Função de Carregamento Genérica) ---
    async function loadOrCreateOnlineCareer(careerType) {
        showModal('Aguarde', '<div class="loader mx-auto"></div><p class="mt-4">Carregando carreira online...</p>', []);
        const tableName = `online_${careerType}_careers`;
        const { data, error } = await supabaseClient.from(tableName).select('*').eq('user_id', state.user.id).single();
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
    
    // --- 9. CARREIRA DE TÉCNICO ---
    function generatePlayer(position, minOverall, maxOverall) {
        const name = `${CONSTANTS.DB.FIRST_NAMES[Math.floor(Math.random() * CONSTANTS.DB.FIRST_NAMES.length)]} ${CONSTANTS.DB.LAST_NAMES[Math.floor(Math.random() * CONSTANTS.DB.LAST_NAMES.length)]}`;
        const baseAttrs = CONSTANTS.DB.ATTRIBUTES_MAP[position];
        let attributes = {};
        let totalPoints = 0;
        const targetOverall = Math.floor(Math.random() * (maxOverall - minOverall + 1) + minOverall);

        for(const attr in baseAttrs){
            const randomFactor = (Math.random() - 0.5) * 4; // de -2 a +2
            attributes[attr] = Math.max(1, Math.round(targetOverall/10 + randomFactor));
            totalPoints += attributes[attr];
        }
        
        const overall = Math.round( (totalPoints / Object.keys(baseAttrs).length) * 10);
        const value = 10000 * Math.pow(overall, 2.5);

        return { id: self.crypto.randomUUID(), name, position, attributes, overall, value };
    }

    function generateInitialSquad(baseOverall) {
        let squad = [];
        const positions = ["GOL", "DEF", "DEF", "DEF", "DEF", "MEI", "MEI", "MEI", "MEI", "ATA", "ATA", "GOL", "DEF", "MEI", "ATA", "DEF", "MEI", "ATA"];
        for(const pos of positions) {
            squad.push(generatePlayer(pos, baseOverall - 5, baseOverall + 5));
        }
        return squad;
    }

    function initManagerCreation() {
        const content = `
            <div id="manager-career-mode">
                <header class="bg-gray-800 p-4 text-center"><h2 class="text-3xl font-bold">Defina a Filosofia do Clube</h2></header>
                <div class="p-4 md:p-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="card bg-gray-800 p-6 rounded-lg text-center border-2 border-transparent hover:border-teal-500 cursor-pointer" data-philosophy="cantera">
                        <h3 class="text-2xl font-bold mb-2">Cantera</h3><p class="text-gray-400 mb-4">Foco na base. Orçamento menor, academia de elite. Paciência da diretoria com resultados.</p>
                    </div>
                    <div class="card bg-gray-800 p-6 rounded-lg text-center border-2 border-transparent hover:border-teal-500 cursor-pointer" data-philosophy="galactic">
                        <h3 class="text-2xl font-bold mb-2">Galácticos</h3><p class="text-gray-400 mb-4">Orçamento gigante para contratar estrelas. A pressão por títulos é imediata.</p>
                    </div>
                    <div class="card bg-gray-800 p-6 rounded-lg text-center border-2 border-transparent hover:border-teal-500 cursor-pointer" data-philosophy="moneyball">
                        <h3 class="text-2xl font-bold mb-2">Moneyball</h3><p class="text-gray-400 mb-4">Gestão inteligente. Foco em contratar jogadores subvalorizados e vender caro.</p>
                    </div>
                </div>
                <button id="back-to-menu-btn" class="w-full max-w-xs mx-auto mt-8 bg-gray-600 p-2 rounded block">Voltar</button>
            </div>
        `;
        renderGameContainer(content);
    }

    async function setupManagerMode(philosophy) {
        showModal('Criando Carreira...', '<div class="loader mx-auto"></div>', []);
        
        let baseOverall = 0;
        let budget = 0;
        if (philosophy === 'cantera') { budget = 5000000; baseOverall = 65; }
        else if (philosophy === 'galactic') { budget = 100000000; baseOverall = 80; }
        else if (philosophy === 'moneyball') { budget = 20000000; baseOverall = 72; }

        let gameState = {
            philosophy,
            budget,
            season: 1,
            wins: 0, draws: 0, losses: 0,
            squad: generateInitialSquad(baseOverall),
            tactic: 'Equilibrada'
        };

        const { data, error } = await supabaseClient.from('online_manager_careers').insert({
            user_id: state.user.id,
            game_state: gameState,
            rank_id: 0, rank_xp: 0
        }).select().single();

        if (error) { showToast('Erro ao criar carreira.', 'error'); closeModal(); return; }

        state.manager = data;
        closeModal();
        initManagerHub();
    }

    function initManagerHub() {
        const content = `
            <div id="manager-hub" class="max-w-6xl mx-auto">
                <header class="bg-gray-800 p-4 flex justify-between items-center">
                    <h2 class="text-2xl font-bold">Central do Técnico</h2>
                    <button id="back-to-menu-btn" class="bg-gray-600 p-2 rounded">Menu Principal</button>
                </header>
                <div class="p-4 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="md:col-span-1 bg-gray-800 p-4 rounded-lg">
                        <div id="manager-rank-display" class="mb-4"></div>
                        <nav class="flex flex-col space-y-2">
                             <button data-tab="manager-office" class="nav-item p-3 rounded text-left bg-gray-700 hover:bg-gray-600 active">Escritório</button>
                             <button data-tab="manager-squad" class="nav-item p-3 rounded text-left bg-gray-700 hover:bg-gray-600">Elenco</button>
                             <button data-tab="manager-transfers" class="nav-item p-3 rounded text-left bg-gray-700 hover:bg-gray-600">Transferências</button>
                             <button data-tab="manager-finances" class="nav-item p-3 rounded text-left bg-gray-700 hover:bg-gray-600">Finanças</button>
                        </nav>
                    </div>
                    <main id="manager-content-area" class="md:col-span-3 bg-gray-800 p-6 rounded-lg"></main>
                </div>
            </div>`;
        renderGameContainer(content);
        renderCareerRank('manager');
        renderManagerContent('manager-office');
    }

    function switchManagerTab(tabId) {
        document.querySelectorAll('#manager-hub .nav-item').forEach(el => el.classList.remove('active'));
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        renderManagerContent(tabId);
    }
    
    function calculateTeamStrength() {
        const gs = state.manager.game_state;
        if (!gs.squad || gs.squad.length === 0) return 0;
        const sortedSquad = [...gs.squad].sort((a, b) => b.overall - a.overall);
        const starters = sortedSquad.slice(0, 11);
        const totalOverall = starters.reduce((sum, player) => sum + player.overall, 0);
        return Math.round(totalOverall / starters.length);
    }

    function renderManagerContent(tabId) {
        const area = document.getElementById('manager-content-area');
        const gs = state.manager.game_state;
        let content = '';

        const teamStrength = calculateTeamStrength();

        switch(tabId) {
            case 'manager-office':
                const nextOpponent = CONSTANTS.DB.AI_TEAMS[Math.min(gs.wins + gs.draws + gs.losses, CONSTANTS.DB.AI_TEAMS.length -1)];
                content = `
                    <h3 class="text-3xl font-bold mb-4">Escritório Principal</h3>
                    <p class="text-lg mb-2">Temporada: ${gs.season}</p>
                    <p class="text-lg mb-6">Campanha: ${gs.wins}V - ${gs.draws}E - ${gs.losses}D</p>
                    <div class="bg-gray-900 p-6 rounded-lg">
                        <h4 class="text-2xl font-semibold mb-4">Próxima Partida</h4>
                        <p class="text-xl mb-1">Adversário: <span class="font-bold">${nextOpponent.nome}</span></p>
                        <p class="mb-4">Força do Adversário: ${nextOpponent.forca}</p>
                        <div class="mb-4">
                            <label for="tactic-select" class="block mb-2 text-gray-400">Tática para a partida:</label>
                            <select id="tactic-select" class="w-full p-2 rounded bg-gray-700 border border-gray-600">
                                <option value="Equilibrada" ${gs.tactic === 'Equilibrada' ? 'selected' : ''}>Equilibrada (Padrão)</option>
                                <option value="Ofensiva" ${gs.tactic === 'Ofensiva' ? 'selected' : ''}>Ofensiva (+5 Força, Risco Maior)</option>
                                <option value="Defensiva" ${gs.tactic === 'Defensiva' ? 'selected' : ''}>Defensiva (-5 Força, Risco Menor)</option>
                            </select>
                        </div>
                        <button id="simulate-round-btn" class="w-full bg-teal-600 p-3 rounded-lg text-xl btn-action">Jogar Partida</button>
                    </div>
                `;
                break;

            case 'manager-squad':
                const squadHTML = gs.squad.map(p => `
                    <div class="grid grid-cols-5 gap-2 items-center bg-gray-900 p-3 rounded">
                        <span class="col-span-2">${p.name}</span>
                        <span>${p.position}</span>
                        <span class="font-bold text-teal-400 text-lg">${p.overall}</span>
                        <button class="sell-player-btn bg-red-600 text-xs py-1 px-2 rounded" data-player-id="${p.id}">Vender ($${(p.value / 2).toLocaleString()})</button>
                    </div>`).join('');
                content = `
                    <h3 class="text-3xl font-bold mb-4">Gerenciamento do Elenco</h3>
                    <p class="mb-4">Força do Time (11 Titulares): <span class="font-bold text-2xl text-teal-400">${teamStrength}</span></p>
                    <div class="space-y-2">${squadHTML}</div>
                `;
                break;
            
            case 'manager-transfers':
                let marketPlayers = "";
                for(let i=0; i < 5; i++) {
                    const pos = ["GOL", "DEF", "MEI", "ATA"][Math.floor(Math.random()*4)];
                    const player = generatePlayer(pos, teamStrength - 10, teamStrength + 10);
                    marketPlayers += `
                        <div class="grid grid-cols-5 gap-2 items-center bg-gray-900 p-3 rounded">
                            <span class="col-span-2">${player.name}</span>
                            <span>${player.position}</span>
                            <span class="font-bold text-teal-400 text-lg">${player.overall}</span>
                            <button class="buy-player-btn bg-green-600 text-xs py-1 px-2 rounded" data-player-info='${JSON.stringify(player)}'>Comprar ($${player.value.toLocaleString()})</button>
                        </div>`;
                }
                content = `
                    <h3 class="text-3xl font-bold mb-4">Mercado de Transferências</h3>
                    <p class="mb-4">Orçamento Disponível: <span class="font-bold text-green-400">$${gs.budget.toLocaleString()}</span></p>
                    <h4 class="text-xl font-semibold mb-2">Jogadores disponíveis:</h4>
                    <div class="space-y-2">${marketPlayers}</div>
                    <p class="text-xs text-gray-500 mt-4">O mercado é atualizado a cada visita.</p>
                `;
                break;

            case 'manager-finances':
                content = `
                    <h3 class="text-3xl font-bold mb-4">Finanças do Clube</h3>
                    <p>Orçamento para Transferências:</p>
                    <p class="font-bold text-3xl text-green-400">$${gs.budget.toLocaleString()}</p>
                    <p class="text-gray-400 mt-4"> (Funcionalidade de transferências em breve) </p>
                `;
                break;
        }
        area.innerHTML = content;
    }

    async function simulateRound() {
        showModal('Simulando...', '<div class="loader mx-auto"></div><p class="mt-4">A partida está em andamento...</p>', []);
        const gs = state.manager.game_state;
        const tactic = document.getElementById('tactic-select').value;
        gs.tactic = tactic;

        const nextOpponent = CONSTANTS.DB.AI_TEAMS[Math.min(gs.wins + gs.draws + gs.losses, CONSTANTS.DB.AI_TEAMS.length - 1)];

        let myStrength = calculateTeamStrength();
        if (tactic === 'Ofensiva') myStrength += 5;
        if (tactic === 'Defensiva') myStrength -= 5;

        const opStrength = nextOpponent.forca;
        
        const strengthDifference = myStrength - opStrength;
        const winChance = 0.5 + (strengthDifference / 100);
        const roll = Math.random();

        let resultText = '';
        let xpGained = 0;
        
        if (roll < winChance) {
            gs.wins++;
            xpGained = tactic === 'Ofensiva' ? 60 : 50;
            resultText = `VITÓRIA! Vencemos o ${nextOpponent.nome}.`;
        } else if (roll < winChance + 0.15) {
            gs.draws++;
            xpGained = 20;
            resultText = `EMPATE. Jogo duro contra o ${nextOpponent.nome}.`;
        } else {
            gs.losses++;
            xpGained = tactic === 'Defensiva' ? 15 : 10;
            resultText = `DERROTA. Não foi possível superar o ${nextOpponent.nome}.`;
        }

        await updateCareerProgress('manager', xpGained);
        
        setTimeout(() => {
            closeModal();
            showModal('Resultado da Partida', `${resultText}\n\nVocê ganhou ${xpGained} XP de Técnico.`, [{id: 'modal-ok-btn', text: 'Continuar', class: 'bg-teal-600'}]);
            renderManagerContent('manager-office');
        }, 1500);
    }
    
    async function buyPlayer(playerData) {
        const gs = state.manager.game_state;
        if (gs.squad.length >= 25) {
            showToast("Seu elenco está cheio (máx 25 jogadores).", "error");
            return;
        }
        if (gs.budget >= playerData.value) {
            gs.budget -= playerData.value;
            gs.squad.push(playerData);
            showToast(`${playerData.name} contratado!`, "success");
            await saveCareer('manager');
            renderManagerContent('manager-transfers');
        } else {
            showToast("Orçamento insuficiente.", "error");
        }
    }

    async function sellPlayer(playerId) {
        const gs = state.manager.game_state;
        const playerIndex = gs.squad.findIndex(p => p.id === playerId);
        if(playerIndex > -1) {
            const player = gs.squad[playerIndex];
            const saleValue = Math.floor(player.value / 2);
            gs.budget += saleValue;
            gs.squad.splice(playerIndex, 1);
            showToast(`${player.name} vendido por $${saleValue.toLocaleString()}`, "info");
            await saveCareer('manager');
            renderManagerContent('manager-squad');
        }
    }

    // --- 10. CARREIRA DE JOGADOR ---
    function initPlayerCreation() {
        const content = `
            <div id="player-career-mode">
                <header class="bg-gray-800 p-4 text-center"><h2 class="text-3xl font-bold">Crie seu Craque</h2></header>
                <div class="p-4 md:p-8 max-w-2xl mx-auto">
                    <div class="mb-4">
                        <label for="player-name-input" class="block mb-2">Nome:</label>
                        <input type="text" id="player-name-input" class="w-full p-2 rounded bg-gray-700 border border-gray-600" placeholder="Ex: Léo da Silva">
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Posição:</label>
                        <select id="player-position-select" class="w-full p-2 rounded bg-gray-700 border border-gray-600">
                            <option value="ATA">Atacante</option><option value="MEI">Meio-campista</option><option value="DEF">Defensor</option><option value="GOL">Goleiro</option>
                        </select>
                    </div>
                    <div class="mb-6">
                        <h3 class="font-semibold mb-2">Atributos Iniciais:</h3>
                        <div id="attribute-inputs" class="space-y-2 mt-2 bg-gray-800 p-4 rounded"></div>
                    </div>
                    <button id="finalize-player-creation-btn" class="w-full bg-teal-600 p-3 rounded-lg text-xl btn-action">Iniciar Carreira</button>
                    <button id="back-to-menu-btn" class="w-full mt-2 bg-gray-600 p-2 rounded">Voltar</button>
                </div>
            </div>`;
        renderGameContainer(content);
        renderAttributeInputs();
    }

    function renderAttributeInputs() {
        const position = document.getElementById('player-position-select').value;
        const attributes = CONSTANTS.DB.ATTRIBUTES_MAP[position];
        const container = document.getElementById('attribute-inputs');
        container.innerHTML = Object.entries(attributes).map(([attr, value]) => `
            <div class="flex justify-between items-center">
                <label>${attr}</label>
                <span class="font-bold text-teal-400">${value}</span>
            </div>
        `).join('');
    }

    async function finalizePlayerCreation() {
        const name = document.getElementById('player-name-input').value.trim();
        if (!name) {
            showToast('Por favor, insira um nome para o jogador.', 'error');
            return;
        }
        
        showModal('Criando Craque...', '<div class="loader mx-auto"></div>', []);
        const position = document.getElementById('player-position-select').value;
        const attributes = CONSTANTS.DB.ATTRIBUTES_MAP[position];
        const initialTeam = CONSTANTS.DB.AI_TEAMS[0];

        const gameState = {
            name,
            position,
            attributes,
            overall: Math.round(Object.values(attributes).reduce((a, b) => a + b, 0) / Object.values(attributes).length * 10),
            club: initialTeam.nome,
            reputation: 10,
            salary: 500,
            cash: 0,
            gamesPlayed: 0,
        };

        const { data, error } = await supabaseClient.from('online_player_careers').insert({
            user_id: state.user.id,
            game_state: gameState,
            rank_id: 0,
            rank_xp: 0
        }).select().single();

        if (error) {
            showToast('Erro ao criar jogador.', 'error');
            closeModal();
            return;
        }
        
        state.player = data;
        closeModal();
        initPlayerHub();
    }

    function initPlayerHub() {
        const content = `
            <div id="player-hub" class="max-w-6xl mx-auto">
                <header class="bg-gray-800 p-4 flex justify-between items-center">
                    <h2 class="text-2xl font-bold">Central do Jogador</h2>
                    <button id="back-to-menu-btn" class="bg-gray-600 p-2 rounded">Menu Principal</button>
                </header>
                <div class="p-4 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="md:col-span-1 bg-gray-800 p-4 rounded-lg">
                        <div id="player-rank-display" class="mb-4"></div>
                        <nav class="flex flex-col space-y-2">
                             <button data-tab="player-dashboard" class="nav-item p-3 rounded text-left bg-gray-700 hover:bg-gray-600 active">Visão Geral</button>
                             <button data-tab="player-profile" class="nav-item p-3 rounded text-left bg-gray-700 hover:bg-gray-600">Perfil & Atributos</button>
                        </nav>
                    </div>
                    <main id="player-content-area" class="md:col-span-3 bg-gray-800 p-6 rounded-lg"></main>
                </div>
            </div>
        `;
        renderGameContainer(content);
        renderCareerRank('player');
        renderPlayerContent('player-dashboard');
    }

    function switchPlayerTab(tabId) {
        document.querySelectorAll('#player-hub .nav-item').forEach(el => el.classList.remove('active'));
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        renderPlayerContent(tabId);
    }
    
    function renderPlayerContent(tabId) {
        const area = document.getElementById('player-content-area');
        const gs = state.player.game_state;
        let content = '';
        switch(tabId) {
            case 'player-dashboard':
                content = `
                    <h3 class="text-3xl font-bold mb-4">Visão Geral da Carreira</h3>
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="bg-gray-900 p-4 rounded"><strong>Clube Atual:</strong><br> ${gs.club}</div>
                        <div class="bg-gray-900 p-4 rounded"><strong>Reputação:</strong><br> ${gs.reputation}</div>
                        <div class="bg-gray-900 p-4 rounded"><strong>Salário Semanal:</strong><br> $${gs.salary.toLocaleString()}</div>
                        <div class="bg-gray-900 p-4 rounded"><strong>Dinheiro:</strong><br> $${gs.cash.toLocaleString()}</div>
                    </div>
                    <div class="bg-gray-900 p-6 rounded-lg text-center">
                        <h4 class="text-xl font-semibold mb-2">Próxima Oportunidade</h4>
                        <p class="text-gray-400 mb-4">Jogue a próxima partida para ganhar XP, reputação e seu salário.</p>
                        <button id="play-player-match-btn" class="w-full bg-green-600 p-3 rounded-lg text-lg btn-action">Jogar Partida</button>
                    </div>
                `;
                break;
            case 'player-profile':
                gs.overall = Math.round(Object.values(gs.attributes).reduce((a, b) => a + b, 0) / Object.values(gs.attributes).length * 10);
                const attributesHTML = Object.entries(gs.attributes).map(([attr, val]) => `
                    <div class="bg-gray-900 p-3 rounded flex justify-between"><span>${attr}</span> <strong>${val}</strong></div>
                `).join('');
                content = `
                    <h3 class="text-3xl font-bold mb-4">${gs.name}</h3>
                    <p class="text-xl mb-1">Posição: ${gs.position}</p>
                    <p class="text-xl mb-6">Overall: <span class="font-bold text-3xl text-amber-400">${gs.overall}</span></p>
                    <h4 class="text-2xl font-semibold mb-2">Atributos</h4>
                    <div class="grid grid-cols-2 gap-2">${attributesHTML}</div>
                `;
                break;
        }
        area.innerHTML = content;
    }

    function playPlayerMatch() {
        const gs = state.player.game_state;
        let commentary = ["A partida começa! Você está focado."];
        let choices = [];
        
        const scenarioRoll = Math.random();
        if (scenarioRoll < 0.33) {
            commentary.push("Você recebe a bola na entrada da área!");
            choices = [{ text: "Chutar para o Gol", attr: "Chute" }, { text: "Procurar um Passe", attr: "Passe" }];
        } else if (scenarioRoll < 0.66) {
            commentary.push("Um adversário vem te marcar no meio-campo.");
            choices = [{ text: "Tentar um Drible", attr: "Drible" }, { text: "Proteger a bola e tocar de lado", attr: "Forca" }];
        } else {
            commentary.push("O atacante adversário corre na sua direção.");
            choices = [{ text: "Dar o bote", attr: "Defesa" }, { text: "Cercar e esperar o momento certo", attr: "Marcacao" }];
        }
        
        const buttonsHTML = choices.map(c => `<button class="player-action-btn w-full md:w-auto px-6 py-4 rounded-lg font-bold text-white bg-blue-600" data-attr="${c.attr}">${c.text}</button>`).join('');

        modalContent.innerHTML = `
            <h2 class="text-3xl font-bold mb-4">Momento Decisivo!</h2>
            <div id="player-match-commentary" class="text-gray-300 mb-6 whitespace-pre-wrap">${commentary.join("<br>")}</div>
            <div id="player-match-choices" class="flex justify-center gap-4 flex-wrap">${buttonsHTML}</div>`;
        modal.classList.remove('hidden');
    }

    async function resolvePlayerAction(chosenAttribute) {
        const gs = state.player.game_state;
        const commentaryEl = document.getElementById('player-match-commentary');
        document.getElementById('player-match-choices').innerHTML = `<div class="loader mx-auto"></div>`;
        
        const attributeValue = gs.attributes[chosenAttribute] || 5;
        const difficulty = 10;
        const successChance = Math.max(0.1, Math.min(0.9, 0.5 + (attributeValue - difficulty) / 15));
        const roll = Math.random();

        let xpGained, repGained, resultText;

        if(roll < successChance) {
            xpGained = 25 + Math.floor(Math.random() * 15);
            repGained = 2;
            resultText = "BOA ESCOLHA! Você executa a ação com perfeição e ajuda o time.";
            showToast("Sucesso!", "success");
        } else {
            xpGained = 10 + Math.floor(Math.random() * 5);
            repGained = -1;
            resultText = "NÃO DEU! A jogada não sai como esperado, mas vale a tentativa.";
            showToast("Falha.", "error");
        }

        gs.reputation = Math.max(0, gs.reputation + repGained);
        gs.cash += gs.salary;
        gs.gamesPlayed++;
        await updateCareerProgress('player', xpGained);

        setTimeout(() => {
            commentaryEl.innerHTML += `<br><br>${resultText}<br>+${xpGained} XP, ${repGained > 0 ? `+${repGained}` : repGained} Rep, +$${gs.salary.toLocaleString()} Salário`;
            document.getElementById('player-match-choices').innerHTML = `<button id="modal-ok-btn" class="w-full md:w-auto px-6 py-2 rounded-lg font-bold text-white bg-gray-600">Continuar</button>`;
        }, 1500);
    }
    
    // --- 11. PONTO DE ENTRADA E DELEGAÇÃO DE EVENTOS ---
    async function init() {
        document.body.addEventListener('click', async (e) => {
            const target = e.target;
            const targetId = target.id;
            const closest = (selector) => target.closest(selector);

            // Autenticação e Navegação
            if (targetId === 'login-btn') await handleLogin();
            if (targetId === 'signup-btn') await handleSignup();
            if (targetId === 'logout-btn') confirmLogout();
            if (targetId === 'back-to-menu-btn') showMainMenu();
            if (targetId === 'modal-cancel-btn') closeModal();
            if (targetId === 'modal-logout-btn') await handleLogout();
            if (targetId === 'modal-back-to-menu-btn') { closeModal(); showMainMenu(); }

            // Menu Principal
            if (targetId === 'start-online-mode') initPvpMode();
            if (targetId === 'start-manager-career') await loadOrCreateOnlineCareer('manager');
            if (targetId === 'start-player-career') await loadOrCreateOnlineCareer('player');
            if (targetId === 'start-community-hub') showToast('Em breve!', 'info');

            // Modo 1x1
            if (targetId === 'find-match-btn') await findOnlineMatch();
            if (targetId === 'cancel-search-btn') await cancelMatchmaking(true);
            const actionBtn = closest('.action-btn[data-action]');
            if (actionBtn) handlePlayerAction(actionBtn.dataset.action);
            if (targetId === 'leave-match-btn') { 
                if (!state.onlineMatch.isBotMatch) {
                   await supabaseClient.rpc('handle_match_result', { winner_id: state.onlineMatch.opponentId, loser_id: state.user.id });
                }
                showToast("Você desistiu da partida.", "error"); 
                await cancelMatchmaking(false); 
                showMainMenu(); 
            }

            // Carreira de Técnico
            const philosophyCard = closest('[data-philosophy]');
            if (philosophyCard) await setupManagerMode(philosophyCard.dataset.philosophy);
            const managerTab = closest('[data-tab^="manager-"]');
            if (managerTab) switchManagerTab(managerTab.dataset.tab);
            if (targetId === 'simulate-round-btn') await simulateRound();
            const buyBtn = closest('.buy-player-btn');
            if (buyBtn) {
                buyBtn.disabled = true;
                await buyPlayer(JSON.parse(buyBtn.dataset.playerInfo));
            }
            const sellBtn = closest('.sell-player-btn');
            if(sellBtn) {
                sellBtn.disabled = true;
                await sellPlayer(sellBtn.dataset.playerId);
            }

            // Carreira de Jogador
            if (targetId === 'finalize-player-creation-btn') await finalizePlayerCreation();
            const playerTab = closest('[data-tab^="player-"]');
            if (playerTab) switchPlayerTab(playerTab.dataset.tab);
            if (targetId === 'play-player-match-btn') playPlayerMatch();
            const playerActionBtn = closest('.player-action-btn');
            if(playerActionBtn) {
                await resolvePlayerAction(playerActionBtn.dataset.attr);
            }
            
            if (targetId === 'modal-ok-btn') {
                closeModal();
                if(state.player) renderPlayerContent('player-dashboard');
                if(state.manager) renderManagerContent('manager-office');
            }
        });

        document.body.addEventListener('change', (e) => {
            if (e.target.id === 'player-position-select') renderAttributeInputs();
        });

        supabaseClient.auth.onAuthStateChange(async (event, session) => {
             if (event === 'SIGNED_OUT') {
                Object.keys(state).forEach(key => state[key] = null);
                closeModal();
                renderAuthScreen();
             } else if (event === 'SIGNED_IN') {
                 const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', session.user.id).single();
                 if (profile) {
                    state.user = session.user;
                    state.profile = profile;
                    renderMainMenu();
                 } else {
                    console.error("Utilizador autenticado mas sem perfil. A terminar sessão.");
                    await handleLogout();
                 }
             }
        });

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', session.user.id).single();
            if (profile) {
                state.user = session.user;
                state.profile = profile;
                renderMainMenu();
            } else {
                console.error("Utilizador autenticado mas sem perfil. A terminar sessão.");
                await handleLogout();
            }
        } else {
            renderAuthScreen();
        }
    }

    return { init };
})();

Game.init();
