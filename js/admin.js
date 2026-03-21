// ==========================================
// Módulo de Administração e Matchmaking IA
// ==========================================

const ADMIN_PASSWORD = "1234"; // Senha simples para o MVP (Hardcoded temporário)

// DOM
const loginOverlay = document.getElementById('login-overlay');
const formLogin = document.getElementById('form-login');
const btnLogout = document.getElementById('btn-logout');
const ordersContainer = document.getElementById('admin-orders-container');
const aiModal = document.getElementById('ai-modal');
const btnCloseAiModal = document.getElementById('btn-close-ai-modal');
const aiLoading = document.getElementById('ai-loading');
const aiContent = document.getElementById('ai-content');
const aiResult = document.getElementById('ai-result');
const aiOrderTitle = document.getElementById('ai-order-title');

let orders = [];

// 1. Controle de Acesso
function checkAuth() {
    if (localStorage.getItem('orcaAqui_admin_auth') === 'true') {
        loginOverlay.classList.add('hidden');
        fetchOrders();
    } else {
        loginOverlay.classList.remove('hidden');
    }
}

formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('admin-pass').value;
    if (pass === ADMIN_PASSWORD) {
        localStorage.setItem('orcaAqui_admin_auth', 'true');
        checkAuth();
    } else {
        alert("Senha incorreta!");
    }
});

btnLogout.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('orcaAqui_admin_auth');
    location.reload();
});

// 2. Buscar e Renderizar Pedidos
async function fetchOrders() {
    try {
        const response = await fetch('https://n8n.srv1483391.hstgr.cloud/webhook/orcaaqui-get-pedidos');
        if (!response.ok) throw new Error('Erro ao buscar pedidos');
        
        const data = await response.json();
        orders = Array.isArray(data) ? data : [];
        renderAdminOrders();
    } catch (error) {
        console.error("Erro:", error);
        ordersContainer.innerHTML = '<p class="empty-message">Erro ao carregar dados do n8n.</p>';
    }
}

function renderAdminOrders() {
    if (!ordersContainer) return;
    ordersContainer.innerHTML = ''; 
    
    const abertos = orders
        .filter(o => o.status === "Aberto")
        .sort((a, b) => (Number(b.row_number) || 0) - (Number(a.row_number) || 0));

    if (abertos.length === 0) {
        ordersContainer.innerHTML = '<p class="empty-message">Nenhum pedido em aberto.</p>';
        return;
    }

    const cardsHtml = abertos.map(order => {
        const valorNumerico = Number(order.valorEsperado) || 0;
        return `
        <div class="order-card" style="border-top: 4px solid var(--primary-color);">
            <div class="order-content">
                <div>
                    <span style="font-size: 0.75rem; background: var(--bg-color); padding: 0.25rem 0.5rem; border-radius: 4px; color: var(--text-muted);">ID: ${order.id}</span>
                    <h2 class="order-client-name" style="margin-top: 0.5rem;">${order.produto || 'Produto'}</h2>
                    <p class="order-date">Lançado: ${order.dataPedido || '--'} | Prazo: ${order.prazo || '--'}</p>
                    <p class="order-value" style="font-size: 1rem; margin-top: 0.5rem;">Teto: R$ ${valorNumerico.toFixed(2)}</p>
                </div>
                <div class="order-footer" style="flex-direction: column; gap: 0.5rem;">
                    <button class="btn btn-primary btn-analisar" data-id="${order.id}" data-title="${order.produto}" style="width: 100%; background-color: #0f172a; box-shadow: none;">
                        ✨ Analisar Propostas (IA)
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');

    ordersContainer.innerHTML = cardsHtml;

    document.querySelectorAll('.btn-analisar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const title = e.target.getAttribute('data-title');
            analisarComIA(id, title);
        });
    });
}

// 3. Integração com a IA do n8n
async function analisarComIA(orderId, orderTitle) {
    aiOrderTitle.innerText = `Pedido: ${orderTitle} (${orderId})`;
    aiContent.classList.add('hidden');
    aiLoading.classList.remove('hidden');
    aiModal.classList.remove('modal-hidden');

    try {
        // Chamada para o novo Webhook que vamos criar no n8n!
        const response = await fetch(`https://n8n.srv1483391.hstgr.cloud/webhook/orcaaqui-analise-ia?id_pedido=${orderId}`);
        
        if (!response.ok) throw new Error('Erro na análise da IA');
        
        const result = await response.json();
        
        // Exibe o texto da IA
        aiResult.innerText = result.analise || "A IA não conseguiu gerar um resumo válido.";
        
    } catch (error) {
        console.error(error);
        aiResult.innerHTML = `<span style="color: red;">Falha ao contactar a IA. O workflow de análise já está ativo no n8n?</span>`;
    } finally {
        aiLoading.classList.add('hidden');
        aiContent.classList.remove('hidden');
    }
}

// Modal Fechar
btnCloseAiModal.addEventListener('click', () => aiModal.classList.add('modal-hidden'));
aiModal.addEventListener('click', (e) => { if (e.target === aiModal) aiModal.classList.add('modal-hidden'); });

// Boot
checkAuth();