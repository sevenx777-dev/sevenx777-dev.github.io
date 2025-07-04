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
                        <button id="google-login-btn" class="w-full btn-action btn-primary flex items-center justify-center gap-3">
                            <svg class="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.37,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                            <span>Entrar com o Google</span>
                        </button>
                        <div class="relative flex py-2 items-center">
                            <div class="flex-grow border-t border-gray-600"></div>
                            <span class="flex-shrink mx-4 text-slate-dark">ou</span>
                            <div class="flex-grow border-t border-gray-600"></div>
                        </div>
                        <button id="guest-login-btn" class="w-full btn-action">Entrar como Convidado</button>
                    </div>
                    <div id="auth-loading" class="hidden"><div class="loader mx-auto"></div></div>
                    <p id="auth-error" class="text-red-400 mt-4 h-6"></p>
                </div>
            </div>`;
    }

    function renderMainMenu() {
        const isGuest = !state.profile;
        const welcomeMessage = isGuest ? `Bem-vindo, Convidado!` : `Bem-vindo, ${state.profile.full_name || state.profile.username || 'Jogador'}!`;
        const rankDisplayHTML = isGuest 
            ? `<div class="panel p-4 text-slate-dark">Para jogar, por favor, faça login com o Google.</div>`
            : `<div id="player-rank-display" class="mb-8 panel p-4"></div>`;
        
        const careerButtonsDisabled = isGuest ? 'disabled' : '';
        const communityButtonDisabled = isGuest ? 'disabled' : '';

        root.innerHTML = `
            <div id="main-menu" class="main-menu-bg">
                <div class="auth-panel p-10 rounded-lg text-center shadow-2xl w-full max-w-xl">
                    <h1 class="text-5xl md:text-7xl font-black text-white mb-2">SevenxFoot</h1>
                    <p style="color: var(--accent-green);" class="font-semibold text-lg mb-4">${welcomeMessage}</p>
                    ${rankDisplayHTML}
                    <div class="space-y-4">
                        <button id="start-online-mode" class="w-full md:w-96 btn-action btn-primary" ${careerButtonsDisabled}>Partida Rápida 1x1</button>
                        <button id="start-manager-career" class="w-full md:w-96 btn-action btn-primary" ${careerButtonsDisabled}>Carreira de Técnico</button>
                        <button id="start-player-career" class="w-full md:w-96 btn-action btn-primary" ${careerButtonsDisabled}>Carreira de Jogador</button>
                        <button id="start-community-hub" class="w-full md:w-96 btn-action btn-primary" ${communityButtonDisabled}>Centro da Comunidade</button>
                    </div>
                    <button id="logout-btn" class="mt-8 text-slate-dark hover:text-white transition-colors">Sair</button>
                </div>
            </div>`;
        
        if (!isGuest) {
            updatePvpRankDisplay();
        }
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

    // --- 6. AUTENTICAÇÃO E NAVEGAÇÃO ---
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

    async function handleGuestLogin() {
        const authForm = document.getElementById('auth-form');
        const authLoading = document.getElementById('auth-loading');
        const authError = document.getElementById('auth-error');

        authForm.classList.add('hidden');
        authLoading.classList.remove('hidden');
        authError.textContent = '';

        const { data, error } = await supabaseClient.auth.signInAnonymously();

        if (error) {
            authError.textContent = 'Não foi possível entrar como convidado.';
            authForm.classList.remove('hidden');
            authLoading.classList.add('hidden');
        } else if (data.user) {
            state.user = data.user;
            state.profile = null;
            renderMainMenu();
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
    // ... (O resto do código permanece igual)

    // --- 12. PONTO DE ENTRADA E DELEGAÇÃO DE EVENTOS ---
    async function init() {
        document.body.addEventListener('click', async (e) => {
            const target = e.target;
            const targetId = target.id;
            const closest = (selector) => target.closest(selector);

            // MODIFICADO: Delegação de eventos para o novo fluxo de login
            if (targetId === 'google-login-btn' || closest('#google-login-btn')) await handleGoogleLogin();
            if (targetId === 'guest-login-btn') await handleGuestLogin();
            if (targetId === 'logout-btn') confirmLogout();
            if (targetId === 'back-to-menu-btn') showMainMenu();
            if (targetId === 'modal-cancel-btn') closeModal();
            if (targetId === 'modal-logout-btn') await handleLogout();
            if (targetId === 'modal-back-to-menu-btn') { closeModal(); showMainMenu(); }

            // ... (O resto da delegação de eventos permanece igual)
        });

        // MODIFICADO: Nova lógica de onAuthStateChange
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                Object.keys(state).forEach(key => state[key] = null);
                closeModal();
                renderAuthScreen();
            } else if (event === 'SIGNED_IN') {
                if (session && session.user) {
                    if (session.user.is_anonymous) {
                        state.user = session.user;
                        state.profile = null;
                        renderMainMenu();
                        return;
                    }

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
                                username: session.user.email // Usa o email como username único
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

        // Lógica inicial de carregamento da aplicação
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', session.user.id).single();
            if (profile) {
                state.user = session.user;
                state.profile = profile;
                renderMainMenu();
            } else {
                // Se a sessão existe mas o perfil não, é um estado inválido, desloga.
                await handleLogout();
            }
        } else {
            renderAuthScreen();
        }
    }

    return { init };
})();

Game.init();
