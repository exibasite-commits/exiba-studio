// Torna um usuário administrador (users.is_admin = true) direto no banco.
// Uso (a partir da pasta server/):  npx tsx scripts/make-admin.ts seu@email.com
import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  const email = (process.argv[2] ?? '').toLowerCase().trim();
  if (!email) {
    console.error('Uso: npx tsx scripts/make-admin.ts <email>');
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST ?? 'localhost',
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE ?? 'biolink_studio',
  });

  const [rows] = await conn.execute('SELECT id, email FROM users WHERE email = ?', [email]);
  const user = (rows as { id: number; email: string }[])[0];

  if (!user) {
    console.error(`Usuário "${email}" não encontrado no banco.`);
    await conn.end();
    process.exit(1);
  }

  await conn.execute('UPDATE users SET is_admin = TRUE WHERE id = ?', [user.id]);
  console.log(`OK — usuário "${user.email}" (id ${user.id}) agora é administrador.`);
  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
