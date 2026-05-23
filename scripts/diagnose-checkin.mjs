/**
 * Diagnose guest check-in (spots RLS, guest_checkin RPC).
 * Usage: node scripts/diagnose-checkin.mjs [spot_id]
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    /* ignore */
  }
}

loadEnv();
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("Missing VITE_SUPABASE_URL / ANON_KEY in .env.local");
  process.exit(1);
}

const db = createClient(url, key);
const spotIdArg = process.argv[2];

async function main() {
  console.log("── Spots (anon, wie Gast ohne Login) ──");
  const { data: spotsAnon, error: spotsAnonErr } = await db
    .from("spots")
    .select("id, name, verification_status, is_active, merchant_id")
    .limit(10);
  console.log(spotsAnonErr?.message || `rows: ${spotsAnon?.length ?? 0}`);
  if (spotsAnon?.length) console.table(spotsAnon);

  console.log("\n── guest_checkin RPC (anon → sollte not authenticated) ──");
  const fakeId = spotIdArg || spotsAnon?.[0]?.id || "00000000-0000-0000-0000-000000000001";
  const { error: rpcAnonErr } = await db.rpc("guest_checkin", { p_spot_id: fakeId });
  console.log(rpcAnonErr?.message || rpcAnonErr?.code || "ok (unexpected)");

  console.log("\n── guest_checkin exists? (code PGRST202 = missing) ──");
  const missing = rpcAnonErr?.code === "PGRST202" || /Could not find the function/i.test(rpcAnonErr?.message || "");
  console.log(missing ? "❌ Migration 019 NICHT ausgeführt" : "✓ Funktion erreichbar (Fehler erwartet ohne Login)");

  if (spotIdArg) {
    console.log(`\n── Spot ${spotIdArg} (anon) ──`);
    const { data: one, error: oneErr } = await db.from("spots").select("*").eq("id", spotIdArg).single();
    console.log(oneErr?.message || (one ? `✓ ${one.name} (${one.verification_status})` : "❌ kein Zugriff / nicht gefunden"));
  }

  console.log("\n── Hinweis ──");
  console.log("Gäste sehen pending-Spots oft NICHT (RLS spots_select_public nur verified).");
  console.log("Fix: Migration 020 + 019 im SQL Editor ausführen.");
}

async function testGuestStamp(spotId) {
  const email = `checkin-test-${Date.now()}@example.com`;
  const password = "CheckinTest123!";
  console.log("\n── Gast-Test (signUp + Stempel) ──");
  const { data: auth, error: signErr } = await db.auth.signUp({ email, password });
  if (signErr) {
    console.log("signUp:", signErr.message);
    return;
  }
  const client = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${auth.session?.access_token}` } },
  });
  const uid = auth.user?.id;
  if (!uid) {
    console.log("Keine Session nach signUp (E-Mail-Bestätigung nötig?)");
    return;
  }
  const { data: ins, error: insErr } = await client
    .from("stamps")
    .insert({ user_id: uid, spot_id: spotId, points: 1 })
    .select()
    .single();
  console.log(insErr?.message || `✓ Stempel insert OK points=${ins?.points}`);
}

main()
  .then(() => testGuestStamp(spotIdArg || "e97829d6-89fa-4934-9812-a36260175a43"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
