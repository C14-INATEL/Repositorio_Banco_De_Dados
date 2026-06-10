# Duck — Banco de Dados

Repositório com o schema, scripts de dados e jobs do sistema de gestão de entregas Duck.

---

## Visão Geral

O banco de dados `sistema_entregas` é um banco MySQL que sustenta toda a operação do sistema Duck. Ele armazena usuários (admins, operadores e lojistas), lojas vinculadas a lojistas, regiões de entrega com custo-base e as entregas em si, com controle de status e prioridade.

---

## Estrutura de Tabelas

### `regioes`
Armazena as regiões geográficas de entrega com seu custo logístico base.

| Coluna       | Tipo           | Descrição                        |
|--------------|----------------|----------------------------------|
| `id`         | INT (PK)       | Identificador único              |
| `nome`       | VARCHAR(50)    | Nome da região (ex: Sudeste)     |
| `custo_base` | DECIMAL(10,2)  | Custo base da entrega na região  |

---

### `usuarios`
Usuários do sistema com três tipos de perfil.

| Coluna         | Tipo                          | Descrição                          |
|----------------|-------------------------------|------------------------------------|
| `id`           | INT (PK)                      | Identificador único                |
| `nome`         | VARCHAR(100)                  | Nome completo                      |
| `email`        | VARCHAR(100) UNIQUE           | E-mail de acesso (único)           |
| `senha`        | VARCHAR(255)                  | Senha (recomenda-se hash bcrypt)   |
| `tipo`         | ENUM(admin, operador, lojista)| Perfil de acesso                   |
| `ativo`        | BOOLEAN                       | Indica se o usuário está ativo     |
| `data_criacao` | TIMESTAMP                     | Data de criação do registro        |

---

### `lojas`
Lojas cadastradas no sistema, vinculadas a um usuário do tipo `lojista`.

| Coluna       | Tipo         | Descrição                              |
|--------------|--------------|----------------------------------------|
| `id`         | INT (PK)     | Identificador único                    |
| `nome`       | VARCHAR(100) | Nome da loja                           |
| `endereco`   | VARCHAR(255) | Endereço físico                        |
| `telefone`   | VARCHAR(20)  | Telefone de contato (mín. 8 dígitos)   |
| `usuario_id` | INT (FK)     | Lojista responsável → `usuarios.id`    |

---

### `entregas`
Tabela central do sistema. Registra cada pedido de entrega com seu ciclo de vida completo.

| Coluna        | Tipo                                              | Descrição                              |
|---------------|---------------------------------------------------|----------------------------------------|
| `id`          | INT (PK)                                          | Identificador único                    |
| `descricao`   | VARCHAR(255)                                      | Descrição do pedido                    |
| `status`      | ENUM(criado, andamento, enviado, entregue, cancelado) | Status atual da entrega            |
| `prioridade`  | ENUM(baixa, media, alta, urgente)                | Prioridade de processamento            |
| `data_pedido` | TIMESTAMP                                         | Criado automaticamente ao inserir      |
| `data_entrega`| TIMESTAMP NULL                                    | Preenchido ao marcar como `entregue`   |
| `custo`       | DECIMAL(10,2)                                     | Custo calculado da entrega             |
| `loja_id`     | INT (FK)                                          | Loja de origem → `lojas.id`            |
| `regiao_id`   | INT (FK)                                          | Região de destino → `regioes.id`       |

---

### `notificacoes_email` *(job de e-mail)*
Fila de notificações de e-mail geradas automaticamente pelo job `evt_notificacoes_email`.

| Coluna          | Tipo                           | Descrição                              |
|-----------------|--------------------------------|----------------------------------------|
| `id`            | INT (PK)                       | Identificador único                    |
| `entrega_id`    | INT (FK)                       | Entrega relacionada                    |
| `email_destino` | VARCHAR(100)                   | E-mail do lojista destinatário         |
| `assunto`       | VARCHAR(255)                   | Assunto do e-mail                      |
| `corpo`         | TEXT                           | Corpo da mensagem                      |
| `status`        | ENUM(pendente, enviado, erro)  | Estado do envio                        |
| `tentativas`    | INT                            | Número de tentativas de envio          |
| `criado_em`     | TIMESTAMP                      | Quando a notificação foi gerada        |
| `enviado_em`    | TIMESTAMP NULL                 | Quando foi enviada com sucesso         |

