const Game = (() => {
    // --- 1. ESTADO GLOBAL E CONFIGURAÇÕES ---
    let state = {
        user: null, profile: null, manager: null, player: null, onlineMatch: null, realtimeChannel: null,
    };
    let matchmakingTimer = null;

    // DADOS ATUALIZADOS COM O NOVO PROJETO FUNCIONAL
    const SUPABASE_URL = 'https://dxuucjpbkvwxoontvzly.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dXVjanBia3Z3eG9vbnR2emx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2Mjg2OTMsImV4cCI6MjA2NzIwNDY5M30.gNKi6gS3pG_tfNJAcpop_H1P9b7unLhUdkh_NJqu1fk';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const ICONS = {
        office: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>`,
        squad: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`,
        transfers: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>`,
        finances: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1m-4 0h-4v-1h4m0-4h.01M12 4h4v1h-4V4zM4 4h4v1H4V4z" /></svg>`,
        dashboard: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>`,
        profile: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`,
        leaderboard: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>`
    };

    const CONSTANTS = {
        RANKS: [
            { name: 'Bronze III', starsToPromote: 3, color: '#a97142' }, { name: 'Bronze II',  starsToPromote: 3, color: '#a97142' }, { name: 'Bronze I',   starsToPromote: 3, color: '#a97142' },
            { name: 'Prata III',  starsToPromote: 3, color: '#a8a8a8' }, { name: 'Prata II',   starsToPromote: 3, color: '#a8a8a8' }, { name: 'Prata I',    starsToPromote: 3, color: '#a8a8a8' },
            { name: 'Ouro III',   starsToPromote: 3, color: '#f5d742' }, { name: 'Ouro II',    starsToPromote: 3, color: '#f5d742' }, { name: 'Ouro I',     starsToPromote: 3, color: '#f5d742' },
            { name: 'Platina III', starsToPromote: 3, color: '#4E9C81' }, { name: 'Platina II',  starsToPromote: 3, color: '#4E9C81' }, { name: 'Platina I',   starsToPromote: 3, color: '#4E9C81' },
            { name: 'Diamante III', starsToPromote: 3, color: '#4d82d1' }, { name: 'Diamante II',  starsToPromote: 3, color: '#4d82d1' }, { name: 'Diamante I',   starsToPromote: 3, color: '#4d82d1' },
            { name: 'Lendário I',   starsToPromote: 3, color: '#8a2be2' }, { name: 'Lendário II',  starsToPromote: 3, color: '#8a2be2' }, { name: 'Lendário III', starsToPromote: 3, color: '#8a2be2' },
            { name: 'Global',       starsToPromote: 0, color: '#ff4500' }
        ],
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
        let buttonsHTML = buttons.map(btn => {
            let baseClass = 'btn-action';
            if (btn.class.includes('primary')) baseClass += ' btn-primary';
            if (btn.class.includes('danger')) baseClass += ' btn-danger';
            return `<button id="${btn.id}" class="${baseClass}">${btn.text}</button>`
        }).join('');
        modalContent.innerHTML = `
            <h2 class="text-3xl font-bold mb-4">${title}</h2>
            <div class="text-slate-dark mb-6 whitespace-pre-wrap">${message}</div>
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
                <div class="auth-panel p-8 rounded-lg text-center shadow-2xl w-full max-w-md">
                    <h1 class="text-5xl font-black text-white mb-6">SevenxFoot</h1>
                    <div id="auth-form" class="space-y-4">
                        <p class="text-slate-light pb-2">A forma mais fácil e segura de jogar.</p>
                        <button id="google-login-btn" class="w-full btn-action btn-primary flex items-center justify-center gap-3">
                            <svg class="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.37,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                            <span>Entrar com o Google</span>
                        </button>
                    </div>
                    <div id="auth-loading" class="hidden"><div class="loader mx-auto"></div></div>
                    <p id="auth-error" class="text-red-400 mt-4 h-6"></p>
                </div>
            </div>`;
    }

    function renderMainMenu() {
        const welcomeMessage = `Bem-vindo, ${state.profile.full_name || 'Jogador'}!`;
        const rankDisplayHTML = `<div id="player-rank-display" class="mb-8 panel p-4"></div>`;
        
        root.innerHTML = `
            <div id="main-menu" class="main-menu-bg">
                <div class="auth-panel p-10 rounded-lg text-center shadow-2xl w-full max-w-xl">
                    <h1 class="text-5xl md:text-7xl font-black text-white mb-2">SevenxFoot</h1>
                    <p style="color: var(--accent-green);" class="font-semibold text-lg mb-4">${welcomeMessage}</p>
                    ${rankDisplayHTML}
                    <div class="space-y-4">
                        <button id="start-online-mode" class="w-full md:w-96 btn-action btn-primary">Partida Rápida 1x1</button>
                        <button id="start-manager-career" class="w-full md:w-96 btn-action btn-primary">Carreira de Técnico</button>
                        <button id="start-player-career" class="w-full md:w-96 btn-action btn-primary">Carreira de Jogador</button>
                        <button id="start-community-hub" class="w-full md:w-96 btn-action btn-primary">Centro da Comunidade</button>
                    </div>
                    <button id="logout-btn" class="mt-8 text-slate-dark hover:text-white transition-colors">Sair</button>
                </div>
            </div>`;
        
        updatePvpRankDisplay();
    }
    
    // --- 5. LÓGICA DE RANKING E CARREIRA ---
    async function updatePvpRankDisplay() {
        if (!state.profile) return;
        const display = document.getElementById('player-rank-display');
        if (!display) return;
        
        showLoading(display);
        const { data, error } = await supabaseClient.from('profiles').select('rank_id, rank_stars').eq('id', state.user.id).single();
        if(error) { console.error("Erro ao buscar rank 1x1:", error); display.innerHTML = 'Erro ao carregar rank.'; return; }

        state.profile.rank_id = data.rank_id;
        state.profile.rank_stars = data.rank_stars;

        const currentRank = CONSTANTS.RANKS[data.rank_id];
        display.innerHTML = `
            <h4 class="text-sm font-semibold text-slate-dark uppercase tracking-widest">Rank 1x1</h4>
            <div class="text-3xl font-extrabold" style="color: ${currentRank.color};">${currentRank.name}</div>
            <div class="rank-star mt-2">${'★'.repeat(data.rank_stars)}${'☆'.repeat(currentRank.starsToPromote > 0 ? Math.max(0, currentRank.starsToPromote - data.rank_stars) : 0)}</div>
        `;
    }
    
    function renderCareerRank(mode) {
        const career = state[mode];
        const displayElement = document.getElementById(`${mode}-rank-display`);
        if (!career || !displayElement) return;

        const currentRank = CONSTANTS.RANKS[career.rank_id];
        const rankTitle = mode === 'manager' ? 'Patente de Técnico' : 'Patente do Jogador';

        displayElement.innerHTML = `
            <h4 class="text-sm font-semibold text-slate-dark uppercase tracking-widest">${rankTitle}</h4>
            <div class="text-2xl font-extrabold mt-1" style="color: ${currentRank.color};">${currentRank.name}</div>
            <div class="rank-star mt-2">${'★'.repeat(career.rank_stars)}${'☆'.repeat(currentRank.starsToPromote > 0 ? Math.max(0, currentRank.starsToPromote - career.rank_stars) : 0)}</div>
        `;
    }

    async function handleCareerMatchResult(mode, result) {
        if (!state.profile) return;
        const career = state[mode];
        if (!career) return;

        const currentRank = CONSTANTS.RANKS[career.rank_id];
        const maxRank = CONSTANTS.RANKS.length - 1;

        if (result === 'win') {
            if (career.rank_id === maxRank) {
                showToast("Você já está no rank máximo!", "info");
                return;
            }

            career.rank_stars++;
            showToast("+1 Estrela!", "success");

            if (career.rank_stars >= currentRank.starsToPromote) {
                career.rank_id++;
                career.rank_stars = 0;
                const newRank = CONSTANTS.RANKS[career.rank_id];
                showModal("PROMOÇÃO!", `Você subiu para a patente ${newRank.name}!`, [{id: 'modal-ok-btn', text: 'Excelente!', class: 'primary'}]);
            }
        } else if (result === 'loss') {
            if (career.rank_stars > 0) {
                career.rank_stars--;
                showToast("-1 Estrela.", "error");
            } else { 
                if (career.rank_id > 0) {
                    career.rank_id--;
                    const previousRank = CONSTANTS.RANKS[career.rank_id];
                    career.rank_stars = previousRank.starsToPromote - 1;
                    showModal("REBAIXAMENTO", `Você caiu para a patente ${previousRank.name}.`, [{id: 'modal-ok-btn', text: 'Continuar', class: 'danger'}]);
                } else {
                    showToast("Você não pode perder mais estrelas neste rank.", "info");
                }
            }
        }
        
        await saveCareer(mode);
    }
    
    async function saveCareer(mode) {
        if (!state.profile) return;
        const career = state[mode];
        if (!career) return;
        
        const tableName = `online_${mode}_careers`;
        const { error } = await supabaseClient.from(tableName)
            .update({
                game_state: career.game_state,
                rank_id: career.rank_id,
                rank_stars: career.rank_stars
            })
            .eq('user_id', state.user.id);
    
        if (error) {
            console.error(`Erro ao salvar carreira de ${mode}:`, error);
            showToast("Erro ao salvar progresso.", "error");
        }
    }

    async function handleGoogleLogin() {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) {
            const authError = document.getElementById('auth-error');
            if(authError) authError.textContent = "Erro ao tentar fazer login com o Google.";
            console.error('Google Sign-In Error:', error);
        }
    }
    
    function confirmLogout() {
        showModal('Confirmar Saída', 'Você tem certeza que deseja sair?', [
            { id: 'modal-cancel-btn', text: 'Cancelar', class: '' },
            { id: 'modal-logout-btn', text: 'Sair', class: 'danger' }
        ]);
    }

    async function handleLogout() {
        if (state.realtimeChannel) { await supabaseClient.removeChannel(state.realtimeChannel); }
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error("Erro ao fazer logout:", error);
        }
    }

    function showMainMenu() {
        if (state.realtimeChannel) { cancelMatchmaking(false); }
        state.onlineMatch = null;
        renderMainMenu();
    }
    
    function initPvpMode() {
        const content = `
            <div id="online-mode">
                <header class="panel p-4 text-center"><h2 class="text-3xl font-bold">Partida Rápida 1x1</h2></header>
                <div class="p-4 md:p-8 max-w-lg mx-auto text-center">
                    <div id="lobby-rank-display" class="mb-6 panel p-4"></div>
                    <div class="panel p-8">
                        <p id="pvp-status-text" class="text-2xl font-semibold text-slate-light mb-6">Pronto para encontrar um oponente?</p>
                        <div id="pvp-loader" class="loader mx-auto hidden mb-4"></div>
                        <button id="find-match-btn" class="w-full btn-action btn-primary">Procurar Partida</button>
                        <button id="cancel-search-btn" class="w-full mt-2 btn-action btn-danger hidden">Cancelar Busca</button>
                    </div>
                    <button id="back-to-menu-btn" class="w-full mt-8 btn-action">Voltar ao Menu Principal</button>
                </div>
            </div>`;
        renderGameContainer(content);
        
        const lobbyRankDisplay = document.getElementById('lobby-rank-display');
        if (state.profile) {
            const currentRankHTML = document.getElementById('player-rank-display').innerHTML;
            lobbyRankDisplay.innerHTML = currentRankHTML;
        }
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
        const pvpStatus = document.getElementById('pvp-status-text');
        const pvpLoader = document.getElementById('pvp-loader');
        const findBtn = document.getElementById('find-match-btn');
        const cancelBtn = document.getElementById('cancel-search-btn');
        if (pvpStatus) pvpStatus.textContent = text;
        if (pvpLoader) pvpLoader.classList.toggle('hidden', !isSearching);
        if (findBtn) findBtn.classList.toggle('hidden', isSearching);
        if (cancelBtn) cancelBtn.classList.toggle('hidden', !isSearching);
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
                        {id: 'modal-accept-rematch', text: 'Aceitar', class: 'primary'},
                        {id: 'modal-decline-rematch', text: 'Recusar', class: 'danger'}
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
        const { data: opponentProfile } = await supabaseClient.from('profiles').select('full_name').eq('id', opponentId).single();
        
        state.onlineMatch = {
            ...match,
            isBotMatch: false,
            myScore: 0,
            opponentScore: 0,
            myAction: null,
            opponentAction: null,
            opponentName: opponentProfile ? opponentProfile.full_name : 'Oponente',
            opponentId: opponentId
        };
        
        if (!isRematch) setupRealtimeForMatch(match.id);
        setupMatchUI();
    }

    function setupMatchUI() {
        const myName = state.profile ? state.profile.full_name : 'Jogador';
        const opponentName = state.onlineMatch.opponentName;

        const content = `
            <div id="match-screen" class="p-4 md:p-8 max-w-4xl mx-auto">
                <div class="grid grid-cols-3 items-center text-center mb-4">
                    <div id="my-player-name" class="text-xl font-bold" style="color: #64b5f6;">${myName}</div>
                    <div id="score" class="text-4xl font-extrabold">${state.onlineMatch.myScore} x ${state.onlineMatch.opponentScore}</div>
                    <div id="opponent-player-name" class="text-xl font-bold" style="color: #e57373;">${opponentName}</div>
                </div>
                <div id="match-commentary" class="panel p-4 mb-6 overflow-y-auto text-slate-dark h-32">
                    <p>A partida começou! Escolha sua ação.</p>
                </div>
                <div id="action-panel" class="grid grid-cols-3 gap-4">
                    <button data-action="attack" class="action-btn p-6 text-xl font-bold" style="border-color: #e57373; color: #e57373;">Ataque</button>
                    <button data-action="defend" class="action-btn p-6 text-xl font-bold" style="border-color: #64b5f6; color: #64b5f6;">Defesa</button>
                    <button data-action="counter" class="action-btn p-6 text-xl font-bold" style="border-color: #81c784; color: #81c784;">Contra-Ataque</button>
                </div>
                <div id="waiting-panel" class="hidden text-center p-6 panel">
                    <p class="text-xl">Aguardando oponente...</p>
                    <div class="loader mx-auto mt-4"></div>
                </div>
                <button id="leave-match-btn" class="w-full mt-8 btn-action btn-danger">Desistir da Partida</button>
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
        
        if (!state.onlineMatch.isBotMatch && state.profile) {
            const winner = iWon ? state.user.id : state.onlineMatch.opponentId;
            const loser = iWon ? state.onlineMatch.opponentId : state.user.id;
            await supabaseClient.rpc('handle_match_result', { winner_id: winner, loser_id: loser });
            showModal(title, message, [
                {id: 'modal-rematch-btn', text: 'Revanche', class: 'primary'},
                {id: 'modal-back-to-menu-btn', text: 'Voltar ao Menu', class: ''}
            ]);
            document.getElementById('modal-rematch-btn').onclick = async () => {
                showModal('Aguarde', 'Enviando pedido de revanche...', []);
                await state.realtimeChannel.send({type: 'broadcast', event: 'rematch_request', payload: {sender_id: state.user.id}});
            };
        } else {
            showToast('Partida finalizada.', 'info');
            showModal(title, message, [{id: 'modal-back-to-menu-btn', text: 'Voltar ao Menu', class: ''}]);
        }
    }

    // --- 8. MODOS DE CARREIRA ---
    async function loadOrCreateOnlineCareer(careerType) {
        if (!state.profile) {
            showModal('Função Bloqueada', 'Para salvar seu progresso na carreira, por favor, crie uma conta gratuita.', [
                { id: 'modal-ok-btn', text: 'Entendido', class: 'primary' }
            ]);
            return;
        }
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
            const randomFactor = (Math.random() - 0.5) * 4;
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
                <header class="panel p-4 text-center"><h2 class="text-3xl font-bold">Defina a Filosofia do Clube</h2></header>
                <div class="p-4 md:p-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="card p-6 text-center cursor-pointer" data-philosophy="cantera">
                        <h3 class="text-2xl font-bold mb-2">Cantera</h3><p class="text-slate-dark mb-4">Foco na base. Orçamento menor, academia de elite. Paciência da diretoria com resultados.</p>
                    </div>
                    <div class="card p-6 text-center cursor-pointer" data-philosophy="galactic">
                        <h3 class="text-2xl font-bold mb-2">Galácticos</h3><p class="text-slate-dark mb-4">Orçamento gigante para contratar estrelas. A pressão por títulos é imediata.</p>
                    </div>
                    <div class="card p-6 text-center cursor-pointer" data-philosophy="moneyball">
                        <h3 class="text-2xl font-bold mb-2">Moneyball</h3><p class="text-slate-dark mb-4">Gestão inteligente. Foco em contratar jogadores subvalorizados e vender caro.</p>
                    </div>
                </div>
                <button id="back-to-menu-btn" class="w-full max-w-xs mx-auto mt-8 btn-action">Voltar</button>
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
            rank_id: 0, 
            rank_stars: 0
        }).select().single();

        if (error) { showToast('Erro ao criar carreira.', 'error'); closeModal(); return; }

        state.manager = data;
        closeModal();
        initManagerHub();
    }

    function initManagerHub() {
        const content = `
            <div id="manager-hub" class="max-w-6xl mx-auto p-4">
                <header class="panel p-4 flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Central do Técnico</h2>
                    <button id="back-to-menu-btn" class="btn-action">Menu Principal</button>
                </header>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="md:col-span-1 panel p-4">
                        <div id="manager-rank-display" class="mb-6"></div>
                        <nav class="flex flex-col space-y-2">
                             <button data-tab="manager-office" class="nav-item active">${ICONS.office} Escritório</button>
                             <button data-tab="manager-squad" class="nav-item">${ICONS.squad} Elenco</button>
                             <button data-tab="manager-transfers" class="nav-item">${ICONS.transfers} Transferências</button>
                             <button data-tab="manager-finances" class="nav-item">${ICONS.finances} Finanças</button>
                        </nav>
                    </div>
                    <main id="manager-content-area" class="md:col-span-3 panel p-6"></main>
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
                    <p class="text-lg mb-2 text-slate-dark">Temporada: ${gs.season}</p>
                    <p class="text-lg mb-6 text-slate-dark">Campanha: ${gs.wins}V - ${gs.draws}E - ${gs.losses}D</p>
                    <div class="panel p-6" style="background-color: var(--bg-dark-navy);">
                        <h4 class="text-2xl font-semibold mb-4">Próxima Partida</h4>
                        <p class="text-xl mb-1">Adversário: <span class="font-bold text-white">${nextOpponent.nome}</span></p>
                        <p class="mb-4 text-slate-dark">Força do Adversário: ${nextOpponent.forca}</p>
                        <div class="mb-4">
                            <label for="tactic-select" class="block mb-2 text-slate-dark">Tática para a partida:</label>
                            <select id="tactic-select" class="w-full">
                                <option value="Equilibrada" ${gs.tactic === 'Equilibrada' ? 'selected' : ''}>Equilibrada (Padrão)</option>
                                <option value="Ofensiva" ${gs.tactic === 'Ofensiva' ? 'selected' : ''}>Ofensiva (+5 Força, Risco Maior)</option>
                                <option value="Defensiva" ${gs.tactic === 'Defensiva' ? 'selected' : ''}>Defensiva (-5 Força, Risco Menor)</option>
                            </select>
                        </div>
                        <button id="simulate-round-btn" class="w-full btn-action btn-primary">Jogar Partida</button>
                    </div>
                `;
                break;

            case 'manager-squad':
                const squadHTML = gs.squad.map(p => `
                    <div class="grid grid-cols-5 gap-2 items-center panel p-3" style="background-color: var(--bg-dark-navy);">
                        <span class="col-span-2">${p.name}</span>
                        <span>${p.position}</span>
                        <span class="font-bold text-lg" style="color: var(--accent-green);">${p.overall}</span>
                        <button class="sell-player-btn btn-action btn-danger text-xs py-1 px-2" data-player-id="${p.id}">Vender ($${(p.value / 2).toLocaleString()})</button>
                    </div>`).join('');
                content = `
                    <h3 class="text-3xl font-bold mb-4">Gerenciamento do Elenco</h3>
                    <p class="mb-4">Força do Time (11 Titulares): <span class="font-bold text-2xl" style="color: var(--accent-green);">${teamStrength}</span></p>
                    <div class="space-y-2">${squadHTML}</div>
                `;
                break;
            
            case 'manager-transfers':
                let marketPlayers = "";
                for(let i=0; i < 5; i++) {
                    const pos = ["GOL", "DEF", "MEI", "ATA"][Math.floor(Math.random()*4)];
                    const player = generatePlayer(pos, teamStrength - 10, teamStrength + 10);
                    marketPlayers += `
                        <div class="grid grid-cols-5 gap-2 items-center panel p-3" style="background-color: var(--bg-dark-navy);">
                            <span class="col-span-2">${player.name}</span>
                            <span>${player.position}</span>
                            <span class="font-bold text-lg" style="color: var(--accent-green);">${player.overall}</span>
                            <button class="buy-player-btn btn-action btn-primary text-xs py-1 px-2" data-player-info='${JSON.stringify(player)}'>Comprar ($${player.value.toLocaleString()})</button>
                        </div>`;
                }
                content = `
                    <h3 class="text-3xl font-bold mb-4">Mercado de Transferências</h3>
                    <p class="mb-4">Orçamento Disponível: <span class="font-bold" style="color: var(--accent-green);">$${gs.budget.toLocaleString()}</span></p>
                    <h4 class="text-xl font-semibold mb-2">Jogadores disponíveis:</h4>
                    <div class="space-y-2">${marketPlayers}</div>
                    <p class="text-xs text-slate-dark mt-4">O mercado é atualizado a cada visita.</p>
                `;
                break;

            case 'manager-finances':
                content = `
                    <h3 class="text-3xl font-bold mb-4">Finanças do Clube</h3>
                    <p>Orçamento para Transferências:</p>
                    <p class="font-bold text-3xl" style="color: var(--accent-green);">$${gs.budget.toLocaleString()}</p>
                    <p class="text-slate-dark mt-4"> (Funcionalidade de transferências em breve) </p>
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
        let result = '';
        
        if (roll < winChance) {
            gs.wins++;
            result = 'win';
            resultText = `VITÓRIA! Vencemos o ${nextOpponent.nome}.`;
        } else if (roll < winChance + 0.15) {
            gs.draws++;
            result = 'draw';
            resultText = `EMPATE. Jogo duro contra o ${nextOpponent.nome}.`;
        } else {
            gs.losses++;
            result = 'loss';
            resultText = `DERROTA. Não foi possível superar o ${nextOpponent.nome}.`;
        }

        await handleCareerMatchResult('manager', result);
        
        setTimeout(() => {
            closeModal();
            showModal('Resultado da Partida', resultText, [{id: 'modal-ok-btn', text: 'Continuar', class: 'primary'}]);
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
                <header class="panel p-4 text-center"><h2 class="text-3xl font-bold">Crie seu Craque</h2></header>
                <div class="p-4 md:p-8 max-w-2xl mx-auto">
                    <div class="mb-4">
                        <label for="player-name-input" class="block mb-2">Nome:</label>
                        <input type="text" id="player-name-input" class="w-full" placeholder="Ex: Léo da Silva">
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Posição:</label>
                        <select id="player-position-select" class="w-full">
                            <option value="ATA">Atacante</option><option value="MEI">Meio-campista</option><option value="DEF">Defensor</option><option value="GOL">Goleiro</option>
                        </select>
                    </div>
                    <div class="mb-6">
                        <h3 class="font-semibold mb-2">Atributos Iniciais:</h3>
                        <div id="attribute-inputs" class="space-y-2 mt-2 panel p-4"></div>
                    </div>
                    <button id="finalize-player-creation-btn" class="w-full btn-action btn-primary">Iniciar Carreira</button>
                    <button id="back-to-menu-btn" class="w-full mt-2 btn-action">Voltar</button>
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
                <span class="font-bold" style="color: var(--accent-green);">${value}</span>
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
            rank_stars: 0
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
            <div id="player-hub" class="max-w-6xl mx-auto p-4">
                <header class="panel p-4 flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Central do Jogador</h2>
                    <button id="back-to-menu-btn" class="btn-action">Menu Principal</button>
                </header>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="md:col-span-1 panel p-4">
                        <div id="player-rank-display" class="mb-6"></div>
                        <nav class="flex flex-col space-y-2">
                             <button data-tab="player-dashboard" class="nav-item active">${ICONS.dashboard} Visão Geral</button>
                             <button data-tab="player-profile" class="nav-item">${ICONS.profile} Perfil & Atributos</button>
                        </nav>
                    </div>
                    <main id="player-content-area" class="md:col-span-3 panel p-6"></main>
                </div>
            </div>`;
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
                        <div class="panel p-4" style="background-color: var(--bg-dark-navy);"><strong>Clube Atual:</strong><br> ${gs.club}</div>
                        <div class="panel p-4" style="background-color: var(--bg-dark-navy);"><strong>Reputação:</strong><br> ${gs.reputation}</div>
                        <div class="panel p-4" style="background-color: var(--bg-dark-navy);"><strong>Salário Semanal:</strong><br> $${gs.salary.toLocaleString()}</div>
                        <div class="panel p-4" style="background-color: var(--bg-dark-navy);"><strong>Dinheiro:</strong><br> $${gs.cash.toLocaleString()}</div>
                    </div>
                    <div class="panel p-6 text-center" style="background-color: var(--bg-dark-navy);">
                        <h4 class="text-xl font-semibold mb-2">Próxima Oportunidade</h4>
                        <p class="text-slate-dark mb-4">Jogue a próxima partida para ganhar reputação, seu salário e estrelas para sua patente.</p>
                        <button id="play-player-match-btn" class="w-full btn-action btn-primary">Jogar Partida</button>
                    </div>
                `;
                break;
            case 'player-profile':
                gs.overall = Math.round(Object.values(gs.attributes).reduce((a, b) => a + b, 0) / Object.values(gs.attributes).length * 10);
                const attributesHTML = Object.entries(gs.attributes).map(([attr, val]) => `
                    <div class="panel p-3 flex justify-between" style="background-color: var(--bg-dark-navy);"><span>${attr}</span> <strong style="color: var(--accent-green);">${val}</strong></div>
                `).join('');
                content = `
                    <h3 class="text-3xl font-bold mb-4">${gs.name}</h3>
                    <p class="text-xl mb-1 text-slate-dark">Posição: ${gs.position}</p>
                    <p class="text-xl mb-6">Overall: <span class="font-bold text-3xl" style="color: #ffca28;">${gs.overall}</span></p>
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
        
        const buttonsHTML = choices.map(c => `<button class="player-action-btn btn-action btn-primary w-full md:w-auto" data-attr="${c.attr}">${c.text}</button>`).join('');

        modalContent.innerHTML = `
            <h2 class="text-3xl font-bold mb-4">Momento Decisivo!</h2>
            <div id="player-match-commentary" class="text-slate-dark mb-6 whitespace-pre-wrap">${commentary.join("<br>")}</div>
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

        let repGained, resultText, result;

        if(roll < successChance) {
            result = 'win';
            repGained = 2;
            resultText = "BOA ESCOLHA! Você executa a ação com perfeição e ajuda o time.";
            showToast("Sucesso!", "success");
        } else {
            result = 'loss';
            repGained = -1;
            resultText = "NÃO DEU! A jogada não sai como esperado, mas vale a tentativa.";
            showToast("Falha.", "error");
        }

        gs.reputation = Math.max(0, gs.reputation + repGained);
        gs.cash += gs.salary;
        gs.gamesPlayed++;
        
        await handleCareerMatchResult('player', result);

        setTimeout(() => {
            commentaryEl.innerHTML += `<br><br>${resultText}<br>${repGained > 0 ? `+${repGained}` : repGained} Rep, +$${gs.salary.toLocaleString()} Salário`;
            document.getElementById('player-match-choices').innerHTML = `<button id="modal-ok-btn" class="btn-action">Continuar</button>`;
        }, 1500);
    }
    
    // --- 11. CENTRO DA COMUNIDADE ---
    async function initCommunityHub() {
        if (!state.profile) {
            showModal('Função Bloqueada', 'Para ver o ranking global e participar da comunidade, por favor, crie uma conta gratuita.', [
                { id: 'modal-ok-btn', text: 'Entendido', class: 'primary' }
            ]);
            return;
        }
        const content = `
            <div id="community-hub" class="max-w-6xl mx-auto p-4">
                <header class="panel p-4 flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Centro da Comunidade</h2>
                    <button id="back-to-menu-btn" class="btn-action">Menu Principal</button>
                </header>
                <div id="leaderboard-container" class="panel p-6">
                    <div class="flex items-center gap-4 mb-4">
                        ${ICONS.leaderboard}
                        <h3 class="text-3xl font-bold">Ranking Global 1x1</h3>
                    </div>
                    <div id="leaderboard-content">
                        <div class="loader mx-auto"></div>
                    </div>
                </div>
            </div>
        `;
        renderGameContainer(content);
        renderLeaderboard();
    }

    async function renderLeaderboard() {
        const container = document.getElementById('leaderboard-content');
        if (!container) return;

        const { data, error } = await supabaseClient
            .from('profiles')
            .select('full_name, rank_id, rank_stars')
            .order('rank_id', { ascending: false })
            .order('rank_stars', { ascending: false })
            .limit(20);

        if (error) {
            console.error("Erro ao buscar ranking:", error);
            container.innerHTML = `<p class="text-red-400">Não foi possível carregar o ranking.</p>`;
            return;
        }

        if (data.length === 0) {
            container.innerHTML = `<p class="text-slate-dark">Nenhum jogador classificado ainda. Seja o primeiro!</p>`;
            return;
        }

        const leaderboardHTML = data.map((profile, index) => {
            const rank = CONSTANTS.RANKS[profile.rank_id];
            const playerName = profile.full_name;
            return `
                <div class="grid grid-cols-12 gap-4 items-center p-3 rounded-md ${index % 2 === 0 ? 'bg-navy-darker' : ''}" style="background-color: var(--bg-dark-navy);">
                    <span class="col-span-1 text-xl font-bold text-slate-dark">#${index + 1}</span>
                    <span class="col-span-6 font-semibold">${playerName}</span>
                    <div class="col-span-5 flex items-center justify-end gap-2">
                        <span class="font-bold" style="color: ${rank.color};">${rank.name}</span>
                        <span class="rank-star text-sm">${'★'.repeat(profile.rank_stars)}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `<div class="space-y-2">${leaderboardHTML}</div>`;
    }


    // --- 12. PONTO DE ENTRADA E DELEGAÇÃO DE EVENTOS ---
    async function init() {
        document.body.addEventListener('click', async (e) => {
            const target = e.target;
            const targetId = target.id;
            const closest = (selector) => target.closest(selector);

            // Delegação de eventos simplificada
            if (targetId === 'google-login-btn' || closest('#google-login-btn')) await handleGoogleLogin();
            if (targetId === 'logout-btn') confirmLogout();
            if (targetId === 'back-to-menu-btn') showMainMenu();
            if (targetId === 'modal-cancel-btn') closeModal();
            if (targetId === 'modal-logout-btn') await handleLogout();
            if (targetId === 'modal-back-to-menu-btn') { closeModal(); showMainMenu(); }

            // Menu Principal
            if (targetId === 'start-online-mode') initPvpMode();
            if (targetId === 'start-manager-career') await loadOrCreateOnlineCareer('manager');
            if (targetId === 'start-player-career') await loadOrCreateOnlineCareer('player');
            if (targetId === 'start-community-hub') initCommunityHub();

            // Modo 1x1
            if (targetId === 'find-match-btn') await findOnlineMatch();
            if (targetId === 'cancel-search-btn') await cancelMatchmaking(true);
            const actionBtn = closest('.action-btn[data-action]');
            if (actionBtn) handlePlayerAction(actionBtn.dataset.action);
            if (targetId === 'leave-match-btn') { 
                if (!state.onlineMatch.isBotMatch && state.profile) {
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
                if(state.player) {
                    renderPlayerContent('player-dashboard');
                    renderCareerRank('player');
                }
                if(state.manager) {
                     renderManagerContent('manager-office');
                     renderCareerRank('manager');
                }
            }
        });

        document.body.addEventListener('change', (e) => {
            if (e.target.id === 'player-position-select') renderAttributeInputs();
        });

        // Lógica de autenticação centralizada e inteligente
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                Object.keys(state).forEach(key => state[key] = null);
                closeModal();
                renderAuthScreen();
            } else if (event === 'SIGNED_IN') {
                if (session && session.user) {
                    // 1. Tenta carregar o perfil do jogador
                    const { data: profile } = await supabaseClient
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        // Perfil já existe, entra no jogo
                        state.user = session.user;
                        state.profile = profile;
                        renderMainMenu();
                    } else {
                        // Perfil não existe (primeiro login), então cria um
                        const { data: newProfile, error: insertError } = await supabaseClient
                            .from('profiles')
                            .insert({
                                id: session.user.id,
                                email: session.user.email,
                                full_name: session.user.user_metadata.full_name,
                                avatar_url: session.user.user_metadata.avatar_url,
                            })
                            .select()
                            .single();
                        
                        if (insertError) {
                            console.error("Erro ao criar perfil:", insertError);
                            await handleLogout();
                        } else {
                            state.user = session.user;
                            state.profile = newProfile;
                            renderMainMenu();
                        }
                    }
                }
            }
        });

        // Verificação inicial da sessão ao carregar a página
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            renderAuthScreen();
        }
    }

    return { init };
})();

Game.init();
