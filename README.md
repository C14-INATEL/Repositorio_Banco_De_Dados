# Duck — Banco de Dados

Repositório com o schema e scripts de dados do sistema de gestão de entregas Duck.

---

## Arquivos

| Arquivo            | Descrição                                                  |
|--------------------|------------------------------------------------------------|
| `db.sql`           | Cria o banco, as tabelas e insere entregas de exemplo      |
| `popular_banco.js` | Script para popular usuários e lojas (para apresentações)  |

---

## Como o banco é criado

O banco é criado automaticamente pelo Docker ao subir o backend. O arquivo `db.sql` é executado na primeira vez que o container MySQL inicia.

Consulte o README do backend para subir o ambiente:
```
Reposit-rio---backend/app_backend/README.md
```

---

## Popular o banco para apresentação

Após o Docker estar rodando, execute o script para inserir usuários e lojas:

### 1. Instalar dependências (apenas na primeira vez)

```bash
cd Repositorio_Banco_De_Dados
npm install
```

### 2. Rodar o script

```bash
npm run popular
```

Ou, diretamente da raiz do projeto:

```bash
npm run seed
```

> O script limpa os dados existentes e repopula usuários e lojas do zero.
> As entregas de exemplo ficam no `db.sql` e são carregadas automaticamente pelo Docker.

---

## Usuários criados pelo script

| Nome              | E-mail                   | Senha  | Tipo     |
|-------------------|--------------------------|--------|----------|
| Lucas Martins     | lucas.martins@duck.com   | 123456 | admin    |
| Fernanda Lima     | fernanda.lima@duck.com   | 123456 | operador |
| Diego Rodrigues   | diego.rodrigues@duck.com | 123456 | operador |
| Ana Paula Santos  | ana.santos@email.com     | 123456 | lojista  |
| Roberto Campos    | roberto.campos@email.com | 123456 | lojista  |

## Lojas criadas pelo script

| Nome               | Endereço           | Telefone      | Dono                     |
|--------------------|--------------------|---------------|--------------------------|
| Empório Central    | Av. Paulista, 1842 | 11 93271-4455 | ana.santos@email.com     |
| Farmácia Saúde Já  | Rua Augusta, 374   | 11 97834-2210 | roberto.campos@email.com |
