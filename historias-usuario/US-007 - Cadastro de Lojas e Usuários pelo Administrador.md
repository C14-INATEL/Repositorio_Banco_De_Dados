**US-006 - Cadastro de Lojas e Usuários pelo Administrador**

**História de usuário**
Como administrador, eu quero cadastrar novas lojas e novos usuários no sistema para que eu possa gerenciar os participantes da plataforma de entregas sem depender de processos externos.

**Prioridade**
Alta

**Status**
Em desenvolvimento

---

**Critérios de aceitação**

**Cenário 1 - Cadastro de novo usuário com sucesso**
Dado que o administrador está autenticado no sistema com perfil admin
Quando ele acessa o módulo de usuários e preenche os campos obrigatórios: nome, e-mail, senha e tipo
Então o sistema deve criar o usuário
E retornar os dados do usuário cadastrado com status 201
E o novo usuário deve aparecer na listagem

**Cenário 2 - Cadastro de usuário com e-mail já existente**
Dado que o administrador tenta cadastrar um usuário com um e-mail já em uso
Quando submete o formulário
Então o sistema deve retornar status 409
E exibir a mensagem "Este e-mail já está em uso."
E não deve criar o registro duplicado

**Cenário 3 - Cadastro de usuário com campos obrigatórios ausentes**
Dado que o administrador não preenche um ou mais campos obrigatórios (nome, e-mail, senha ou tipo)
Quando tenta submeter o formulário
Então o sistema deve retornar status 400
E exibir a mensagem "Todos os campos são obrigatórios"
E não deve criar o usuário

**Cenário 4 - Cadastro de nova loja com sucesso**
Dado que o administrador está autenticado e acessa o módulo de lojas
Quando preenche os campos obrigatórios: nome e usuário vinculado (usuario_id)
Então o sistema deve criar a loja
E retornar os dados da loja criada com status 201
E a nova loja deve aparecer na listagem

**Cenário 5 - Cadastro de loja com campos obrigatórios ausentes**
Dado que o administrador não informa o nome ou o usuário vinculado
Quando tenta submeter o formulário
Então o sistema deve retornar status 400
E exibir a mensagem "Nome e usuário são obrigatórios"
E não deve criar a loja

**Cenário 6 - Cadastro de loja com ID de usuário inválido**
Dado que o administrador informa um usuario_id em formato não numérico
Quando tenta submeter o formulário
Então o sistema deve retornar status 400
E exibir a mensagem "Nome e usuário são obrigatórios"
E não deve prosseguir com o cadastro

**Cenário 7 - Visualização da lista após cadastro**
Dado que o administrador acabou de cadastrar um usuário ou loja com sucesso
Quando acessa a listagem correspondente
Então o novo registro deve estar visível
E os dados exibidos devem corresponder ao que foi cadastrado

---

**Evidências técnicas**

Endpoints:
- `POST /cadastro` — criação de usuário
- `POST /lojas` — criação de loja

Controllers: `usuariosController.criar`, `lojasController.criar`

Services: `usuariosService.criar`, `lojasService.criar`

Validações: `possuiCampos`, `campoStringValido`, `idNumericoValido`

Tratamento de erro: status 400 para campos inválidos, 409 para e-mail duplicado, 201 para sucesso

---

**Rastreabilidade**
História → Issue/PR de gestão de usuários e lojas → Testes `usuariosController.mock.test.js` e `lojasController.mock.test.js` → Validação de criação, campos obrigatórios e duplicidade de e-mail