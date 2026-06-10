# US-004 - Acompanhamento de Entregas (Dashboard)

## Historia de usuario
Como operador ou admin, eu quero visualizar todas as entregas com seus status e prioridades para que eu possa gerenciar a operacao e priorizar pedidos urgentes.

## Prioridade
Alta

## Status
Entregue

## Criterios de aceitacao

### Cenario 1 - Visualizacao por status
Dado que existem entregas cadastradas  
Quando acesso o dashboard  
Entao devo ver as entregas agrupadas ou filtradas por status.

### Cenario 2 - Ordenacao por prioridade
Quando ha entregas com prioridade `urgente` ou `alta`  
Entao elas devem aparecer destacadas ou no topo da listagem.

## Evidencias tecnicas
- Tabela: `entregas`
- Indices: `idx_entregas_status`, `idx_entregas_prioridade`
- Frontend: `Dashboard.jsx`, `LojistaDashboard.jsx`

## Rastreabilidade
Historia -> Issue/PR de dashboard -> Testes automatizados de visualizacao e ordenacao de entregas