# US-002 - Atualizacao de Status da Entrega

## Historia de usuario

Como operador, eu quero atualizar o status de uma entrega para que a equipe consiga acompanhar corretamente o andamento do pedido.

## Prioridade

Alta

## Status

Entregue

## Criterios de aceitacao

### Cenario 1 - Atualizacao para andamento

Dado que existe uma entrega cadastrada com status `criado`  
Quando eu altero o status da entrega para `andamento`  
Entao o novo status deve ser salvo no banco de dados  
E a entrega deve aparecer nas consultas com o status atualizado.

### Cenario 2 - Finalizacao da entrega

Dado que existe uma entrega em andamento ou enviada  
Quando eu altero o status para `entregue`  
Entao o sistema deve registrar que a entrega foi concluida  
E a data de entrega deve ser preenchida para indicar quando o pedido foi finalizado.

### Cenario 3 - Status invalido

Dado que estou atualizando uma entrega  
Quando informo um status diferente de `criado`, `andamento`, `enviado`, `entregue` ou `cancelado`  
Entao o banco de dados deve rejeitar a alteracao  
E a entrega deve manter um status valido.

## Evidencias tecnicas

- Tabela: `entregas`
- Campo principal: `status`
- Valores validos: `criado`, `andamento`, `enviado`, `entregue`, `cancelado`
- Arquivo de schema: `db.sql`
- Testes relacionados: testes de atualizacao de status e validacao de enum

## Rastreabilidade

Historia -> Issue/PR de fluxo de status -> Testes automatizados de atualizacao e validacao de status
