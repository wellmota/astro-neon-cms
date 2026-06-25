// Cria (ou reseta) o primeiro editor admin.
//   node --env-file=.env scripts/seed-admin.mjs email@exemplo.com SuaSenha "Seu Nome"
// ou:  pnpm seed email@exemplo.com SuaSenha "Seu Nome"
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
const [email, password, name] = process.argv.slice(2);

if (!url) {
  console.error('DATABASE_URL ausente. Rode com: node --env-file=.env scripts/seed-admin.mjs <email> <senha> [nome]');
  process.exit(1);
}
if (!email || !password) {
  console.error('Uso: node --env-file=.env scripts/seed-admin.mjs <email> <senha> [nome]');
  process.exit(1);
}

const sql = neon(url);
const rows = await sql`
  INSERT INTO editors (email, name, role, password_hash, must_reset, active)
  VALUES (${email}, ${name ?? 'Admin'}, 'admin', crypt(${password}, gen_salt('bf', 10)), true, true)
  ON CONFLICT (email) DO UPDATE
    SET password_hash = crypt(${password}, gen_salt('bf', 10)), role = 'admin', active = true, must_reset = true
  RETURNING email
`;
console.log('✓ admin pronto:', rows[0].email, '— troque a senha no primeiro login.');
