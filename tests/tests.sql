-- INÍCIO DO TESTE (ISOLADO)
START TRANSACTION;

-- MOCKS
DELETE FROM entregas;
DELETE FROM lojas;
DELETE FROM usuarios;

-- garante regiões
INSERT IGNORE INTO regioes (id, nome, custo_base) VALUES
(1, 'Sul', 20.00),
(2, 'Sudeste', 25.00);

-- USUÁRIOS
INSERT INTO usuarios (id, nome, email, senha, tipo) VALUES
(1, 'Admin', 'admin@email.com', '123456', 'admin'),
(2, 'Loja', 'loja@email.com', '123456', 'lojista');

-- LOJA
INSERT INTO lojas (id, nome, endereco, telefone, usuario_id) VALUES
(1, 'Loja A', 'Rua A', '111111111', 2);

-- ENTREGA
INSERT INTO entregas (id, descricao, loja_id, regiao_id, prioridade, custo) VALUES
(1, 'Pedido Teste', 1, 1, 'media', 20.00);


-- TESTES

-- TESTE: FK usuário inexistente (deve falhar)
INSERT INTO lojas (nome, endereco, telefone, usuario_id)
VALUES ('Loja Inválida', 'Rua X', '999999999', 999);

-- TESTE: FK loja inexistente (deve falhar)
INSERT INTO entregas (descricao, loja_id, regiao_id)
VALUES ('Pedido inválido', 999, 1);

-- TESTE: status default
INSERT INTO entregas (descricao, loja_id, regiao_id)
VALUES ('Teste Default', 1, 1);

SELECT status 
FROM entregas
WHERE descricao = 'Teste Default';

-- TESTE: atualização completa
UPDATE entregas
SET descricao = 'Pedido Atualizado', prioridade = 'alta'
WHERE id = 1;

SELECT descricao, prioridade FROM entregas WHERE id = 1;

-- TESTE: marcar como entregue
UPDATE entregas
SET status = 'entregue', data_entrega = CURRENT_TIMESTAMP
WHERE id = 1;

SELECT status, data_entrega
FROM entregas
WHERE id = 1;

-- TESTE: inconsistência (não deveria permitir)
UPDATE entregas
SET status = 'entregue', data_entrega = NULL
WHERE id = 1;

-- TESTE: atualização para email já existente
UPDATE usuarios
SET email = 'admin@email.com'
WHERE id = 2;

SELECT * FROM entregas
WHERE status = 'entregue' AND data_entrega IS NULL;

-- TESTE: cancelamento
UPDATE entregas
SET status = 'cancelado'
WHERE id = 1;

SELECT status FROM entregas WHERE id = 1;

-- TESTE: prioridade urgente
UPDATE entregas SET prioridade = 'urgente' WHERE id = 1;

SELECT * FROM entregas WHERE prioridade = 'urgente';

-- TESTE: ordenação correta por prioridade
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
JOIN regioes r ON e.regiao_id = r.id
GROUP BY r.nome;

-- TESTE: custo abaixo do custo base da região
SELECT *
FROM entregas e
JOIN regioes r ON e.regiao_id = r.id
WHERE e.custo < r.custo_base;

-- TESTE: análise de busca por status
EXPLAIN SELECT *
FROM entregas
WHERE status = 'criado';

-- TESTE: data automática de criação
INSERT INTO entregas (descricao, loja_id, regiao_id)
VALUES ('Entrega Timestamp', 1, 1);

SELECT data_criacao
FROM entregas
WHERE descricao = 'Entrega Timestamp';

-- TESTE: exclusão de usuário e impacto nas lojas
DELETE FROM usuarios
WHERE id = 2;

SELECT *
FROM lojas
WHERE usuario_id = 2;

ROLLBACK;