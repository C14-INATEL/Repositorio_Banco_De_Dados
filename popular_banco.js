const mysql = require('mysql2/promise')

const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'sistema_entregas',
}

const usuarios = [
  { nome: 'Lucas Martins',     email: 'lucas.martins@duck.com',    senha: '123456', tipo: 'admin' },
  { nome: 'Fernanda Lima',     email: 'fernanda.lima@duck.com',    senha: '123456', tipo: 'operador' },
  { nome: 'Diego Rodrigues',   email: 'diego.rodrigues@duck.com',  senha: '123456', tipo: 'operador' },
  { nome: 'Ana Paula Santos',  email: 'ana.santos@email.com',      senha: '123456', tipo: 'lojista' },
  { nome: 'Roberto Campos',    email: 'roberto.campos@email.com',  senha: '123456', tipo: 'lojista' },
]

const lojas = [
  { nome: 'Empório Central',   endereco: 'Av. Paulista, 1842',      telefone: '11 93271-4455', emailDono: 'ana.santos@email.com' },
  { nome: 'Farmácia Saúde Já', endereco: 'Rua Augusta, 374',        telefone: '11 97834-2210', emailDono: 'roberto.campos@email.com' },
]

async function popular() {
  const conn = await mysql.createConnection(config)

  try {
    console.log('[duck] Conectado ao banco de dados.')

    // Desativa FK para poder limpar as tabelas sem erro de constraint
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0')
    await conn.execute('TRUNCATE TABLE entregas')
    await conn.execute('TRUNCATE TABLE lojas')
    await conn.execute('TRUNCATE TABLE usuarios')
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1')
    console.log('[duck] Tabelas limpas.')

    // Insere usuários e guarda os IDs gerados pelo banco
    const ids = {}
    for (const u of usuarios) {
      const [result] = await conn.execute(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        [u.nome, u.email, u.senha, u.tipo]
      )
      ids[u.email] = result.insertId
    }
    console.log(`[duck] ${usuarios.length} usuários inseridos.`)

    // Insere lojas vinculadas aos seus respectivos usuários lojistas
    for (const l of lojas) {
      await conn.execute(
        'INSERT INTO lojas (nome, endereco, telefone, usuario_id) VALUES (?, ?, ?, ?)',
        [l.nome, l.endereco, l.telefone, ids[l.emailDono]]
      )
    }
    console.log(`[duck] ${lojas.length} lojas inseridas.`)

    console.log('\n[duck] Banco populado com sucesso!')
    console.log('\nCredenciais de acesso:')
    console.log('  lucas.martins@duck.com   | 123456 | admin')
    console.log('  fernanda.lima@duck.com   | 123456 | operador')
    console.log('  diego.rodrigues@duck.com | 123456 | operador')
    console.log('  ana.santos@email.com     | 123456 | lojista')
    console.log('  roberto.campos@email.com | 123456 | lojista')
  } finally {
    await conn.end()
  }
}

popular().catch(err => {
  console.error('[duck] Erro ao popular o banco:', err.message)
  process.exit(1)
})
