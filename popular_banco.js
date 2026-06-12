const mysql = require('mysql2/promise')
const fs = require('node:fs/promises')
const path = require('node:path')

// Conexão SEM database — o schema é (re)criado por db.sql, que faz
// CREATE DATABASE IF NOT EXISTS + USE. Isso permite rodar mesmo num MySQL
// "novo" (sem o database) ou "velho" (com schema desatualizado).
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  multipleStatements: true,
}

const usuarios = [
  { nome: 'Lucas Martins',     email: 'lucas.martins@duck.com',    senha: '123456', tipo: 'admin' },
  { nome: 'Fernanda Lima',     email: 'fernanda.lima@duck.com',    senha: '123456', tipo: 'operador' },
  { nome: 'Diego Rodrigues',   email: 'diego.rodrigues@duck.com',  senha: '123456', tipo: 'operador' },
  { nome: 'Ana Paula Santos',  email: 'ana.santos@email.com',      senha: '123456', tipo: 'lojista' },
  { nome: 'Roberto Campos',    email: 'roberto.campos@email.com',  senha: '123456', tipo: 'lojista' },
  { nome: 'Mariana Figueiredo',email: 'mariana.figueiredo@email.com', senha: '123456', tipo: 'lojista' },
  { nome: 'Carlos Nogueira',   email: 'carlos.nogueira@email.com',     senha: '123456', tipo: 'lojista' },
]

const lojas = [
  { nome: 'Empório Central',      endereco: 'Av. Paulista, 1842',      telefone: '11 93271-4455', emailDono: 'ana.santos@email.com' },
  { nome: 'Farmácia Saúde Já',    endereco: 'Rua Augusta, 374',        telefone: '11 97834-2210', emailDono: 'roberto.campos@email.com' },
  { nome: 'Padaria Pão Quente',   endereco: 'Rua 13 de Maio, 200',     telefone: '11 99123-4455', emailDono: 'mariana.figueiredo@email.com' },
  { nome: 'Tecno Shop',           endereco: 'Av. das Américas, 5000',   telefone: '21 99876-5432', emailDono: 'carlos.nogueira@email.com' },
]

const regioes = [
  { nome: 'Norte',       custoBase: 35.00 },
  { nome: 'Nordeste',    custoBase: 30.00 },
  { nome: 'Centro-Oeste',custoBase: 32.50 },
  { nome: 'Sudeste',     custoBase: 28.00 },
  { nome: 'Sul',         custoBase: 33.00 },
]

const entregas = [
  { descricao: 'Cesta de café da manhã para cliente em Manaus', lojaNome: 'Empório Central', regiaoNome: 'Norte', prioridade: 'alta',    custo: 42.50, status: 'criado' },
  { descricao: 'Remédio urgente para paciente em Recife',       lojaNome: 'Farmácia Saúde Já', regiaoNome: 'Nordeste', prioridade: 'urgente', custo: 28.00, status: 'andamento' },
  { descricao: 'Alimentos congelados para Brasília',             lojaNome: 'Empório Central', regiaoNome: 'Centro-Oeste', prioridade: 'media',   custo: 35.00, status: 'enviado' },
  { descricao: 'Medicamentos para entrega em Porto Alegre',      lojaNome: 'Farmácia Saúde Já', regiaoNome: 'Sul',       prioridade: 'alta',    custo: 45.00, status: 'criado' },
  { descricao: 'Kit festa para cliente em São Paulo',            lojaNome: 'Empório Central', regiaoNome: 'Sudeste',   prioridade: 'alta',    custo: 55.00, status: 'andamento' },
  { descricao: 'Produtos de beleza para Salvador',               lojaNome: 'Empório Central', regiaoNome: 'Nordeste', prioridade: 'media',   custo: 31.00, status: 'criado' },
  { descricao: 'Medicamentos controlados para Belém',            lojaNome: 'Farmácia Saúde Já', regiaoNome: 'Norte',     prioridade: 'urgente', custo: 50.00, status: 'andamento' },
  { descricao: 'Suprimentos para evento em Curitiba',            lojaNome: 'Empório Central', regiaoNome: 'Sul',       prioridade: 'media',   custo: 38.50, status: 'enviado' },
  { descricao: 'Entrega rápida em Goiânia',                      lojaNome: 'Farmácia Saúde Já', regiaoNome: 'Centro-Oeste', prioridade: 'urgente', custo: 29.50, status: 'criado' },
  { descricao: 'Pedido especial no Rio de Janeiro',               lojaNome: 'Empório Central', regiaoNome: 'Sudeste',   prioridade: 'alta',    custo: 48.00, status: 'enviado' },
  { descricao: 'Pães artesanais para cliente em Santos',         lojaNome: 'Padaria Pão Quente', regiaoNome: 'Sudeste', prioridade: 'media',   custo: 22.00, status: 'criado' },
  { descricao: 'Bolos frescos para evento em Campinas',           lojaNome: 'Padaria Pão Quente', regiaoNome: 'Sudeste', prioridade: 'alta',    custo: 27.50, status: 'andamento' },
  { descricao: 'Café da tarde para entrega em Ribeirão Preto',    lojaNome: 'Padaria Pão Quente', regiaoNome: 'Sudeste', prioridade: 'baixa',   custo: 18.00, status: 'enviado' },
  { descricao: 'Notebook gamer para entrega em Brasília',         lojaNome: 'Tecno Shop', regiaoNome: 'Centro-Oeste', prioridade: 'alta',    custo: 120.00, status: 'andamento' },
  { descricao: 'Acessórios de informática para Goiânia',          lojaNome: 'Tecno Shop', regiaoNome: 'Centro-Oeste', prioridade: 'media',   custo: 60.00, status: 'criado' },
  { descricao: 'Monitor 4K para cliente em Curitiba',             lojaNome: 'Tecno Shop', regiaoNome: 'Sul',       prioridade: 'urgente', custo: 95.00, status: 'enviado' },
]

