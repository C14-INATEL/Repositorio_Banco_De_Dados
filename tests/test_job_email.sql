-- ============================================================
-- TESTES: Job de E-mail (job_email.sql)
-- ------------------------------------------------------------
-- SETUP: garantir que as tabelas do job existem
-- ------------------------------------------------------------

-- TESTE: tabela notificacoes_email existe
SELECT COUNT(*) AS notificacoes_email_existe
FROM information_schema.tables
WHERE table_schema = 'sistema_entregas'
  AND table_name = 'notificacoes_email';

-- TESTE: tabela entregas_notificadas existe
SELECT COUNT(*) AS entregas_notificadas_existe
FROM information_schema.tables
WHERE table_schema = 'sistema_entregas'
  AND table_name = 'entregas_notificadas';

-- TESTE: procedure gerar_notificacoes_email existe
SELECT COUNT(*) AS procedure_existe
FROM information_schema.routines
WHERE routine_schema = 'sistema_entregas'
  AND routine_name = 'gerar_notificacoes_email';

-- TESTE: event evt_notificacoes_email existe
SELECT COUNT(*) AS event_existe
FROM information_schema.events
WHERE event_schema = 'sistema_entregas'
  AND event_name = 'evt_notificacoes_email';

-- ------------------------------------------------------------
-- TESTE: execução da procedure gera notificação corretamente
-- ------------------------------------------------------------

-- Inserir entrega recente para disparar notificação
INSERT INTO entregas (descricao, status, prioridade, custo, loja_id, regiao_id)
VALUES ('Entrega teste job email', 'andamento', 'alta', 50.00, 1, 1);

-- Chamar a procedure manualmente
CALL gerar_notificacoes_email();

-- Verificar se foi gerada ao menos uma notificação pendente
SELECT COUNT(*) AS notificacoes_pendentes
FROM notificacoes_email
WHERE status = 'pendente';

-- Verificar se o registro de controle foi criado
SELECT COUNT(*) AS controle_criado
FROM entregas_notificadas
WHERE status_notif = 'andamento';

-- ------------------------------------------------------------
-- TESTE: sem duplicidade — segunda chamada não gera novo e-mail
-- ------------------------------------------------------------

CALL gerar_notificacoes_email();

-- O total de notificações para o mesmo status não deve aumentar
SELECT COUNT(*) AS sem_duplicidade
FROM entregas_notificadas
WHERE status_notif = 'andamento';

-- ------------------------------------------------------------
-- TESTE: campos obrigatórios preenchidos na fila
-- ------------------------------------------------------------

SELECT
    COUNT(*) AS campos_validos
FROM notificacoes_email
WHERE email_destino IS NOT NULL
  AND assunto IS NOT NULL
  AND corpo IS NOT NULL
  AND status = 'pendente';

-- ------------------------------------------------------------
-- TESTE: simular envio pelo backend — marcar como enviado
-- ------------------------------------------------------------

UPDATE notificacoes_email
SET status = 'enviado', enviado_em = NOW()
WHERE status = 'pendente'
LIMIT 1;

SELECT COUNT(*) AS enviados
FROM notificacoes_email
WHERE status = 'enviado'
  AND enviado_em IS NOT NULL;

-- ------------------------------------------------------------
-- TESTE: status inválido não pode ser inserido na fila
-- ------------------------------------------------------------

-- Deve falhar por violação do ENUM
INSERT INTO notificacoes_email
    (entrega_id, email_destino, assunto, corpo, status)
VALUES
    (1, 'teste@duck.com', 'Assunto', 'Corpo', 'invalido');

-- ------------------------------------------------------------
-- ROLLBACK: limpar dados de teste
-- ------------------------------------------------------------

DELETE FROM notificacoes_email
WHERE email_destino LIKE '%duck%'
   OR corpo LIKE '%teste job email%';

DELETE FROM entregas_notificadas
WHERE entrega_id = (
    SELECT id FROM entregas WHERE descricao = 'Entrega teste job email'
);

DELETE FROM entregas
WHERE descricao = 'Entrega teste job email';