---

## Arquivos

| Arquivo                        | Descrição                                                              |
|-------------------------------|------------------------------------------------------------------------|
| `db.sql`                      | Cria o banco, as tabelas e insere dados de exemplo                     |
| `popular_banco.js`            | Script Node.js para popular usuários, lojas e entregas para apresentação |
| `job_email.sql`               | Job MySQL (Event Scheduler) para geração automática de e-mails         |
| `tests/testes.sql`            | Testes de integridade e validação das constraints                      |
| `tests/tests.sql`             | Testes de fluxo: inserção, atualização, cancelamento e consultas       |
| `historias-usuario/`          | User stories do repositório de banco de dados                          |

---

## Como o banco é criado

O banco é criado automaticamente pelo Docker ao subir o backend. O arquivo `db.sql` é executado na primeira vez que o container MySQL inicia.

Consulte o README do backend para subir o ambiente:
```
Reposit-rio---backend/app_backend/README.md
```

---

## Popular o banco para apresentação

Após o Docker estar rodando, execute o script para inserir usuários, lojas e entregas:

### 1. Instalar dependências (apenas na primeira vez)

```bash
cd Repositorio_Banco_De_Dados
npm install
```

### 2. Rodar o script

```bash
npm run popular
```

Ou diretamente da raiz do projeto:

```bash
npm run seed
```

> O script limpa os dados existentes e repopula do zero. As entregas de exemplo do `db.sql` são carregadas automaticamente pelo Docker na primeira inicialização.

---

## Job de E-mail

O arquivo `job_email.sql` cria um **Event Scheduler** no MySQL que verifica a cada 10 minutos se há entregas com status recém-atualizado e insere notificações na tabela `notificacoes_email`.

O backend Node.js é responsável por ler essa fila e enviar os e-mails via nodemailer ou serviço equivalente.

Para ativar o Event Scheduler no MySQL:

```sql
SET GLOBAL event_scheduler = ON;
```

Para verificar se está ativo:

```sql
SHOW VARIABLES LIKE 'event_scheduler';
```

---

## Usuários criados pelo script

| Nome               | E-mail                          | Senha  | Tipo     |
|--------------------|---------------------------------|--------|----------|
| Lucas Martins      | lucas.martins@duck.com          | 123456 | admin    |
| Fernanda Lima      | fernanda.lima@duck.com          | 123456 | operador |
| Diego Rodrigues    | diego.rodrigues@duck.com        | 123456 | operador |
| Ana Paula Santos   | ana.santos@email.com            | 123456 | lojista  |
| Roberto Campos     | roberto.campos@email.com        | 123456 | lojista  |
| Mariana Figueiredo | mariana.figueiredo@email.com    | 123456 | lojista  |
| Carlos Nogueira    | carlos.nogueira@email.com       | 123456 | lojista  |

---

## Lojas criadas pelo script

| Nome               | Endereço              | Telefone       | Dono                          |
|--------------------|-----------------------|----------------|-------------------------------|
| Empório Central    | Av. Paulista, 1842    | 11 93271-4455  | ana.santos@email.com          |
| Farmácia Saúde Já  | Rua Augusta, 374      | 11 97834-2210  | roberto.campos@email.com      |
| Padaria Pão Quente | Rua 13 de Maio, 200   | 11 99123-4455  | mariana.figueiredo@email.com  |
| Tecno Shop         | Av. das Américas, 5000| 21 99876-5432  | carlos.nogueira@email.com     |

---

## Índices

| Índice                  | Tabela     | Campo       | Finalidade                            |
|-------------------------|------------|-------------|---------------------------------------|
| `idx_entregas_status`   | entregas   | status      | Acelera buscas por status             |
| `idx_entregas_prioridade` | entregas | prioridade  | Acelera ordenação por prioridade      |
| `idx_notif_status`      | notificacoes_email | status | Acelera leitura da fila de e-mails |

---

## Uso de Inteligência Artificial

Este repositório contou com apoio de IA generativa (Claude - Anthropic) durante o desenvolvimento. 
Todo o conteúdo gerado foi revisado e validado pela equipe antes de ser integrado ao projeto.

---

## Relacionamentos

```
usuarios (1) ──── (N) lojas
lojas    (1) ──── (N) entregas
regioes  (1) ──── (N) entregas
entregas (1) ──── (N) notificacoes_email
```