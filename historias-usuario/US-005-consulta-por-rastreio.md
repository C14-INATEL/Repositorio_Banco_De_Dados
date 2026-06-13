**US-005 - Consulta de Entrega por Código de Rastreio**

**Historia de usuario**
Como cliente, eu quero consultar o status da minha entrega utilizando um código de rastreio para que eu possa acompanhar o andamento do meu pedido sem precisar de uma conta no sistema.

**Prioridade**
Alta

**Status**
Em desenvolvimento

**Criterios de aceitação**

**Cenario 1 - Consulta com código válido**
Dado que o cliente possui um código de rastreio válido
Quando ele informa o código no campo de busca e realiza a consulta
Então o sistema deve buscar a entrega correspondente
E exibir o status atual do pedido
E exibir os detalhes da entrega, incluindo loja, região, descrição, prioridade, custo e datas

**Cenario 2 - Código no formato DUCK**
Dado que o cliente informa um código no formato "DUCK-00001"
Quando o sistema processa a busca
Então o sistema deve extrair corretamente o ID da entrega
E realizar a consulta normalmente

**Cenario 3 - Código numérico simples**
Dado que o cliente informa apenas o número da entrega
Quando realiza a busca
Então o sistema deve aceitar o formato
E retornar o pedido correspondente

**Cenario 4 - Código inválido**
Dado que o cliente informa um código inválido ou vazio
Quando tenta realizar a busca
Então o sistema deve exibir uma mensagem de erro
E não deve realizar a consulta

**Cenario 5 - Código não encontrado**
Dado que o cliente informa um código válido
Mas não existe nenhuma entrega correspondente
Então o sistema deve exibir a mensagem "Código de rastreio não encontrado"

**Evidencias tecnicas**
Endpoint: GET /entregas/{id}
Frontend: Rastreio.jsx
Funções: extrairIdRastreio, buscarPedido
Tratamento de erro: status 404 e validação de input

**Rastreabilidade**
Historia -> Issue/PR de rastreio público -> Testes de busca por ID e validação de entrada