const mysql = require('mysql2/promise')
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'sistema_entregas',
}

// Dados esperados após população
const dadosEsperados = {
  usuarios: 7,
  lojas: 4,
  regioes: 5,
  entregas: 16,
}

describe('Suite de Testes: popular_banco.js', () => {
  let conn

  // Setup: conectar antes de todos os testes
  beforeAll(async () => {
    conn = await mysql.createConnection(config)
  })

  // Teardown: desconectar após todos os testes
  afterAll(async () => {
    if (conn) {
      await conn.end()
    }
  })

  // 1. TESTES DE CONEXÃO
  describe('Conexão ao Banco de Dados', () => {
    test('Deve conectar ao banco de dados com sucesso', async () => {
      const testConn = await mysql.createConnection(config)
      expect(testConn).toBeDefined()
      await testConn.end()
    })

    test('Deve rejeitar conexão com credenciais inválidas', async () => {
      const invalidConfig = { ...config, password: 'senhaErrada' }
      await expect(mysql.createConnection(invalidConfig)).rejects.toThrow()
    })

    test('Banco de dados "sistema_entregas" deve existir', async () => {
      const [rows] = await conn.execute('SELECT DATABASE()')
      expect(rows[0]['DATABASE()']).toBe('sistema_entregas')
    })
  })

  // 2. TESTES DE ESTRUTURA DE TABELAS
  describe('Estrutura de Tabelas', () => {
    test('Tabela "usuarios" deve existir', async () => {
      const [rows] = await conn.execute(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'sistema_entregas' AND TABLE_NAME = 'usuarios'"
      )
      expect(rows.length).toBe(1)
    })

    test('Tabela "lojas" deve existir', async () => {
      const [rows] = await conn.execute(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'sistema_entregas' AND TABLE_NAME = 'lojas'"
      )
      expect(rows.length).toBe(1)
    })

    test('Tabela "regioes" deve existir', async () => {
      const [rows] = await conn.execute(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'sistema_entregas' AND TABLE_NAME = 'regioes'"
      )
      expect(rows.length).toBe(1)
    })

    test('Tabela "entregas" deve existir', async () => {
      const [rows] = await conn.execute(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'sistema_entregas' AND TABLE_NAME = 'entregas'"
      )
      expect(rows.length).toBe(1)
    })

    test('Colunas de "usuarios" devem ter tipos corretos', async () => {
      const [cols] = await conn.execute(
        "SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'usuarios'"
      )
      const typeMap = Object.fromEntries(cols.map(c => [c.COLUMN_NAME, c.COLUMN_TYPE]))
      
      expect(typeMap.id).toMatch(/int/i)
      expect(typeMap.email).toMatch(/varchar/i)
      expect(typeMap.tipo).toMatch(/enum/i)
    })
  })

  // 3. TESTES DE POPULAÇÃO: USUÁRIOS
  describe('População de Usuários', () => {
    beforeAll(async () => {
      // Limpar dados antes de testar
      await conn.execute('SET FOREIGN_KEY_CHECKS = 0')
      await conn.execute('TRUNCATE TABLE usuarios')
      await conn.execute('SET FOREIGN_KEY_CHECKS = 1')
    })

    test('Inserir usuário admin com dados válidos', async () => {
      const [result] = await conn.execute(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['Lucas Martins', 'lucas.martins@duck.com', '123456', 'admin']
      )
      expect(result.insertId).toBeGreaterThan(0)
    })

    test('Inserir usuário lojista com dados válidos', async () => {
      const [result] = await conn.execute(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['Ana Paula Santos', 'ana.santos@email.com', '123456', 'lojista']
      )
      expect(result.insertId).toBeGreaterThan(0)
    })

    test('Não deve permitir email duplicado', async () => {
      await conn.execute(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['Test User', 'test.duplicate@email.com', '123456', 'operador']
      )
      
      await expect(
        conn.execute(
          'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
          ['Another Test', 'test.duplicate@email.com', '123456', 'lojista']
        )
      ).rejects.toThrow()
    })

    test('Tipo deve ser um dos enums válidos', async () => {
      await expect(
        conn.execute(
          'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
          ['Invalid Type', 'invalid.type@email.com', '123456', 'superadmin']
        )
      ).rejects.toThrow()
    })

    test('Não deve permitir email vazio', async () => {
      await expect(
        conn.execute(
          'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
          ['No Email User', '', '123456', 'operador']
        )
      ).rejects.toThrow()
    })

    test('Campo ativo deve ter default TRUE', async () => {
      const [result] = await conn.execute(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['Active Test', 'active.test@email.com', '123456', 'operador']
      )
      
      const [rows] = await conn.execute(
        'SELECT ativo FROM usuarios WHERE id = ?',
        [result.insertId]
      )
      expect(rows[0].ativo).toBe(1) // TRUE = 1
    })

    test('Data de criação deve ser preenchida automaticamente', async () => {
      const [result] = await conn.execute(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['Date Test', 'date.test@email.com', '123456', 'lojista']
      )
      
      const [rows] = await conn.execute(
        'SELECT data_criacao FROM usuarios WHERE id = ?',
        [result.insertId]
      )
      expect(rows[0].data_criacao).toBeDefined()
      expect(rows[0].data_criacao).toBeInstanceOf(Date)
    })
  })

  // 4. TESTES DE POPULAÇÃO: REGIÕES
  describe('População de Regiões', () => {
    beforeAll(async () => {
      await conn.execute('SET FOREIGN_KEY_CHECKS = 0')
      await conn.execute('TRUNCATE TABLE regioes')
      await conn.execute('SET FOREIGN_KEY_CHECKS = 1')
    })

    test('Inserir região com nome e custo_base válidos', async () => {
      const [result] = await conn.execute(
        'INSERT INTO regioes (nome, custo_base) VALUES (?, ?)',
        ['Sudeste', 28.00]
      )
      expect(result.insertId).toBeGreaterThan(0)
    })

    test('Todas as 5 regiões devem ser inseridas corretamente', async () => {
      const regioes = [
        { nome: 'Norte', custoBase: 35.00 },
        { nome: 'Nordeste', custoBase: 30.00 },
        { nome: 'Centro-Oeste', custoBase: 32.50 },
        { nome: 'Sul', custoBase: 33.00 },
      ]

      for (const r of regioes) {
        const [result] = await conn.execute(
          'INSERT INTO regioes (nome, custo_base) VALUES (?, ?)',
          [r.nome, r.custoBase]
        )
        expect(result.insertId).toBeGreaterThan(0)
      }

      const [rows] = await conn.execute('SELECT COUNT(*) as count FROM regioes')
      expect(rows[0].count).toBeGreaterThanOrEqual(5)
    })

    test('Custo base não deve ser negativo', async () => {
      await expect(
        conn.execute(
          'INSERT INTO regioes (nome, custo_base) VALUES (?, ?)',
          ['Invalid Region', -10.00]
        )
      ).rejects.toThrow() // Depend do CHECK constraint no DB
    })

    test('Nome de região não deve ser vazio', async () => {
      await expect(
        conn.execute(
          'INSERT INTO regioes (nome, custo_base) VALUES (?, ?)',
          ['', 25.00]
        )
      ).rejects.toThrow()
    })
  })

  // 5. TESTES DE POPULAÇÃO: LOJAS
  describe('População de Lojas', () => {
    let usuarioAdminId

    beforeAll(async () => {
      await conn.execute('SET FOREIGN_KEY_CHECKS = 0')
      await conn.execute('TRUNCATE TABLE lojas')
      await conn.execute('TRUNCATE TABLE usuarios')
      await conn.execute('SET FOREIGN_KEY_CHECKS = 1')

      // Inserir usuário para testar FK
      const [result] = await conn.execute(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['Lojista Test', 'lojista.test@email.com', '123456', 'lojista']
      )
      usuarioAdminId = result.insertId
    })

    test('Inserir loja vinculada a usuário válido', async () => {
      const [result] = await conn.execute(
        'INSERT INTO lojas (nome, endereco, telefone, usuario_id) VALUES (?, ?, ?, ?)',
        ['Test Shop', 'Rua Test, 123', '11 99999-9999', usuarioAdminId]
      )
      expect(result.insertId).toBeGreaterThan(0)
    })

    test('Não deve permitir loja com usuario_id inválido (FK violation)', async () => {
      await expect(
        conn.execute(
          'INSERT INTO lojas (nome, endereco, telefone, usuario_id) VALUES (?, ?, ?, ?)',
          ['Invalid Shop', 'Rua Invalid, 456', '11 88888-8888', 99999]
        )
      ).rejects.toThrow()
    })

    test('Loja com usuario_id NULL deve ser aceita (opcional)', async () => {
      const [result] = await conn.execute(
        'INSERT INTO lojas (nome, endereco, telefone, usuario_id) VALUES (?, ?, ?, ?)',
        ['Orphan Shop', 'Rua Orphan, 789', '11 77777-7777', null]
      )
      expect(result.insertId).toBeGreaterThan(0)
    })

    test('Nome e endereço não devem ser vazios', async () => {
      await expect(
        conn.execute(
          'INSERT INTO lojas (nome, endereco, telefone, usuario_id) VALUES (?, ?, ?, ?)',
          ['', 'Rua Valid, 001', '11 66666-6666', usuarioAdminId]
        )
      ).rejects.toThrow()
    })
  })

  // 6. TESTES DE POPULAÇÃO: ENTREGAS
  describe('População de Entregas', () => {
    let lojaId, regiaoId

    beforeAll(async () => {
      await conn.execute('SET FOREIGN_KEY_CHECKS = 0')
      await conn.execute('TRUNCATE TABLE entregas')
      await conn.execute('TRUNCATE TABLE lojas')
      await conn.execute('TRUNCATE TABLE usuarios')
      await conn.execute('TRUNCATE TABLE regioes')
      await conn.execute('SET FOREIGN_KEY_CHECKS = 1')

      // Setup: inserir usuário, loja e região
      const [userData] = await conn.execute(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['Setup User', 'setup.user@email.com', '123456', 'lojista']
      )
      
      const [lojaData] = await conn.execute(
        'INSERT INTO lojas (nome, endereco, telefone, usuario_id) VALUES (?, ?, ?, ?)',
        ['Setup Shop', 'Rua Setup, 123', '11 11111-1111', userData.insertId]
      )
      lojaId = lojaData.insertId

      const [regiaoData] = await conn.execute(
        'INSERT INTO regioes (nome, custo_base) VALUES (?, ?)',
        ['Setup Region', 25.00]
      )
      regiaoId = regiaoData.insertId
    })

    test('Inserir entrega com dados válidos', async () => {
      const [result] = await conn.execute(
        'INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['Test Delivery', lojaId, regiaoId, 'alta', 50.00, 'criado']
      )
      expect(result.insertId).toBeGreaterThan(0)
    })

    test('Status deve ser um dos valores enum válidos', async () => {
      const statusValidos = ['criado', 'andamento', 'enviado', 'entregue', 'cancelado']
      
      for (const status of statusValidos) {
        const [result] = await conn.execute(
          'INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo, status) VALUES (?, ?, ?, ?, ?, ?)',
          [`Delivery ${status}`, lojaId, regiaoId, 'media', 30.00, status]
        )
        expect(result.insertId).toBeGreaterThan(0)
      }
    })

    test('Prioridade deve ser um dos valores enum válidos', async () => {
      const prioridades = ['baixa', 'media', 'alta', 'urgente']
      
      for (const prio of prioridades) {
        const [result] = await conn.execute(
          'INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo, status) VALUES (?, ?, ?, ?, ?, ?)',
          [`Prio ${prio}`, lojaId, regiaoId, prio, 40.00, 'criado']
        )
        expect(result.insertId).toBeGreaterThan(0)
      }
    })

    test('Não deve permitir entrega com loja_id inválido (FK violation)', async () => {
      await expect(
        conn.execute(
          'INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo, status) VALUES (?, ?, ?, ?, ?, ?)',
          ['Invalid Loja', 99999, regiaoId, 'alta', 50.00, 'criado']
        )
      ).rejects.toThrow()
    })

    test('Não deve permitir entrega com regiao_id inválido (FK violation)', async () => {
      await expect(
        conn.execute(
          'INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo, status) VALUES (?, ?, ?, ?, ?, ?)',
          ['Invalid Regiao', lojaId, 99999, 'alta', 50.00, 'criado']
        )
      ).rejects.toThrow()
    })

    test('Custo não deve ser negativo', async () => {
      await expect(
        conn.execute(
          'INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo, status) VALUES (?, ?, ?, ?, ?, ?)',
          ['Negative Cost', lojaId, regiaoId, 'alta', -50.00, 'criado']
        )
      ).rejects.toThrow()
    })

    test('Data_pedido deve ser preenchida automaticamente', async () => {
      const [result] = await conn.execute(
        'INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['Auto Date', lojaId, regiaoId, 'media', 35.00, 'criado']
      )

      const [rows] = await conn.execute(
        'SELECT data_pedido FROM entregas WHERE id = ?',
        [result.insertId]
      )
      expect(rows[0].data_pedido).toBeDefined()
      expect(rows[0].data_pedido).toBeInstanceOf(Date)
    })

    test('Data_entrega deve ser NULL quando status = criado', async () => {
      const [result] = await conn.execute(
        'INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['No Delivery Date', lojaId, regiaoId, 'alta', 45.00, 'criado']
      )

      const [rows] = await conn.execute(
        'SELECT data_entrega FROM entregas WHERE id = ?',
        [result.insertId]
      )
      expect(rows[0].data_entrega).toBeNull()
    })
  })

  // 7. TESTES DE RASTREABILIDADE
  describe('Rastreabilidade: Histórias → Testes → Código', () => {
    test('US-001: Registrar entrega - usuário operador pode criar', async () => {
      // Limpar
      await conn.execute('SET FOREIGN_KEY_CHECKS = 0')
      await conn.execute('TRUNCATE TABLE entregas')
      await conn.execute('TRUNCATE TABLE lojas')
      await conn.execute('TRUNCATE TABLE usuarios')
      await conn.execute('TRUNCATE TABLE regioes')
      await conn.execute('SET FOREIGN_KEY_CHECKS = 1')

      // Setup
      const [userData] = await conn.execute(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['Operador', 'operador@test.com', '123456', 'operador']
      )
      const [lojaData] = await conn.execute(
        'INSERT INTO lojas (nome, endereco, telefone, usuario_id) VALUES (?, ?, ?, ?)',
        ['Test Loja', 'Rua Test, 123', '11 99999-9999', userData.insertId]
      )
      const [regiaoData] = await conn.execute(
        'INSERT INTO regioes (nome, custo_base) VALUES (?, ?)',
        ['Test Region', 25.00]
      )

      // Test
      const [result] = await conn.execute(
        'INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['US-001 Test', lojaData.insertId, regiaoData.insertId, 'alta', 50.00, 'criado']
      )

      const [rows] = await conn.execute(
        'SELECT id, status, data_pedido FROM entregas WHERE id = ?',
        [result.insertId]
      )

      // Assertions
      expect(rows[0].status).toBe('criado')
      expect(rows[0].data_pedido).toBeDefined()
    })

    test('US-002: Atualizar status - transição válida criado → andamento', async () => {
      // Setup
      await conn.execute('SET FOREIGN_KEY_CHECKS = 0')
      await conn.execute('TRUNCATE TABLE entregas')
      await conn.execute('TRUNCATE TABLE lojas')
      await conn.execute('TRUNCATE TABLE usuarios')
      await conn.execute('TRUNCATE TABLE regioes')
      await conn.execute('SET FOREIGN_KEY_CHECKS = 1')

      const [userData] = await conn.execute(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['Operador2', 'operador2@test.com', '123456', 'operador']
      )
      const [lojaData] = await conn.execute(
        'INSERT INTO lojas (nome, endereco, telefone, usuario_id) VALUES (?, ?, ?, ?)',
        ['Test Loja 2', 'Rua Test 2, 456', '11 88888-8888', userData.insertId]
      )
      const [regiaoData] = await conn.execute(
        'INSERT INTO regioes (nome, custo_base) VALUES (?, ?)',
        ['Test Region 2', 30.00]
      )
      const [entregaData] = await conn.execute(
        'INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['US-002 Test', lojaData.insertId, regiaoData.insertId, 'alta', 50.00, 'criado']
      )

      // Test: update status
      const [updateResult] = await conn.execute(
        'UPDATE entregas SET status = ? WHERE id = ?',
        ['andamento', entregaData.insertId]
      )
      expect(updateResult.affectedRows).toBe(1)

      // Verify
      const [rows] = await conn.execute(
        'SELECT status FROM entregas WHERE id = ?',
        [entregaData.insertId]
      )
      expect(rows[0].status).toBe('andamento')
    })

    test('US-003: Listar entregas por região - agregação de dados', async () => {
      // Setup
      await conn.execute('SET FOREIGN_KEY_CHECKS = 0')
      await conn.execute('TRUNCATE TABLE entregas')
      await conn.execute('TRUNCATE TABLE lojas')
      await conn.execute('TRUNCATE TABLE usuarios')
      await conn.execute('TRUNCATE TABLE regioes')
      await conn.execute('SET FOREIGN_KEY_CHECKS = 1')

      const [userData] = await conn.execute(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['Lojista3', 'lojista3@test.com', '123456', 'lojista']
      )
      const [lojaData] = await conn.execute(
        'INSERT INTO lojas (nome, endereco, telefone, usuario_id) VALUES (?, ?, ?, ?)',
        ['Test Loja 3', 'Rua Test 3, 789', '11 77777-7777', userData.insertId]
      )
      const [regiaoData] = await conn.execute(
        'INSERT INTO regioes (nome, custo_base) VALUES (?, ?)',
        ['Sudeste', 28.00]
      )

      // Insert 3 entregas
      for (let i = 0; i < 3; i++) {
        await conn.execute(
          'INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo, status) VALUES (?, ?, ?, ?, ?, ?)',
          [`Entrega ${i}`, lojaData.insertId, regiaoData.insertId, 'alta', 50.00, 'criado']
        )
      }

      // Test: query agregada por região
      const [rows] = await conn.execute(`
        SELECT 
          r.nome as regiao,
          COUNT(e.id) as total_entregas,
          SUM(e.custo) as custo_total,
          AVG(e.custo) as custo_medio
        FROM regioes r
        LEFT JOIN entregas e ON r.id = e.regiao_id
        WHERE r.nome = 'Sudeste'
        GROUP BY r.id
      `)

      expect(rows.length).toBe(1)
      expect(rows[0].total_entregas).toBe(3)
      expect(Number(rows[0].custo_total)).toBe(150)
      expect(Number(rows[0].custo_medio)).toBe(50)
    })
  })

  // 8. TESTES DE INTEGRIDADE
  describe('Integridade Referencial e Relacionamentos', () => {
    beforeAll(async () => {
      await conn.execute('SET FOREIGN_KEY_CHECKS = 0')
      await conn.execute('TRUNCATE TABLE entregas')
      await conn.execute('TRUNCATE TABLE lojas')
      await conn.execute('TRUNCATE TABLE usuarios')
      await conn.execute('TRUNCATE TABLE regioes')
      await conn.execute('SET FOREIGN_KEY_CHECKS = 1')
    })

    test('Cada loja deve estar vinculada a um usuário válido', async () => {
      const [userData] = await conn.execute(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['User Integridade', 'user.integridade@email.com', '123456', 'lojista']
      )

      const [lojaData] = await conn.execute(
        'INSERT INTO lojas (nome, endereco, telefone, usuario_id) VALUES (?, ?, ?, ?)',
        ['Loja Integridade', 'Rua Integridade, 123', '11 12345-6789', userData.insertId]
      )

      const [rows] = await conn.execute(
        'SELECT u.id, u.tipo FROM lojas l JOIN usuarios u ON l.usuario_id = u.id WHERE l.id = ?',
        [lojaData.insertId]
      )

      expect(rows.length).toBe(1)
      expect(rows[0].tipo).toBe('lojista')
    })

    test('Cada entrega deve estar vinculada a uma loja e região válidas', async () => {
      const [userData] = await conn.execute(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['User Entrega', 'user.entrega@email.com', '123456', 'lojista']
      )

      const [lojaData] = await conn.execute(
        'INSERT INTO lojas (nome, endereco, telefone, usuario_id) VALUES (?, ?, ?, ?)',
        ['Loja Entrega', 'Rua Entrega, 456', '11 98765-4321', userData.insertId]
      )

      const [regiaoData] = await conn.execute(
        'INSERT INTO regioes (nome, custo_base) VALUES (?, ?)',
        ['Nordeste', 30.00]
      )

      const [entregaData] = await conn.execute(
        'INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['Entrega Integridade', lojaData.insertId, regiaoData.insertId, 'urgente', 60.00, 'criado']
      )

      const [rows] = await conn.execute(
        'SELECT l.nome as loja, r.nome as regiao FROM entregas e JOIN lojas l ON e.loja_id = l.id JOIN regioes r ON e.regiao_id = r.id WHERE e.id = ?',
        [entregaData.insertId]
      )

      expect(rows.length).toBe(1)
      expect(rows[0].loja).toBe('Loja Entrega')
      expect(rows[0].regiao).toBe('Nordeste')
    })

    test('Consistência: FK constraints devem impedir orfãos', async () => {
      // Tenta inserir com loja_id inválido
      await expect(
        conn.execute(
          'INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo, status) VALUES (?, ?, ?, ?, ?, ?)',
          ['Orfão', 999999, 1, 'alta', 50.00, 'criado']
        )
      ).rejects.toThrow()
    })
  })

  // 9. TESTES DE POPULAÇÃO COMPLETA
  describe('Cenário de População Completa', () => {
    beforeAll(async () => {
      // Limpar banco
      await conn.execute('SET FOREIGN_KEY_CHECKS = 0')
      await conn.execute('TRUNCATE TABLE entregas')
      await conn.execute('TRUNCATE TABLE lojas')
      await conn.execute('TRUNCATE TABLE usuarios')
      await conn.execute('TRUNCATE TABLE regioes')
      await conn.execute('SET FOREIGN_KEY_CHECKS = 1')
    })

    test('Após população esperada: devem existir 7 usuários', async () => {
      const usuarios = [
        { nome: 'Lucas Martins', email: 'lucas.martins@duck.com', senha: '123456', tipo: 'admin' },
        { nome: 'Fernanda Lima', email: 'fernanda.lima@duck.com', senha: '123456', tipo: 'operador' },
        { nome: 'Diego Rodrigues', email: 'diego.rodrigues@duck.com', senha: '123456', tipo: 'operador' },
        { nome: 'Ana Paula Santos', email: 'ana.santos@email.com', senha: '123456', tipo: 'lojista' },
        { nome: 'Roberto Campos', email: 'roberto.campos@email.com', senha: '123456', tipo: 'lojista' },
        { nome: 'Mariana Figueiredo', email: 'mariana.figueiredo@email.com', senha: '123456', tipo: 'lojista' },
        { nome: 'Carlos Nogueira', email: 'carlos.nogueira@email.com', senha: '123456', tipo: 'lojista' },
      ]

      for (const u of usuarios) {
        await conn.execute(
          'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
          [u.nome, u.email, u.senha, u.tipo]
        )
      }

      const [rows] = await conn.execute('SELECT COUNT(*) as count FROM usuarios')
      expect(rows[0].count).toBe(7)
    })

    test('Após população esperada: devem existir 5 regiões', async () => {
      const regioes = [
        { nome: 'Norte', custoBase: 35.00 },
        { nome: 'Nordeste', custoBase: 30.00 },
        { nome: 'Centro-Oeste', custoBase: 32.50 },
        { nome: 'Sudeste', custoBase: 28.00 },
        { nome: 'Sul', custoBase: 33.00 },
      ]

      for (const r of regioes) {
        await conn.execute(
          'INSERT INTO regioes (nome, custo_base) VALUES (?, ?)',
          [r.nome, r.custoBase]
        )
      }

      const [rows] = await conn.execute('SELECT COUNT(*) as count FROM regioes')
      expect(rows[0].count).toBe(5)
    })

    test('Após população esperada: devem existir 4 lojas', async () => {
      // Get user IDs
      const [users] = await conn.execute('SELECT id, email FROM usuarios')
      const userMap = Object.fromEntries(users.map(u => [u.email, u.id]))

      const lojas = [
        { nome: 'Empório Central', endereco: 'Av. Paulista, 1842', telefone: '11 93271-4455', emailDono: 'ana.santos@email.com' },
        { nome: 'Farmácia Saúde Já', endereco: 'Rua Augusta, 374', telefone: '11 97834-2210', emailDono: 'roberto.campos@email.com' },
        { nome: 'Padaria Pão Quente', endereco: 'Rua 13 de Maio, 200', telefone: '11 99123-4455', emailDono: 'mariana.figueiredo@email.com' },
        { nome: 'Tecno Shop', endereco: 'Av. das Américas, 5000', telefone: '21 99876-5432', emailDono: 'carlos.nogueira@email.com' },
      ]

      for (const l of lojas) {
        await conn.execute(
          'INSERT INTO lojas (nome, endereco, telefone, usuario_id) VALUES (?, ?, ?, ?)',
          [l.nome, l.endereco, l.telefone, userMap[l.emailDono]]
        )
      }

      const [rows] = await conn.execute('SELECT COUNT(*) as count FROM lojas')
      expect(rows[0].count).toBe(4)
    })

    test('Após população esperada: devem existir 16 entregas', async () => {
      // Get lojas and regioes
      const [lojas] = await conn.execute('SELECT id, nome FROM lojas')
      const lojaMap = Object.fromEntries(lojas.map(l => [l.nome, l.id]))

      const [regioes] = await conn.execute('SELECT id, nome FROM regioes')
      const regiaoMap = Object.fromEntries(regioes.map(r => [r.nome, r.id]))

      const entregas = [
        { descricao: 'Cesta de café da manhã para cliente em Manaus', lojaNome: 'Empório Central', regiaoNome: 'Norte', prioridade: 'alta', custo: 42.50, status: 'criado' },
        { descricao: 'Remédio urgente para paciente em Recife', lojaNome: 'Farmácia Saúde Já', regiaoNome: 'Nordeste', prioridade: 'urgente', custo: 28.00, status: 'andamento' },
        { descricao: 'Alimentos congelados para Brasília', lojaNome: 'Empório Central', regiaoNome: 'Centro-Oeste', prioridade: 'media', custo: 35.00, status: 'enviado' },
        { descricao: 'Medicamentos para entrega em Porto Alegre', lojaNome: 'Farmácia Saúde Já', regiaoNome: 'Sul', prioridade: 'alta', custo: 45.00, status: 'criado' },
        { descricao: 'Kit festa para cliente em São Paulo', lojaNome: 'Empório Central', regiaoNome: 'Sudeste', prioridade: 'alta', custo: 55.00, status: 'andamento' },
        { descricao: 'Produtos de beleza para Salvador', lojaNome: 'Empório Central', regiaoNome: 'Nordeste', prioridade: 'media', custo: 31.00, status: 'criado' },
        { descricao: 'Medicamentos controlados para Belém', lojaNome: 'Farmácia Saúde Já', regiaoNome: 'Norte', prioridade: 'urgente', custo: 50.00, status: 'andamento' },
        { descricao: 'Suprimentos para evento em Curitiba', lojaNome: 'Empório Central', regiaoNome: 'Sul', prioridade: 'media', custo: 38.50, status: 'enviado' },
        { descricao: 'Entrega rápida em Goiânia', lojaNome: 'Farmácia Saúde Já', regiaoNome: 'Centro-Oeste', prioridade: 'urgente', custo: 29.50, status: 'criado' },
        { descricao: 'Pedido especial no Rio de Janeiro', lojaNome: 'Empório Central', regiaoNome: 'Sudeste', prioridade: 'alta', custo: 48.00, status: 'enviado' },
        { descricao: 'Pães artesanais para cliente em Santos', lojaNome: 'Padaria Pão Quente', regiaoNome: 'Sudeste', prioridade: 'media', custo: 22.00, status: 'criado' },
        { descricao: 'Bolos frescos para evento em Campinas', lojaNome: 'Padaria Pão Quente', regiaoNome: 'Sudeste', prioridade: 'alta', custo: 27.50, status: 'andamento' },
        { descricao: 'Café da tarde para entrega em Ribeirão Preto', lojaNome: 'Padaria Pão Quente', regiaoNome: 'Sudeste', prioridade: 'baixa', custo: 18.00, status: 'enviado' },
        { descricao: 'Notebook gamer para entrega em Brasília', lojaNome: 'Tecno Shop', regiaoNome: 'Centro-Oeste', prioridade: 'alta', custo: 120.00, status: 'andamento' },
        { descricao: 'Acessórios de informática para Goiânia', lojaNome: 'Tecno Shop', regiaoNome: 'Centro-Oeste', prioridade: 'media', custo: 60.00, status: 'criado' },
        { descricao: 'Monitor 4K para cliente em Curitiba', lojaNome: 'Tecno Shop', regiaoNome: 'Sul', prioridade: 'urgente', custo: 95.00, status: 'enviado' },
      ]

      for (const e of entregas) {
        await conn.execute(
          'INSERT INTO entregas (descricao, loja_id, regiao_id, prioridade, custo, status) VALUES (?, ?, ?, ?, ?, ?)',
          [e.descricao, lojaMap[e.lojaNome], regiaoMap[e.regiaoNome], e.prioridade, e.custo, e.status]
        )
      }

      const [rows] = await conn.execute('SELECT COUNT(*) as count FROM entregas')
      expect(rows[0].count).toBe(16)
    })

    test('Validar que todas as entregas possuem loja e região válidas', async () => {
      const [rows] = await conn.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN e.loja_id IS NOT NULL THEN 1 ELSE 0 END) as com_loja,
          SUM(CASE WHEN e.regiao_id IS NOT NULL THEN 1 ELSE 0 END) as com_regiao
        FROM entregas e
      `)

      expect(String(rows[0].total)).toBe(String(rows[0].com_loja))
      expect(String(rows[0].total)).toBe(String(rows[0].com_regiao))
    })

    test('Validar distribuição de entregas por status', async () => {
      const [rows] = await conn.execute(`
        SELECT status, COUNT(*) as count FROM entregas GROUP BY status ORDER BY status
      `)

      expect(rows.length).toBeGreaterThan(0)
      rows.forEach(row => {
        expect(['criado', 'andamento', 'enviado', 'entregue', 'cancelado']).toContain(row.status)
      })
    })
  })
})
