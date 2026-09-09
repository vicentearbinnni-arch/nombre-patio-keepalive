const SUPABASE_URL = "https://orjqoqqsaxjkglebytwd.supabase.co/rest/v1/rpc/get_menu";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yanFvcXFzYXhqa2dsZWJ5dHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTY3NjksImV4cCI6MjEwNDA3Mjc2OX0.9wAi63lrnSbmzhw-WgjX7o-OR758t_k5YmLQpXXrSvM";
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1547223196602728648/_BriTCDjXJw6E1FArG16aRrWhl81_UzwJ8m_z3Pmb8IA0BrqWH2cN8-sX9etHO6WgaJw";

async function avisarDiscord(mensaje) {
  await fetch(DISCORD_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: mensaje })
  });
}

try {
  const res = await fetch(SUPABASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Content-Profile": "dinein"
    },
    body: JSON.stringify({ p_restaurant_id: "72bf084a-0064-47ed-9ff0-47f0c4ae9dda" })
  });

  if (!res.ok) {
    await avisarDiscord(`🔴 **Patio — algo anda mal**\nSupabase respondió con error ${res.status}. Revisá el proyecto.`);
    console.log("Ping falló:", res.status);
  } else {
    console.log("Ping a Supabase OK:", res.status);
  }
} catch (err) {
  await avisarDiscord(`🔴 **Patio — no se pudo conectar**\n${err.message}`);
  console.log("Error de conexión:", err.message);
}
