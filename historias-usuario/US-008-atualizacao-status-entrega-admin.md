# US-008 - Atualização de Status da Entrega pelo Administrador

## História de usuário

Como administrador, eu quero atualizar o status das entregas diretamente no dashboard para que o andamento de cada entrega seja refletido corretamente para lojistas e clientes, sem depender de alterações manuais no banco.

> Observação de terminologia: na interface, cada entrega é exibida como um *pedido* (aba **Pedidos** do dashboard). A entidade persistida é a tabela `entregas`, e o campo alterado é `entregas.status`.

## Prioridade

Alta

## Status

Em desenvolvimento

## Critérios de aceitação

### Cenário 1 - Alteração de status com sucesso

Dado que o administrador está autenticado e visualizando a lista de entregas na aba Pedidos  
Quando ele seleciona um novo status válido para uma entrega no seletor  
Então o sistema envia `PATCH /entregas/:id` com o novo status  
E o backend responde com status 200 e os dados atualizados da entrega  
E a alteração é refletida imediatamente na tabela, sem recarregar a página.

### Cenário 2 - Persistência da alteração

Dado que o status de uma entrega foi alterado com sucesso  
Quando o backend processa a atualização  
Então o novo valor é gravado em `entregas.status` no banco de dados  
E, ao recarregar a página (`GET /entregas`), a entrega continua exibindo o status atualizado.

### Cenário 3 - Apenas status válidos disponíveis no seletor

Dado que o administrador deseja alterar o status de uma entrega  
Quando ele abre o seletor de status  
Então o sistema apresenta somente os valores válidos:  
`criado`, `andamento`, `enviado`, `entregue`, `cancelado`.

### Cenário 4 - Rejeição de status inválido pelo backend

Dado que uma requisição de atualização chega com um status fora da lista permitida  
Quando o backend valida os campos em `validarAtualizacao`  
Então o sistema responde com status 400 e a mensagem `status inválida (use: criado, andamento, enviado, entregue, cancelado)`  
E o status da entrega não é alterado.

### Cenário 5 - Entrega inexistente

Dado que o administrador tenta atualizar uma entrega com um id que não existe  
Quando o backend não encontra o registro  
Então o sistema responde com status 404 e a mensagem `Entrega não encontrada`  
E nenhuma alteração é persistida.

### Cenário 6 - Feedback visual durante o salvamento

Dado que o administrador selecionou um novo status  
Quando a requisição está em andamento  
Então o seletor daquela linha fica desabilitado e indica que a alteração está sendo salva  
E volta ao estado normal assim que a operação termina, dando confiança na ação.

### Cenário 7 - Falha na atualização

Dado que ocorre um erro ao atualizar o status (rede ou erro interno do servidor)  
Quando o sistema não consegue persistir a alteração  
Então a interface informa o erro ao administrador com a mensagem retornada pelo backend  
E o status exibido na tabela permanece o valor anterior.

### Cenário 8 - Restrição de acesso por perfil

Dado que um usuário sem perfil de administrador acessa o sistema  
Quando ele tenta alterar o status de uma entrega  
Então a operação deve ser bloqueada  
E o status da entrega não deve ser alterado.

## Evidências técnicas

**Frontend** — `Reposit-rio---Frontend/src/pages/Dashboard.jsx`
- Componente `Pedidos`: tabela de entregas com `<select className="status-select">`; o evento `onChange` chama `handleStatusChange(pedido, novoStatus)`.
- `atualizarStatusPedido(pedidoId, status)` envia a alteração via `api.patch('/entregas/:id', { status })` (`src/api/api.js`).
- Opções do seletor derivadas de `statusConfig` (os 5 status válidos).
- Feedback visual: estado `statusSalvando` (desabilita o seletor durante o envio); erro tratado com mensagem ao usuário no `catch`.

**Backend** — `Reposit-rio---backend/app_backend/src/...`
- Rota: `PUT /entregas/:id` e `PATCH /entregas/:id` → `entregasController.atualizar` (`routes/entregasRoutes.js`).
- Validação `validarAtualizacao`: status deve pertencer a `STATUS_VALIDOS = ['criado', 'andamento', 'enviado', 'entregue', 'cancelado']`.
- Respostas: 400 (status inválido), 404 (`Entrega não encontrada`), 200 (entrega atualizada).

**Banco de dados** — `Repositorio_Banco_De_Dados/db.sql`
- Tabela `entregas`, coluna `status` (tipo `ENUM` com os 5 valores), índice `idx_entregas_status`.

**Ponto de atenção (Cenário 8):** atualmente a rota `/entregas/:id` não exige perfil de administrador no backend; a gestão de usuários e lojas já usa a regra `tipo === 'admin'` (`podeGerenciar`) no frontend. Para atender ao Cenário 8 com segurança, a validação do perfil precisa ser aplicada também no backend.

## Rastreabilidade

História → relacionada à US-002 (regra de status no backend/banco) → Issue/PR de atualização de status pelo dashboard → Testes de alteração, persistência, validação de status (400), entrega inexistente (404) e restrição de acesso por perfil.
