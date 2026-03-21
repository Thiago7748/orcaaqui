# OrçaAqui - MVP 🚀

O **OrçaAqui** é um Produto Mínimo Viável (MVP) de uma plataforma B2B desenvolvida para conectar empresas que precisam de produtos/serviços (clientes) com fornecedores dispostos a enviar orçamentos (propostas).

Este projeto foi construído focando na extrema eficiência, baixo custo de infraestrutura e implementação rápida, utilizando tecnologias "Serverless" e integrações Low-Code.

## 🏗️ Arquitetura e Tecnologias

- **Front-End:** HTML5, CSS3 puro (com tipografia Inter) e Vanilla JavaScript (Fetch API).
- **Hospedagem Front-End:** [Vercel](https://vercel.com) (Deploy contínuo integrado ao GitHub).
- **Back-End (Low-Code):** [n8n](https://n8n.io/) hospedado na Hostinger. Responsável por expor os Webhooks e orquestrar a lógica.
- **Banco de Dados:** Google Sheets (Planilhas atuando como banco de dados para Pedidos e Propostas).
- **Inteligência Artificial:** Google Gemini 2.5 Flash. Integrado ao n8n para ler o array de propostas de um pedido e sugerir ao administrador qual a melhor escolha e por quê.

## ✨ Funcionalidades Desenvolvidas

1. **Portal Público (Página de Fornecedores):**
   - Listagem em tempo real dos pedidos em aberto (via Webhook GET).
   - Modal com formulário para envio de orçamentos (Valor, Observações, WhatsApp, etc.).
   - Disparo seguro dos orçamentos para o banco de dados (via Webhook POST).

2. **Painel Administrativo (`/admin.html`):**
   - Autenticação simples.
   - Visualização de todos os pedidos cadastrados.
   - **Análise Inteligente (IA):** Ao clicar para analisar um pedido, o sistema aciona um webhook no n8n, que agrupa todas as propostas feitas para aquele pedido específico, envia para a IA do Gemini 2.5 Flash, e retorna uma análise de até 3 parágrafos indicando o melhor custo-benefício.
   - Tratamento de exceções (ex: a IA avisa amigavelmente caso um pedido ainda não possua orçamentos).

## 🗂️ Estrutura do Projeto

```text
/
├── index.html        # Página principal para fornecedores
├── admin.html        # Painel de controle para os gestores
├── favicon.svg       # Ícone do site
├── css/
│   └── styles.css    # Estilização global e componentes
└── js/
    ├── app.js        # Lógica da página pública (fetch de pedidos, envio de proposta)
    ├── admin.js      # Lógica do painel admin (autenticação, chamada da IA)
    └── mockData.js   # Dados estáticos (backup/fallback caso o n8n falhe)
```


---
*Projeto construído interativamente, configurado do zero com deploy automatizado em CI/CD (GitHub -> Vercel).*
