-- TESTES DE INTEGRIDADE

-- 5. TESTE USUARIO_ID INEXISTENTE
INSERT INTO lojas (nome, endereco, telefone, usuario_id)
VALUES ('Loja Teste', 'Rua X', '999999999', 999);

-- 6. TESTE LOJA_ID INEXISTENTE
INSERT INTO entregas (descricao, loja_id, regiao_id)
VALUES ('Pedido inválido', 999, 1);


-- TESTES DE REGRAS DE NEGÓCIO

-- 7. INSERÇÃO SEM STATUS (DEVE USAR DEFAULT)
INSERT INTO entregas (descricao, loja_id, regiao_id)
VALUES ('Teste Status Default', 1, 1);

-- VERIFICA STATUS DEFAULT
SELECT status 
FROM entregas
WHERE descricao = 'Teste Status Default';


-- TESTES DE ATUALIZAÇÃO

-- 8. ATUALIZA PARA ENTREGUE
UPDATE entregas
SET status = 'entregue', data_entrega = CURRENT_TIMESTAMP
WHERE id = 1;

-- VERIFICA DATA ENTREGA
SELECT status, data_entrega
FROM entregas
WHERE id = 1;