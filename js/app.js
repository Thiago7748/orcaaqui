import { openOrders as mockDataOrders } from './mockData.js';

// DOM Elements
const ordersContainer = document.getElementById('orders-container');
const bidModal = document.getElementById('bid-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const formBid = document.getElementById('form-bid');
const modalOrderInfo = document.getElementById('modal-order-info');
const bidOrderId = document.getElementById('bid-order-id');

let orders = [];
let lastOrdersState = "";

// 1. Fetch Orders (Simulando n8n GET)
async function fetchOrders(isPolling = false) {
    try {
        const response = await fetch('https://n8n.srv1483391.hstgr.cloud/webhook/orcaaqui-get-pedidos');
        if (!response.ok) throw new Error('Erro ao buscar pedidos');
        
        const data = await response.json();
        const newOrders = Array.isArray(data) ? data : [];
        
        // Verifica se os dados mudaram antes de forçar o navegador a desenhar a tela de novo
        const currentState = JSON.stringify(newOrders);
        if (currentState !== lastOrdersState) {
            orders = newOrders;
            lastOrdersState = currentState;
            
            // Se for uma chamada de atualização em background, já manda renderizar
            if (isPolling) {
                renderOrders();
                console.log("Novos pedidos detectados. Tela atualizada!");
            }
        }
    } catch (error) {
        console.error("Erro na API:", error);
        // Removemos o fallback para dados falsos para você poder usar a planilha real
        if (!isPolling && orders.length === 0) {
            ordersContainer.innerHTML = '<p class="empty-message">Erro ao carregar pedidos. Verifique se o n8n está ativo e respondendo.</p>';
        }
    }
}

// 2. Render Orders List
function converterData(dataString) {
    if (!dataString) return 0;
    const partes = dataString.split('/');
    // Formato do Date no JS: Ano, Mês (0-11), Dia
    return new Date(partes[2], partes[1] - 1, partes[0]).getTime();
}

function renderOrders() {
    if (!ordersContainer) return;
    
    ordersContainer.innerHTML = ''; 
    
    // Sort orders by row_number descending (newest added first)
    const abertos = orders
        .filter(o => o.status === "Aberto")
        .sort((a, b) => {
            const rowA = Number(a.row_number) || 0;
            const rowB = Number(b.row_number) || 0;
            return rowB - rowA;
        });

    if (abertos.length === 0) {
        ordersContainer.innerHTML = '<p class="empty-message">Nenhum pedido em aberto no momento.</p>';
        return;
    }

    const cardsHtml = abertos.map(order => {
        // Garantir que valorEsperado seja um número, mesmo que venha como string do Google Sheets
        const valorNumerico = Number(order.valorEsperado) || 0;
        const fotoFinal = order.fotoUrl || 'https://images.unsplash.com/photo-1541888086925-920a0b22ff06?auto=format&fit=crop&w=500&q=80';

        return `
        <div class="order-card">
            <div class="order-image" style="background-image: url('${fotoFinal}');"></div>
            <div class="order-content">
                <div>
                    <h2 class="order-client-name">${order.produto || 'Produto'}</h2>
                    <p class="order-date" style="font-size: 0.75rem; margin-bottom: 0.25rem;">Solicitado em: ${order.dataPedido || '--'}</p>
                    <p class="order-date">Prazo esperado: ${order.prazo || '--'}</p>
                    <p class="order-description">${order.descricao || ''}</p>
                    <p class="order-date" style="margin-top:0.5rem">📍 ${order.endereco || ''}</p>
                </div>
                <div class="order-footer">
                    <span class="order-value">R$ ${valorNumerico.toFixed(2)}</span>
                    <button class="btn btn-primary btn-dar-lance" data-id="${order.id}">Enviar Orçamento</button>
                </div>
            </div>
        </div>
        `;
    }).join('');

    ordersContainer.innerHTML = cardsHtml;

    document.querySelectorAll('.btn-dar-lance').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            openBidModal(id);
        });
    });
}

