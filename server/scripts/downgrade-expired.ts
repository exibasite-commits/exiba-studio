// Rebaixa assinaturas pro expiradas (para ser chamado por cron na VPS).
// Uso (a partir da pasta server/):  npx tsx scripts/downgrade-expired.ts
import 'dotenv/config';
import { downgradeExpiredSubscriptions, pool } from '../src/db';

async function main() {
  const count = await downgradeExpiredSubscriptions();
  console.log(`${count} assinatura(s) expirada(s) rebaixada(s) para free.`);
  await pool.end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
