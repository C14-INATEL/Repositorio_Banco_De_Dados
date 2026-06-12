const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function parseTests(fileContent) {
  const lines = fileContent.split(/\r?\n/);
  const tests = [];
  let current = { name: 'unnamed', sql: [] };

  function pushCurrent() {
    if (current.sql.length > 0 || current.name) {
      tests.push({ name: current.name.trim(), sql: current.sql.join('\n').trim() });
    }
  }

  for (const line of lines) {
    const m = line.match(/^\s*--\s*TESTE:\s*(.*)/i);
    if (m) {
      if (current.sql.length || current.name !== 'unnamed') pushCurrent();
      current = { name: m[1] || 'unnitled', sql: [] };
      continue;
    }
    current.sql.push(line);
  }

  pushCurrent();
  return tests.filter(t => t.sql && t.sql.length);
}

function runTestBlock(sqlBlock) {
  const args = ['exec', '-i', 'mysql-test', 'mysql', '-h', '127.0.0.1', '-uroot', '-proot', 'sistema_entregas', '-e', sqlBlock];
  const res = spawnSync('docker', args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  return {
    status: res.status === 0,
    stdout: res.stdout || '',
    stderr: res.stderr || ''
  };
}

function escapeXml(value) {
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateJUnit(testsuites) {
  let total = 0;
  let failures = 0;

  for (const suite of testsuites) {
    total += suite.testcases.length;
    failures += suite.testcases.filter(tc => tc.failure).length;
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `
<testsuites tests="${total}" failures="${failures}">\n`;

  for (const suite of testsuites) {
    xml += `  <testsuite name="${escapeXml(suite.name)}" tests="${suite.testcases.length}">\n`;
    for (const test of suite.testcases) {
      xml += `    <testcase classname="db.tests" name="${escapeXml(test.name)}">`;
      if (test.failure) {
        xml += `\n      <failure><![CDATA[${test.failure}]]></failure>\n    `;
      }
      xml += '</testcase>\n';
    }
    xml += '  </testsuite>\n';
  }

  xml += '</testsuites>\n';
  return xml;
}

function main() {
  const testsDir = path.resolve(__dirname, '..', 'tests');
  const reportDir = path.resolve(__dirname, '..', 'reports');

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const sqlFiles = fs.readdirSync(testsDir).filter(file => file.endsWith('.sql'));
  const testsuites = [];

  for (const file of sqlFiles) {
    const filePath = path.join(testsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const blocks = parseTests(content);
    const suite = { name: file, testcases: [] };

    for (const block of blocks) {
      const name = block.name || file;
      process.stdout.write(`Executando: ${file} -> ${name}... `);
      const result = runTestBlock(block.sql);
      if (result.status) {
        console.log('OK');
        suite.testcases.push({ name, failure: null });
      } else {
        console.log('FALHOU');
        const details = `stdout:\n${result.stdout}\n\nstderr:\n${result.stderr}`;
        suite.testcases.push({ name, failure: details });
      }
    }

    testsuites.push(suite);
  }

  const xml = generateJUnit(testsuites);
  const outputPath = path.join(reportDir, 'db-tests-report.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`\nRelatório gerado em: ${outputPath}`);
}

main();