// 3. Modal Logic (Pedido na Esquerda, Form na Direita)
function openBidModal(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        alert("Pedido não encontrado!");
        return;
    }

    bidOrderId.value = order.id;
    
    const valorNumerico = Number(order.valorEsperado) || 0;
    const fotoFinal = order.fotoUrl || 'https://images.unsplash.com/photo-1541888086925-920a0b22ff06?auto=format&fit=crop&w=500&q=80';

    modalOrderInfo.innerHTML = `
        <img src="${fotoFinal}" style="width:100%; height:150px; object-fit:cover; border-radius:8px; margin-bottom:1rem;" />
        <p><strong>Produto/Serviço:</strong> ${order.produto || 'Produto'}</p>
        <p><strong>Valor Esperado:</strong> <span style="color: var(--success-color); font-weight: bold;">R$ ${valorNumerico.toFixed(2)}</span></p>
        <hr style="margin: 1rem 0; border: 0; border-top: 1px solid var(--border-color);">
        <p><strong>Detalhes:</strong> ${order.descricao || ''}</p>
        <p><strong>Prazo Esperado:</strong> ${order.prazo || '--'}</p>
        <p><strong>Local de Entrega:</strong> ${order.endereco || ''}</p>
    `;

    formBid.reset();
    bidModal.classList.remove('modal-hidden');
    
    // Atualiza a URL sem recarregar a página (compartilhável)
    window.history.pushState({}, '', '?pedido=' + orderId);
}

function closeBidModal() {
    bidModal.classList.add('modal-hidden');
    // Limpa a URL
    window.history.pushState({}, '', window.location.pathname);
}

// 4. Submit Form (Simulando n8n POST)

// Utility: Show Toast Notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Ícone condicional
    const icon = type === 'success' ? '✅' : '❌';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toast);

    // Reflow trigger para animação
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove após 4 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300); // Aguarda o CSS transition terminar
    }, 4000);
}

// Setup Input Masks (Telefone)
const inputWhats = document.getElementById('bid-whats');
if (inputWhats) {
    inputWhats.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
        
        // Aplica a máscara: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
        if (value.length > 11) value = value.slice(0, 11); // Limite máximo de 11 números

        if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
        if (value.length > 9) {
            // Formato com 9 dígitos: (11) 99999-9999
            value = `${value.slice(0, 10)}-${value.slice(10)}`;
        } else if (value.length > 8 && value.length <= 9) {
            // Formato com 8 dígitos: (11) 9999-9999
            value = `${value.slice(0, 9)}-${value.slice(9)}`;
        }
        
        e.target.value = value;
    });
}

async function handleBidSubmit(e) {
    e.preventDefault();
    
    const submitBtn = formBid.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Enviando...";
    submitBtn.disabled = true;

    const payload = {
        id_pedido: bidOrderId.value,
        nome_fornecedor: document.getElementById('bid-nome').value,
        whatsapp: document.getElementById('bid-whats').value,
        preco_ofertado: document.getElementById('bid-value').value,
        observacoes: document.getElementById('bid-obs').value,
        data_hora: new Date().toISOString()
    };

    try {
        const response = await fetch('https://n8n.srv1483391.hstgr.cloud/webhook/orcaaqui-post-proposta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Erro na rede ao enviar proposta');

        showToast('Proposta enviada com sucesso! Em breve entraremos em contato.', 'success');
        closeBidModal();
    } catch (error) {
        console.error("Erro ao enviar:", error);
        showToast('Erro ao enviar proposta. Verifique sua conexão e tente novamente.', 'error');
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
}

// 5. Init
async function init() {
    await fetchOrders();
    renderOrders();

    // Configura o Auto-Refresh (Polling) a cada 10 segundos
    setInterval(() => {
        fetchOrders(true);
    }, 10000);

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeBidModal);
    if (bidModal) bidModal.addEventListener('click', (e) => { if (e.target === bidModal) closeBidModal(); });
    if (formBid) formBid.addEventListener('submit', handleBidSubmit);
    
    // Smooth scroll hero button
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Check URL para abrir modal automaticamente via WhatsApp Link
    const urlParams = new URLSearchParams(window.location.search);
    const pedidoParam = urlParams.get('pedido');
    if (pedidoParam) {
        // scroll to pedidos section
        document.getElementById('pedidos').scrollIntoView();
        openBidModal(pedidoParam);
    }
}

init();
