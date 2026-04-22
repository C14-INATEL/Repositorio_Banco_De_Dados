CREATE DATABASE IF NOT EXISTS sistema_entregas;
USE sistema_entregas;

-- LIMPAR TUDO (ordem importa por causa das FK)
DROP TABLE IF EXISTS entregas;
DROP TABLE IF EXISTS lojas;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS regioes;


-- REGIÕES
CREATE TABLE regioes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    custo_base DECIMAL(10,2) NOT NULL
);

INSERT INTO regioes (nome, custo_base) VALUES
('Sul', 20.00),
('Sudeste', 25.00),
('Centro-Oeste', 30.00),
('Nordeste', 35.00),
('Norte', 40.00);


-- USUÁRIOS
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'operador', 'lojista') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nome, email, senha, tipo) VALUES
('Administrador', 'admin@email.com', '123456', 'admin'),
('Operador 1', 'op1@email.com', '123456', 'operador'),
('Loja A', 'lojaA@email.com', '123456', 'lojista'),
('Loja B', 'lojaB@email.com', '123456', 'lojista');


-- LOJAS
CREATE TABLE lojas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    endereco VARCHAR(255),
    telefone VARCHAR(20),
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

INSERT INTO lojas (nome, endereco, telefone, usuario_id) VALUES
('Loja A', 'Rua ABC, 100', '111111111', 3),
('Loja B', 'Rua DEF, 200', '222222222', 4);

-- ENTREGAS
CREATE TABLE entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255),
    status ENUM('criado', 'andamento', 'enviado', 'entregue', 'cancelado') DEFAULT 'criado',
    prioridade ENUM('baixa', 'media', 'alta', 'urgente') DEFAULT 'media',
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_entrega TIMESTAMP NULL,
    custo DECIMAL(10,2),
    loja_id INT,
    regiao_id INT,
    FOREIGN KEY (loja_id) REFERENCES lojas(id),
    FOREIGN KEY (regiao_id) REFERENCES regioes(id)
);

-- INSERIR PEDIDOS (TESTE)
INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo) VALUES
('Pedido Loja A', 1, 1, 'media', 20.00),
('Pedido Loja B', 2, 2, 'urgente', 25.00),
('Pedido Loja A urgente', 1, 2, 'urgente', 25.00);

-- ATUALIZAÇÕES
-- andamento
UPDATE entregas SET status = 'andamento' WHERE id = 1;

-- enviado
UPDATE entregas SET status = 'enviado' WHERE id = 1;

-- entregue
UPDATE entregas 
SET status = 'entregue', data_entrega = CURRENT_TIMESTAMP 
WHERE id = 2;

-- cancelado
UPDATE entregas 
SET status = 'cancelado' 
WHERE id = 3;

-- CONSULTAS
-- LISTAR PEDIDOS (ordenado por prioridade e data)
SELECT 
    e.id,
    l.nome AS loja,
    r.nome AS regiao,
    e.prioridade,
    e.status,
    e.data_pedido,
    e.data_entrega,
    e.custo
FROM entregas e
JOIN lojas l ON e.loja_id = l.id
JOIN regioes r ON e.regiao_id = r.id
ORDER BY e.prioridade DESC, e.data_pedido DESC;

-- AGRUPAMENTO POR REGIÃO
SELECT 
    r.nome AS regiao,
    COUNT(*) AS total_pedidos,
    SUM(e.custo) AS custo_total
FROM entregas e
JOIN regioes r ON e.regiao_id = r.id
GROUP BY r.nome;

-- LOGIN (simulação)
SELECT * FROM usuarios 
WHERE email = 'admin@email.com' AND senha = '123456';

-- BUSCAR PEDIDOS URGENTES
SELECT * FROM entregas 
WHERE prioridade = 'urgente';

-- ATUALIZAR PEDIDO
UPDATE entregas
SET descricao = 'Pedido atualizado', prioridade = 'alta'
WHERE id = 1;

-- FINALIZAR ENTREGA
UPDATE entregas
SET status = 'entregue', data_entrega = CURRENT_TIMESTAMP
WHERE id = 1;