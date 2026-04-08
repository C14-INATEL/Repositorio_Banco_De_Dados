-- Teste inserção com usuario_id inexistente
INSERT INTO lojas (nome, endereco, telefone, usuario_id)
VALUES ('Loja Teste', 'Rua X', '999999999', 999);

-- Teste inserção com loja_id inexistente
INSERT INTO entregas (descricao, regiao, loja_id)
VALUES ('Pedido inválido', 'Norte', 999);

-- Inserção sem status (deve usar default)
INSERT INTO entregas (descricao, regiao, loja_id)
VALUES ('Teste Status Default', 'Centro', 1);

-- Verifica status default
SELECT status FROM entregas
WHERE descricao = 'Teste Status Default';

-- Atualiza para entregue
UPDATE entregas
SET status = 4, data_entrega = CURRENT_TIMESTAMP
WHERE id = 1;

-- Verifica se data_entrega foi preenchida
SELECT status, data_entrega
FROM entregas
WHERE id = 1;