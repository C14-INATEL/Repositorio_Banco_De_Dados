START TRANSACTION;
 
DELETE FROM entregas;
DELETE FROM lojas;
DELETE FROM usuarios;
 
-- garante região mínima
INSERT IGNORE INTO regioes (id, nome, custo_base)
VALUES (1, 'Sul', 20.00);
 
-- USUÁRIOS
INSERT INTO usuarios (id, nome, email, senha, tipo) VALUES
(1, 'Admin', 'admin@email.com', '123456', 'admin'),
(2, 'Operador', 'op@email.com', '123456', 'operador'),
(3, 'Loja User', 'loja@email.com', '123456', 'lojista');
 
-- LOJA
INSERT INTO lojas (id, nome, endereco, telefone, usuario_id) VALUES
(1, 'Loja A', 'Rua A', '111111111', 3);
 
-- ENTREGA
INSERT INTO entregas (id, descricao, loja_id, regiao_id, prioridade, custo, status) VALUES
(1, 'Pedido 1', 1, 1, 'media', 20.00, 'criado');
 

-- TESTE: email duplicado (deve falhar)
INSERT INTO usuarios (nome, email, senha, tipo)
VALUES ('Teste', 'admin@email.com', '123456', 'admin');
 
-- TESTE: nome NULL (deve falhar)
INSERT INTO usuarios (nome, email, senha, tipo)
VALUES (NULL, 'teste@email.com', '123456', 'admin');

-- TESTE: tipo inválido de usuário
INSERT INTO usuarios (nome, email, senha, tipo)
VALUES ('Teste', 'teste@email.com', '123456', 'gerente');
 
-- TESTE: verificar status (modelo novo)
SELECT id, status FROM entregas;
 
-- TESTE: verificar entregas sem loja válida
SELECT e.id
FROM entregas e
LEFT JOIN lojas l ON e.loja_id = l.id
WHERE l.id IS NULL;

-- TESTE: entrega sem descrição
INSERT INTO entregas (descricao, loja_id, regiao_id)
VALUES (NULL, 1, 1);
 
-- TESTE: busca real (filtro)
SELECT *
FROM entregas
WHERE status = 'criado' AND prioridade = 'media';
 
-- TESTE: consistência de região
SELECT e.id
FROM entregas e
LEFT JOIN regioes r ON e.regiao_id = r.id
WHERE r.id IS NULL;

-- TESTE: impedir custo negativo
INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo)
VALUES ('Entrega inválida', 1, 1, 'media', -10.00);

-- TESTE: prioridade inválida
INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade)
VALUES ('Teste', 1, 1, 'super-alta');

 
ROLLBACK;