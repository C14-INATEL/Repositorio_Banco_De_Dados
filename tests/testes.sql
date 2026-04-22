-- TESTES DE USUÁRIOS

-- 1. TESTE EMAIL DUPLICADO
INSERT INTO usuarios (nome, email, senha, tipo)
VALUES ('Teste', 'admin@email.com', '123456', 'admin');

-- 2. TESTE NOME NULL
INSERT INTO usuarios (nome, email, senha, tipo)
VALUES (NULL, 'teste@email.com', '123456', 'admin');


-- TESTES DE CONSULTA

-- 3. VER STATUS (AGORA TEXTO)
SELECT 
    id,
    status
FROM entregas;

-- 4. VERIFICAR SE ENTREGAS POSSUEM LOJA VÁLIDA
SELECT e.id
FROM entregas e
LEFT JOIN lojas l ON e.loja_id = l.id
WHERE l.id IS NULL;