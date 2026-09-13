// Diagnóstico de recuperação de senha (emails cadastrados + tabela de tokens + Resend).
// Uso (a partir da pasta server/):  npx tsx scripts/debug-recovery.ts
import 'dotenv/config';
import mysql from 'mysql2/promise';
import { Resend } from 'resend';

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST ?? 'localhost',
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE ?? 'biolink_studio',
  });

  const [users] = await conn.execute('SELECT id, email, name FROM users ORDER BY id');
  console.log('=== USUÁRIOS CADASTRADOS ===');
  for (const u of users as any[]) {
    console.log(`  id=${u.id}  email=${u.email}  nome=${u.name ?? '-'}`);
  }
  if (!(users as any[]).length) console.log('  (nenhum usuário)');

  const [tables] = await conn.execute("SHOW TABLES LIKE 'password_reset_tokens'");
  console.log('\n=== TABELA password_reset_tokens ===');
  console.log((tables as any[]).length ? '  existe' : '  NÃO EXISTE (rode a migração do schema.sql)');

  try {
    const [tokens] = await conn.execute(
      'SELECT id, user_id, expires_at, used FROM password_reset_tokens ORDER BY id DESC LIMIT 10'
    );
    console.log('\n=== TOKENS RECENTES ===');
    if ((tokens as any[]).length) {
      for (const t of tokens as any[]) console.log(`  id=${t.id} user_id=${t.user_id} usado=${t.used} expira=${t.expires_at}`);
    } else {
      console.log('  (nenhum token gerado ainda)');
    }
  } catch (e: any) {
    console.log('\n  (erro ao ler tokens: ' + e?.message + ')');
  }

  await conn.end();

  console.log('\n=== RESEND ===');
  const key = process.env.RESEND_API_KEY ?? '';
  console.log('  RESEND_API_KEY:', key ? `presente (${key.slice(0, 10)}...)` : 'AUSENTE');
  console.log('  RESEND_FROM:', process.env.RESEND_FROM ?? '(vazio)');
  try {
    const resend = new Resend(key);
    const domains = await resend.domains.list();
    const data = (domains as any)?.data ?? [];
    console.log('  domínios verificados:', data.length ? data.map((d: any) => d.name).join(', ') : '(nenhum)');
  } catch (e: any) {
    console.log('  ERRO ao listar domínios:', e?.message);
  }
}

main().catch((e) => {
  console.error('ERRO:', e);
  process.exit(1);
});
