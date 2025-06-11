// Estado global da aplicação
const state = {
    isAuthenticated: false,
    token: null,
    currentPage: 'status',
    botStatus: null,
    stats: null,
    logs: [],
    socket: null
};

// Elementos DOM
const elements = {
    loginScreen: document.getElementById('loginScreen'),
    dashboard: document.getElementById('dashboard'),
    loginForm: document.getElementById('loginForm'),
    loginError: document.getElementById('loginError'),
    logoutBtn: document.getElementById('logoutBtn'),
    navItems: document.querySelectorAll('.nav-item'),
    pageTitle: document.getElementById('pageTitle'),
    pages: document.querySelectorAll('.page-content'),
    connectionStatus: document.getElementById('connectionStatus'),
    toastContainer: document.getElementById('toastContainer')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Verificar autenticação
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        state.token = token;
        state.isAuthenticated = true;
        showDashboard();
    } else {
        showLogin();
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Login
    elements.loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    elements.logoutBtn.addEventListener('click', handleLogout);
    
    // Navegação
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
    
    // Botões de ação
    document.getElementById('reconnectBtn')?.addEventListener('click', handleReconnect);
    document.getElementById('disconnectBtn')?.addEventListener('click', handleDisconnect);
    document.getElementById('requestQrBtn')?.addEventListener('click', handleRequestQR);
    
    // Configurações
    document.getElementById('settingsForm')?.addEventListener('submit', handleSaveSettings);
    
    // Logs
    document.getElementById('clearLogsBtn')?.addEventListener('click', clearLogs);
    document.getElementById('exportLogsBtn')?.addEventListener('click', exportLogs);
}

// Handlers de autenticação
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            state.token = data.token;
            state.isAuthenticated = true;
            localStorage.setItem('token', data.token);
            showDashboard();
            showToast('Login realizado com sucesso!', 'success');
        } else {
            elements.loginError.textContent = data.error || 'Erro ao fazer login';
        }
    } catch (error) {
        elements.loginError.textContent = 'Erro de conexão com o servidor';
    }
}

function handleLogout() {
    state.isAuthenticated = false;
    state.token = null;
    localStorage.removeItem('token');
    
    if (state.socket) {
        state.socket.disconnect();
    }
    
    showLogin();
    showToast('Logout realizado com sucesso', 'info');
}

// Navegação
function showLogin() {
    elements.loginScreen.style.display = 'flex';
    elements.dashboard.style.display = 'none';
}

function showDashboard() {
    elements.loginScreen.style.display = 'none';
    elements.dashboard.style.display = 'flex';
    
    // Conectar ao Socket.io
    connectSocket();
    
    // Navegar para a página inicial
    navigateTo('status');
}

