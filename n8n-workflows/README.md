# Orquestrações e APIs (n8n Workflows) ⚙️

Neste diretório estão salvos os arquivos `.json` contendo os fluxos exportados do n8n. Estes arquivos podem ser importados diretamente em qualquer instância do n8n para replicar a infraestrutura construída.

Abaixo está a documentação lógica de cada um dos projetos:

## 1. Backend OrçaAqui MVP (`Backend_OrcaAqui_MVP.json`)
* **Descrição:** Lógica backend (API Serverless) do projeto OrçaAqui para gestão de orçamentos e análise B2B.
* **Lógica / Fluxo:**
  1. **GET Pedidos:** Um webhook que escuta requisições GET (`/orcaaqui-get-pedidos`), acessa uma base de dados no Google Sheets (aba `adiciona_pedido`) e retorna todos os pedidos ativos para o Front-End.
  2. **POST Proposta:** Um webhook que escuta propostas enviadas por fornecedores (`/orcaaqui-post-proposta`) e salva os dados na aba `analisa_resposta_pedido` do Google Sheets.
  3. **Análise IA (Matchmaking):** Webhook GET que recebe o ID de um pedido e busca todas as propostas enviadas para ele. Em seguida, usando um nó de Código, verifica se há propostas (se não houver, retorna um aviso elegante). Se houver, a lista é enviada para a API do Google Gemini 2.5 Flash, que atua como Analista de Compras e resume em até 3 parágrafos a melhor proposta.

## 2. Interview Case (`Interview_Case.json`)
* **Descrição:** Sistema inteligente e automatizado para atendimento ao cliente (Customer Service) via E-mail.
* **Lógica / Fluxo:**
  1. **Gatilho (Trigger):** Monitora a caixa de entrada do Gmail em busca de e-mails recebidos.
  2. **Registro:** Guarda um log completo do contato recebido em uma planilha central ("Central de Atendimento") no Google Sheets, incluindo remetente, mensagem original e horário.
  3. **Roteamento Inteligente (Switch):** Lê a mensagem usando expressões regulares (RegEx) para identificar a intenção do cliente: *Cancelamento*, *Status/Andamento*, ou *Pedido Parado*.
  4. **Templates e Dados:** Com base na intenção, seleciona um template de mensagem pré-definido (em espanhol) e simula uma consulta a sistemas externos de e-commerce e CRM (Mocks Shopify e CRM).
  5. **Queda para IA (Fallback):** Se a mensagem não bater com as intenções mapeadas, repassa o caso ao Google Gemini 2.5 Flash, instruído a atuar como assistente de suporte, para gerar uma resposta empática prometendo revisão.
  6. **Envio:** Compila a resposta final, adiciona dados de rastreio (se aplicável), e salva como um Rascunho (Draft) direto no Gmail para aprovação humana final.

## 3. case projeto facul (`case_projeto_facul.json`)
* **Descrição:** Backend simples e direto servindo como API de consulta para um projeto universitário (Biblioteca Itupeva).
* **Lógica / Fluxo:**
  Este fluxo atua como duas rotas de API estáticas.
  1. **Rota de Livros:** Um Webhook (`GET /livros`) que, quando acionado, extrai todos os dados da aba "Livros_Destaque" do banco de dados no Google Sheets e devolve em formato JSON.
  2. **Rota de Avisos:** Outro Webhook (`GET /avisos`) que puxa e retorna as notificações da aba "Avisos" do mesmo arquivo.
