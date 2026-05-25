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
