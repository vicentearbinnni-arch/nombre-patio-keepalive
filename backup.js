// Backup semanal del schema dinein: llama a una función protegida por secreto propio
// (no usa la clave service_role) que arma el dump completo, y lo guarda en un bucket privado.
const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const BACKUP_SECRET = process.env.BACKUP_SECRET;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function notifyDiscord(message) {
  if (!DISCORD_WEBHOOK_URL) return;
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });
  } catch (e) { /* si falla Discord, no hay mucho más que hacer */ }
}

async function run() {
  if (!SUPABASE_URL || !ANON_KEY || !BACKUP_SECRET) {
    await notifyDiscord('⚠️ Backup de Patio: faltan variables de entorno.');
    process.exit(1);
  }

  try {
    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/export_backup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ p_secret: BACKUP_SECRET }),
    });
    if (!rpcRes.ok) throw new Error(`export_backup falló: ${rpcRes.status} ${await rpcRes.text()}`);
    const dump = await rpcRes.json();

    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `backup-${stamp}.json`;
    const content = JSON.stringify(dump, null, 2);

    const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/dinein-backups/${filename}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'x-upsert': 'true',
      },
      body: content,
    });
    if (!uploadRes.ok) throw new Error(`Subida falló: ${uploadRes.status} ${await uploadRes.text()}`);

    console.log(`Backup OK: ${filename}`);
  } catch (err) {
    console.error('Backup falló:', err.message);
    await notifyDiscord(`🔴 Falló el backup semanal de Patio: ${err.message}`);
    process.exit(1);
  }
}

run();