function navigateTo(page) {
    state.currentPage = page;
    
    // Atualizar navegação ativa
    elements.navItems.forEach(item => {
        if (item.dataset.page === page) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Mostrar página correspondente
    elements.pages.forEach(pageEl => {
        if (pageEl.id === `${page}Page`) {
            pageEl.classList.add('active');
        } else {
            pageEl.classList.remove('active');
        }
    });
    
    // Atualizar título
    const titles = {
        status: 'Status do Bot',
        connection: 'Conexão WhatsApp',
        stats: 'Estatísticas',
        logs: 'Logs do Sistema',
        settings: 'Configurações'
    };
    
    elements.pageTitle.textContent = titles[page] || 'Dashboard';
    
    // Carregar dados específicos da página
    if (page === 'stats') {
        loadStats();
    } else if (page === 'logs') {
        loadLogs();
    }
}

// Socket.io
function connectSocket() {
    state.socket = io();
    
    state.socket.on('connect', () => {
        console.log('Conectado ao servidor');
        updateConnectionStatus(true);
    });
    
    state.socket.on('disconnect', () => {
        console.log('Desconectado do servidor');
        updateConnectionStatus(false);
    });
    
    state.socket.on('bot-status', (status) => {
        updateBotStatus(status);
    });
    
    state.socket.on('stats-update', (stats) => {
        updateStats(stats);
    });
    
    state.socket.on('qr', (qr) => {
        console.log('QR Code recebido');
        const qrContainer = document.getElementById('qrContainer');
        if (qrContainer) {
            qrContainer.innerHTML = `<img src="${qr}" alt="QR Code" style="max-width: 100%; height: auto;">`;
        }
    });
    
    state.socket.on('error', (error) => {
        showToast(error.message, 'error');
    });
    
    state.socket.on('log-entry', (log) => {
        addLogEntry(log);
    });
}

// Atualizar status
function updateConnectionStatus(connected) {
    const statusEl = elements.connectionStatus;
    const statusText = statusEl.querySelector('span');
    
    if (connected) {
        statusEl.classList.add('connected');
        statusEl.classList.remove('disconnected');
        statusText.textContent = 'Conectado';
    } else {
        statusEl.classList.remove('connected');
        statusEl.classList.add('disconnected');
        statusText.textContent = 'Desconectado';
    }
}

function updateBotStatus(status) {
    state.botStatus = status;
    
    // Atualizar elementos de status
    document.getElementById('botStatus').textContent = status.connected ? 'Online' : 'Offline';
    document.getElementById('whatsappStatus').textContent = status.authenticated ? 'Conectado' : 'Desconectado';
    document.getElementById('phoneNumber').textContent = status.phoneNumber || '-';
    document.getElementById('uptime').textContent = formatUptime(status.uptime);
    
    // Atualizar QR Code se disponível
    if (status.qrCode) {
        const qrContainer = document.getElementById('qrContainer');
        qrContainer.innerHTML = `<img src="${status.qrCode}" alt="QR Code">`;
        
        // Se não estiver na página de conexão, mostrar notificação
        if (state.currentPage !== 'connection') {
            showToast('Novo QR Code disponível. Vá para a página de Conexão.', 'info');
        }
    } else if (!status.authenticated) {
        const qrContainer = document.getElementById('qrContainer');
        qrContainer.innerHTML = `
            <div class="qr-placeholder">
                <i class="fas fa-qrcode"></i>
                <p>QR Code aparecerá aqui</p>
            </div>
        `;
    }
    
    // Mostrar erro se houver
    if (status.error) {
        showToast(status.error, 'error');
    }
}

function updateStats(stats) {
    state.stats = stats;
    
    document.getElementById('messagesReceived').textContent = stats.messagesReceived;
    document.getElementById('messagesProcessed').textContent = stats.messagesProcessed;
    document.getElementById('audiosCorrected').textContent = stats.audiosCorrected;
    document.getElementById('errors').textContent = stats.errors;
    
    // Atualizar gráfico se estiver na página de estatísticas
    if (state.currentPage === 'stats') {
        updateChart();
    }
}

// Handlers de ações
async function handleReconnect() {
    showToast('Reconectando...', 'info');
    state.socket.emit('reconnect-bot');
}

async function handleDisconnect() {
    if (confirm('Tem certeza que deseja desconectar o bot?')) {
        showToast('Desconectando...', 'info');
        state.socket.emit('disconnect-bot');
    }
}

async function handleRequestQR() {
    try {
        showToast('Solicitando novo QR Code...', 'info');
        state.socket.emit('request-qr');
        // Navegar para a página de conexão para mostrar o QR code
        navigateTo('connection');
    } catch (error) {
        showToast('Erro ao solicitar QR Code', 'error');
    }
}

async function handleSaveSettings(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const settings = Object.fromEntries(formData);
    
    // Aqui você pode enviar as configurações para o servidor
    showToast('Configurações salvas com sucesso!', 'success');
}

// Logs
function addLogEntry(log) {
    state.logs.push(log);
    
    if (state.currentPage === 'logs') {
        const logsContent = document.getElementById('logsContent');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${log.level}`;
        logEntry.textContent = `[${new Date(log.timestamp).toLocaleTimeString()}] [${log.level.toUpperCase()}] ${log.message}`;
        logsContent.appendChild(logEntry);
        
        // Auto-scroll para o final
        logsContent.scrollTop = logsContent.scrollHeight;
    }
}

function loadLogs() {
    const logsContent = document.getElementById('logsContent');
    logsContent.innerHTML = '';
    
    state.logs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${log.level}`;
        logEntry.textContent = `[${new Date(log.timestamp).toLocaleTimeString()}] [${log.level.toUpperCase()}] ${log.message}`;
        logsContent.appendChild(logEntry);
    });
}

function clearLogs() {
    if (confirm('Tem certeza que deseja limpar os logs?')) {
        state.logs = [];
        document.getElementById('logsContent').innerHTML = '';
        showToast('Logs limpos com sucesso', 'success');
    }
}

function exportLogs() {
    const logsText = state.logs.map(log => 
        `[${new Date(log.timestamp).toISOString()}] [${log.level.toUpperCase()}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-bot-logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Logs exportados com sucesso', 'success');
}

// Estatísticas
function loadStats() {
    if (state.stats) {
        updateChart();
    }
    
    // Solicitar estatísticas atualizadas
    state.socket.emit('get-stats');
}

function updateChart() {
    const ctx = document.getElementById('statsChart');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (window.statsChart) {
        window.statsChart.destroy();
    }
    
    // Criar novo gráfico
    window.statsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mensagens Recebidas', 'Processadas', 'Áudios Corrigidos', 'Erros'],
            datasets: [{
                label: 'Estatísticas do Bot',
                data: [
                    state.stats.messagesReceived,
                    state.stats.messagesProcessed,
                    state.stats.audiosCorrected,
                    state.stats.errors
                ],
                borderColor: '#25D366',
                backgroundColor: 'rgba(37, 211, 102, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Utilitários
function formatUptime(milliseconds) {
    if (!milliseconds) return '-';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]} toast-icon"></i>
        <span class="toast-message">${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Remover após 5 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

// Adicionar animação de saída
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 