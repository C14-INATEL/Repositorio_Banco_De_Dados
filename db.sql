CREATE DATABASE IF NOT EXISTS sistema_entregas;
USE sistema_entregas;

-- LIMPAR TABELAS
DROP TABLE IF EXISTS entregas;
DROP TABLE IF EXISTS lojas;
DROP TABLE IF EXISTS usuarios;

-- USUARIOS
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LOJAS
CREATE TABLE lojas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    endereco VARCHAR(255),
    telefone VARCHAR(20),
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ENTREGAS
CREATE TABLE entregas (
   id INT AUTO_INCREMENT PRIMARY KEY,
   descricao VARCHAR(255),
   regiao VARCHAR(50),
   status INT DEFAULT 1,
   data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   data_entrega TIMESTAMP NULL,
   loja_id INT,
   FOREIGN KEY (loja_id) REFERENCES lojas(id)
);

-- USUARIOS (comentado: fluxo de cadastro já funciona pela aplicação)
-- INSERT INTO usuarios (nome, email, senha, tipo) VALUES
-- ('Administrador', 'admin@email.com', '123456', 'admin'),
-- ('Operador 1', 'op1@email.com', '123456', 'operador'),
-- ('Operador 2', 'op2@email.com', '123456', 'operador'),
-- ('Loja A', 'A@email.com', '123456', 'lojista'),
-- ('Loja B', 'B@email.com', '123456', 'lojista');

-- LOJAS (comentado: fluxo de cadastro já funciona pela aplicação)
-- INSERT INTO lojas (nome, endereco, telefone, usuario_id) VALUES
-- ('Loja A', 'Rua ABC, 100', '111111111', 4),
-- ('Loja B', 'Rua DEF, 200', '222222222', 5);

-- TESTE USUARIOS
-- SELECT id, nome, email, tipo FROM usuarios;

-- PEDIDOS
INSERT INTO entregas (descricao, regiao, loja_id) VALUES
('Pedido Loja A', 'Sul', 1),
('Pedido Loja B', 'Sudeste', 2);

-- ATUALIZA STATUS
UPDATE entregas SET status = 2 WHERE id = 1;
UPDATE entregas SET status = 3 WHERE id = 1;
UPDATE entregas SET status = 4, data_entrega = CURRENT_TIMESTAMP WHERE id = 2;

-- TESTE ENTREGAS
SELECT
e.id AS pedido_id,
   l.nome AS loja,
   e.regiao,
   CASE
       WHEN e.status = 1 THEN 'Criado'
       WHEN e.status = 2 THEN 'Em andamento'
       WHEN e.status = 3 THEN 'Enviado'
       WHEN e.status = 4 THEN 'Entregue'
   END AS status,
   e.data_pedido,
   e.data_entrega
FROM entregas e
JOIN lojas l ON e.loja_id = l.id;