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

-- USUARIOS
INSERT INTO usuarios (nome, email, senha, tipo) VALUES
('Administrador', 'admin@email.com', '123456', 'admin'),
('Operador 1', 'op1@email.com', '123456', 'operador'),
('Operador 2', 'op2@email.com', '123456', 'operador'),
('Loja A', 'A@email.com', '123456', 'lojista'),
('Loja B', 'B@email.com', '123456', 'lojista');

-- LOJAS
INSERT INTO lojas (nome, endereco, telefone, usuario_id) VALUES
('Loja A', 'Rua ABC, 100', '111111111', 4),
('Loja B', 'Rua DEF, 200', '222222222', 5);

-- TESTE USUARIOS
SELECT id, nome, email, tipo FROM usuarios;