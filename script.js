// =================================================================
//          SEVENXFOOT - SCRIPT DE TESTE DE AUTENTICAÇÃO
// =================================================================
// Objetivo: Isolar e testar a funcionalidade de registo e login.
// DADOS ATUALIZADOS COM O NOVO PROJETO.
// =================================================================

const SUPABASE_URL = 'https://dxuucjpbkvwxoontvzly.supabase.co'; // <-- URL ATUALIZADO
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dXVjanBia3Z3eG9vbnR2emx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2Mjg2OTMsImV4cCI6MjA2NzIwNDY5M30.gNKi6gS3pG_tfNJAcpop_H1P9b7unLhUdkh_NJqu1fk'; // <-- CHAVE ATUALIZADA

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const root = document.getElementById('app-root');

// --- Funções de Autenticação ---

async function handleLogin() {
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    const authError = document.getElementById('auth-error');
    authError.textContent = 'A tentar entrar...';

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        console.error("Erro de Login:", error);
        authError.textContent = `Erro de Login: ${error.message}`;
        return;
    }
    
    if (data.user) {
        authError.textContent = '';
        root.innerHTML = `<div class="main-menu-bg"><h1 class="text-3xl text-white">Login bem-sucedido! Bem-vindo, ${data.user.email}!</h1></div>`;
    }
}

async function handleSignup() {
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    const authError = document.getElementById('auth-error');
    authError.textContent = 'A tentar registar...';

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        console.error("Erro de Registo:", error);
        authError.textContent = `Erro de Registo: ${error.message}`;
        return;
    }

    if (data.user) {
        // Se o registo for bem-sucedido, agora tentamos criar o perfil.
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({ id: data.user.id, email: data.user.email });

        if (profileError) {
            console.error("Erro ao criar perfil:", profileError);
            authError.textContent = `Registo bem-sucedido, mas falha ao criar perfil: ${profileError.message}`;
        } else {
            authError.textContent = '';
            root.innerHTML = `<div class="main-menu-bg"><h1 class="text-3xl text-white">Registo completo! Por favor, faça o login.</h1></div>`;
        }
    }
}

// --- Renderização e Inicialização ---

function renderAuthScreen() {
    root.innerHTML = `
        <div id="auth-screen" class="main-menu-bg">
            <div class="auth-panel p-8 rounded-lg text-center shadow-2xl w-full max-w-md">
                <h1 class="text-5xl font-black text-white mb-6">Teste de Login</h1>
                <div id="auth-form" class="space-y-4">
                    <input type="email" id="email-input" class="w-full" placeholder="seu@email.com">
                    <input type="password" id="password-input" class="w-full" placeholder="senha (mínimo 6 caracteres)">
                    <button id="login-btn" class="w-full btn-action btn-primary">Entrar</button>
                    <button id="signup-btn" class="w-full btn-action">Cadastrar</button>
                </div>
                <p id="auth-error" class="text-red-400 mt-4 h-auto break-words"></p>
            </div>
        </div>`;
}

function init() {
    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'login-btn') handleLogin();
        if (e.target.id === 'signup-btn') handleSignup();
    });

    renderAuthScreen();
}

init();