async function conectarComRetry(tentativasMax = 30, intervaloMs = 2000) {
  let ultimoErro
  for (let tentativa = 1; tentativa <= tentativasMax; tentativa++) {
    try {
      return await mysql.createConnection(config)
    } catch (err) {
      ultimoErro = err
      console.log(`[duck] Aguardando MySQL (${tentativa}/${tentativasMax})... ${err.code || err.message}`)
      await new Promise(r => setTimeout(r, intervaloMs))
    }
  }
  throw ultimoErro
}

async function aplicarSchema(conn) {
  const sqlPath = path.join(__dirname, 'db.sql')
  const sql = await fs.readFile(sqlPath, 'utf8')
  // db.sql faz DROP TABLE IF EXISTS + CREATE TABLE em todas as tabelas,
  // garantindo schema fresco e tabelas vazias antes dos inserts abaixo.
  await conn.query(sql)
  console.log('[duck] Schema aplicado a partir de db.sql.')
}

async function bancoJaPopulado(conn) {
  const [rows] = await conn.query('SELECT COUNT(*) AS total FROM usuarios')
  return rows[0].total > 0
}

async function limparTabelas(conn) {
  await conn.execute('SET FOREIGN_KEY_CHECKS = 0')
  await conn.execute('TRUNCATE TABLE entregas')
  await conn.execute('TRUNCATE TABLE lojas')
  await conn.execute('TRUNCATE TABLE regioes')
  await conn.execute('TRUNCATE TABLE usuarios')
  await conn.execute('SET FOREIGN_KEY_CHECKS = 1')
}

async function popular({ force = false } = {}) {
  const conn = await conectarComRetry()
  console.log('[duck] Conectado ao MySQL.')

  try {
    await aplicarSchema(conn)

    // Se o banco já tem dados e não foi pedido --force, preserva o que está lá.
    // Isso permite que cadastros feitos pela aplicação persistam entre boots.
    if (await bancoJaPopulado(conn)) {
      if (!force) {
        console.log('[duck] Banco já contém dados — seed pulado para preservar o que foi criado pela aplicação.')
        console.log('[duck] Para resetar e re-semear: npm run seed:force')
        return
      }
      console.log('[duck] --force: limpando tabelas antes de re-semear...')
      await limparTabelas(conn)
    }

    const ids = {}
    for (const u of usuarios) {
      const [result] = await conn.execute(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        [u.nome, u.email, u.senha, u.tipo]
      )
      ids[u.email] = result.insertId
    }
    console.log(`[duck] ${usuarios.length} usuários inseridos.`)

    const lojaIds = {}
    for (const l of lojas) {
      const [result] = await conn.execute(
        'INSERT INTO lojas (nome, endereco, telefone, usuario_id) VALUES (?, ?, ?, ?)',
        [l.nome, l.endereco, l.telefone, ids[l.emailDono]]
      )
      lojaIds[l.nome] = result.insertId
    }
    console.log(`[duck] ${lojas.length} lojas inseridas.`)

    const regiaoIds = {}
    for (const r of regioes) {
      const [result] = await conn.execute(
        'INSERT INTO regioes (nome, custo_base) VALUES (?, ?)',
        [r.nome, r.custoBase]
      )
      regiaoIds[r.nome] = result.insertId
    }
    console.log(`[duck] ${regioes.length} regiões inseridas.`)

    for (const e of entregas) {
      await conn.execute(
        'INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo, status) VALUES (?, ?, ?, ?, ?, ?)',
        [e.descricao, lojaIds[e.lojaNome], regiaoIds[e.regiaoNome], e.prioridade, e.custo, e.status]
      )
    }
    console.log(`[duck] ${entregas.length} entregas inseridas.`)

    console.log('\n[duck] Banco populado com sucesso!')
    console.log('\nCredenciais de acesso (senha 123456 para todos):')
    for (const u of usuarios) {
      console.log(`  ${u.email.padEnd(32)} | ${u.tipo}`)
    }
  } finally {
    await conn.end()
  }
}

const force = process.argv.includes('--force') || process.env.SEED_FORCE === '1'

popular({ force }).catch(err => {
  console.error('[duck] Erro ao popular o banco:', err.message)
  process.exit(1)
})
