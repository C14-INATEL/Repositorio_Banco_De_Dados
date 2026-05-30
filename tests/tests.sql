SET FOREIGN_KEY_CHECKS = 0;

-- TESTE: verificar status padrão
SELECT id, status
FROM entregas;

-- TESTE: busca por status e prioridade
SELECT *
FROM entregas
WHERE status = 'criado'
AND prioridade = 'media';

-- TESTE: status default
INSERT INTO entregas (
    descricao,
    loja_id,
    regiao_id
)
VALUES (
    'Teste Default',
    1,
    1
);

SELECT status
FROM entregas
WHERE descricao = 'Teste Default';

-- TESTE: prioridade default
INSERT INTO entregas (
    descricao,
    loja_id,
    regiao_id
)
VALUES (
    'Entrega default',
    1,
    1
);

SELECT prioridade
FROM entregas
WHERE descricao = 'Entrega default';

-- TESTE: data_pedido automática
INSERT INTO entregas (
    descricao,
    loja_id,
    regiao_id
)
VALUES (
    'Entrega timestamp',
    1,
    1
);

SELECT data_pedido
FROM entregas
WHERE descricao = 'Entrega timestamp';

-- TESTE: atualização completa
UPDATE entregas
SET descricao = 'Pedido Atualizado',
    prioridade = 'alta'
WHERE id = 1;

SELECT descricao, prioridade
FROM entregas
WHERE id = 1;

-- TESTE: marcar entrega como entregue
UPDATE entregas
SET status = 'entregue',
    data_entrega = CURRENT_TIMESTAMP
WHERE id = 1;

SELECT status, data_entrega
FROM entregas
WHERE id = 1;

-- TESTE: impedir inconsistência de entrega
UPDATE entregas
SET status = 'entregue',
    data_entrega = NULL
WHERE id = 1;

SELECT *
FROM entregas
WHERE status = 'entregue'
AND data_entrega IS NULL;

-- TESTE: cancelamento
UPDATE entregas
SET status = 'cancelado'
WHERE id = 1;

SELECT status
FROM entregas
WHERE id = 1;

-- TESTE: prioridade urgente
UPDATE entregas
SET prioridade = 'urgente'
WHERE id = 1;

SELECT *
FROM entregas
WHERE prioridade = 'urgente';

-- TESTE: ordenação por prioridade
SELECT id, prioridade
FROM entregas
ORDER BY
CASE prioridade
    WHEN 'urgente' THEN 1
    WHEN 'alta' THEN 2
    WHEN 'media' THEN 3
    WHEN 'baixa' THEN 4
END;

-- TESTE: agrupamento por região
SELECT
    r.nome,
    COUNT(*) AS total,
    SUM(e.custo) AS custo_total
FROM entregas e
JOIN regioes r
ON e.regiao_id = r.id
GROUP BY r.nome;

-- TESTE: índice em status
EXPLAIN
SELECT *
FROM entregas
WHERE status = 'criado';

-- TESTE: DELETE CASCADE
DELETE FROM usuarios
WHERE id = 3;

SELECT *
FROM lojas
WHERE usuario_id = 3;

ROLLBACK;

SET FOREIGN_KEY_CHECKS = 1;