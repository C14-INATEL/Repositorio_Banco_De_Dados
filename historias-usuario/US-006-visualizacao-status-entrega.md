**US-006 - Visualização de Status da Entrega**

**Historia de usuario**
Como cliente, eu quero visualizar o status atual da minha entrega de forma clara para entender em que etapa o meu pedido se encontra.

**Prioridade**
Alta

**Status**
Em desenvolvimento

**Criterios de aceitacao**

**Cenario 1 - Exibição de status válido**
Dado que existe uma entrega consultada com sucesso
Quando os dados do pedido são exibidos
Então o sistema deve mostrar o status atual da entrega
E o status deve ser apresentado com um rótulo compreensível ao usuário

**Cenario 2 - Mapeamento de status técnico para visual**
Dado que o status da entrega no sistema é "criado", "andamento", "enviado", "entregue" ou "cancelado"
Quando o status é exibido ao cliente
Então o sistema deve converter para uma forma amigável
Exemplo:

* "criado" → "Pendente"
* "andamento" ou "enviado" → "Em rota"
* "entregue" → "Entregue"
* "cancelado" → "Cancelado"

**Cenario 3 - Destaque visual do status**
Dado que o status da entrega está sendo exibido
Quando o cliente visualiza o pedido
Então o sistema deve aplicar diferenciação visual (cores ou estilos) para cada status
Para facilitar a identificação rápida da situação do pedido

**Cenario 4 - Status desconhecido**
Dado que o sistema recebe um status não mapeado
Quando o status é exibido
Então o sistema deve apresentar o valor original
E não deve quebrar a interface

**Evidencias tecnicas**
Campo: entregas.status
Frontend: Rastreio.jsx
Função: statusVisual
Mapeamento de status: objeto statusConfig
Estilização: classes CSS de status (status-pendente, status-emrota, status-entregue, status-cancelado)

**Rastreabilidade**
Historia -> Issue/PR de exibição de status -> Testes de renderização e mapeamento de status