-- Teste inserção com email duplicado
INSERT INTO usuarios (nome, email, senha, tipo)
VALUES ('Teste', 'admin@email.com', '123456', 'admin');

-- Teste inserção com nome NULL
INSERT INTO usuarios (nome, email, senha, tipo)
VALUES (NULL, 'teste@email.com', '123456', 'admin');

-- Verifica se o CASE retorna corretamente o status
SELECT
   id,
   status,
   CASE
       WHEN status = 1 THEN 'Criado'
       WHEN status = 2 THEN 'Em andamento'
       WHEN status = 3 THEN 'Enviado'
       WHEN status = 4 THEN 'Entregue'
   END AS status_descricao
FROM entregas;

-- Verifica se as entregas possuem loja válida
SELECT e.id
FROM entregas e
LEFT JOIN lojas l ON e.loja_id = l.id
WHERE l.id IS NULL;
