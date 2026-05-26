# US-001 - Cadastro de Entrega

## Historia de usuario

Como operador, eu quero cadastrar uma nova entrega com loja, regiao, prioridade, descricao e custo para que o pedido possa ser acompanhado pelo sistema desde a sua criacao.

## Prioridade

Alta

## Status

Entregue

## Criterios de aceitacao

### Cenario 1 - Cadastro com dados validos

Dado que sou um operador do sistema  
E existe uma loja cadastrada  
E existe uma regiao cadastrada  
Quando eu cadastro uma entrega informando descricao, loja, regiao, prioridade e custo validos  
Entao a entrega deve ser salva no banco de dados  
E o status inicial deve ser `criado`  
E a data do pedido deve ser preenchida automaticamente.

### Cenario 2 - Cadastro com loja ou regiao invalida

Dado que estou cadastrando uma nova entrega  
Quando informo uma loja ou regiao inexistente  
Entao o sistema deve impedir o cadastro  
E a entrega nao deve ser salva sem relacionamento valido.

## Evidencias tecnicas

- Tabela: `entregas`
- Relacionamentos: `entregas.loja_id -> lojas.id` e `entregas.regiao_id -> regioes.id`
- Arquivo de schema: `db.sql`
- Testes relacionados: testes de insercao de entrega e integridade referencial

## Rastreabilidade

Historia -> Issue/PR de cadastro de entrega -> Testes automatizados de criacao e FK de entrega
