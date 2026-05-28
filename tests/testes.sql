-- TESTE: email duplicado (deve falhar)
INSERT INTO usuarios (nome, email, senha, tipo)
VALUES ('Teste', 'admin@email.com', '123456', 'admin');

-- TESTE: nome NULL (deve falhar)
INSERT INTO usuarios (nome, email, senha, tipo)
VALUES (NULL, 'teste@email.com', '123456', 'admin');

-- TESTE: tipo inválido de usuário
INSERT INTO usuarios (nome, email, senha, tipo)
VALUES ('Teste', 'teste@email.com', '123456', 'gerente');

-- TESTE: verificar status
SELECT id, status
FROM entregas;

-- TESTE: verificar entregas sem loja válida
SELECT e.id
FROM entregas e
LEFT JOIN lojas l ON e.loja_id = l.id
WHERE l.id IS NULL;

-- TESTE: busca real
SELECT *
FROM entregas
WHERE status = 'criado'
AND prioridade = 'media';

-- TESTE: consistência de região
SELECT e.id
FROM entregas e
LEFT JOIN regioes r ON e.regiao_id = r.id
WHERE r.id IS NULL;

-- TESTE: impedir custo negativo
INSERT INTO entregas (
    descricao,
    loja_id,
    regiao_id,
    prioridade,
    custo
)
VALUES (
    'Entrega inválida',
    1,
    1,
    'media',
    -10.00
);

-- TESTE: prioridade inválida
INSERT INTO entregas (
    descricao,
    loja_id,
    regiao_id,
    prioridade
)
VALUES (
    'Teste',
    1,
    1,
    'super-alta'
);

-- TESTE: FK usuário inexistente
INSERT INTO lojas (
    nome,
    endereco,
    telefone,
    usuario_id
)
VALUES (
    'Loja Inválida',
    'Rua X',
    '999999999',
    999
);

-- TESTE: FK loja inexistente
INSERT INTO entregas (
    descricao,
    loja_id,
    regiao_id
)
VALUES (
    'Pedido inválido',
    999,
    1
);

-- TESTE: telefone inválido
INSERT INTO lojas (
    nome,
    endereco,
    telefone,
    usuario_id
)
VALUES (
    'Loja Inválida',
    'Rua X',
    '123',
    2
);

-- TESTE: loja sem usuário
INSERT INTO lojas (
    nome,
    endereco,
    telefone
)
VALUES (
    'Loja Sem Usuario',
    'Rua Teste',
    '99999999'
);

-- TESTE: entrega sem região
INSERT INTO entregas (
    descricao,
    loja_id
)
VALUES (
    'Entrega sem região',
    1
);

-- TESTE: inconsistência de região
SELECT e.id
FROM entregas e
LEFT JOIN regioes r ON e.regiao_id = r.id
WHERE r.id IS NULL;

-- TESTE: entregas sem loja válida
SELECT e.id
FROM entregas e
LEFT JOIN lojas l ON e.loja_id = l.id
WHERE l.id IS NULL;

ROLLBACK;