#!/usr/bin/env node
/**
 * Prüft Supabase-Verbindung und gibt Hinweise zum Schema-Setup.
 * Usage: node scripts/setup-supabase.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

function loadEnv() {
  try {
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch {
    /* ignore */
  }
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const key =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("\n❌ .env.local fehlt oder ist leer.\n");
  console.error("Bitte eintragen:");
  console.error("  VITE_SUPABASE_URL=https://xxxx.supabase.co");
  console.error("  VITE_SUPABASE_ANON_KEY=eyJ...  (oder sb_publishable_...)\n");
  console.error("Keys: Supabase Dashboard → Settings → API\n");
  process.exit(1);
}

console.log("\n🔌 Teste Supabase:", url);

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
};

// Health: REST root
const rest = await fetch(`${url}/rest/v1/`, { headers });
console.log(rest.ok ? "✓ REST API erreichbar" : `✗ REST ${rest.status}`);

// Tables
for (const table of ["spots", "stamps", "follows", "campaigns", "checkins"]) {
  const r = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, { headers });
  if (r.ok) console.log(`✓ Tabelle "${table}" vorhanden`);
  else if (r.status === 404 || (await r.text()).includes("does not exist"))
    console.log(`✗ Tabelle "${table}" fehlt → supabase/schema.sql im SQL Editor ausführen`);
  else console.log(`? Tabelle "${table}": HTTP ${r.status}`);
}

console.log("\n✅ Wenn alle Tabellen ✓ sind: npm run dev neu starten.\n");
