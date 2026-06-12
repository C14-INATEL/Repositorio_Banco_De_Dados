CREATE DATABASE IF NOT EXISTS sistema_entregas;
USE sistema_entregas;

-- Schema idempotente: nada de DROP — tabelas são preservadas entre boots.
-- Indexes vão dentro de CREATE TABLE para também serem idempotentes
-- (MySQL não suporta CREATE INDEX IF NOT EXISTS em versões mais antigas).

-- REGIOES
CREATE TABLE IF NOT EXISTS regioes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL CHECK (CHAR_LENGTH(nome) > 0),
    custo_base DECIMAL(10,2) NOT NULL CHECK (custo_base >= 0)
);

-- USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL CHECK (CHAR_LENGTH(email) > 0),
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'operador', 'lojista') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LOJAS
CREATE TABLE IF NOT EXISTS lojas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL CHECK (CHAR_LENGTH(nome) > 0),
    endereco VARCHAR(255),
    telefone VARCHAR(20)
        CHECK (CHAR_LENGTH(telefone) >= 8),
    usuario_id INT NULL,
    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- ENTREGAS
CREATE TABLE IF NOT EXISTS entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255),
    status ENUM(
        'criado',
        'andamento',
        'enviado',
        'entregue',
        'cancelado'
    ) DEFAULT 'criado',
    prioridade ENUM(
        'baixa',
        'media',
        'alta',
        'urgente'
    ) DEFAULT 'media',
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_entrega TIMESTAMP NULL,
    custo DECIMAL(10,2)
        CHECK (custo >= 0),
    loja_id INT NOT NULL,
    regiao_id INT NOT NULL,
    FOREIGN KEY (loja_id)
        REFERENCES lojas(id)
        ON DELETE CASCADE,
    FOREIGN KEY (regiao_id)
        REFERENCES regioes(id),
    INDEX idx_entregas_status (status),
    INDEX idx_entregas_prioridade (prioridade)
);

-- Observação: nenhum dado de seed neste arquivo.
-- O seed é feito por popular_banco.js, que só popula quando o banco está
-- vazio (preservando dados criados via aplicação entre boots).
-- Use `npm run seed:force` (no repo do BD) para resetar e re-semear.
