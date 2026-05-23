#!/usr/bin/env node
/**
 * Wendet Migrationen 015–017 auf Supabase an.
 * Option A: SUPABASE_ACCESS_TOKEN in .env.local (Account → Access Tokens)
 * Option B: SUPABASE_DB_PASSWORD in .env.local (Settings → Database)
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");
const sqlPath = resolve(root, "supabase/scripts/apply_pending_015_017.sql");

function loadEnv() {
  const env = {};
  if (!existsSync(envPath)) return env;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return env;
}

const env = { ...process.env, ...loadEnv() };
const url = env.VITE_SUPABASE_URL || "";
const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const sql = readFileSync(sqlPath, "utf8");
const token = env.SUPABASE_ACCESS_TOKEN;
const dbPassword = env.SUPABASE_DB_PASSWORD;

if (!ref) {
  console.error("❌ VITE_SUPABASE_URL in .env.local fehlt oder ungültig.");
  process.exit(1);
}

async function verify() {
  const key = env.VITE_SUPABASE_ANON_KEY;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const checks = await Promise.all([
    fetch(`${url}/rest/v1/user_privacy_preferences?select=user_id&limit=1`, { headers }),
    fetch(`${url}/rest/v1/spot_communities?select=id&limit=1`, { headers }),
    fetch(`${url}/rest/v1/spot_messages?select=id&limit=1`, { headers }),
  ]);
  return checks.every((r) => r.ok);
}

async function runViaManagementApi() {
  console.log("🔑 Management API …");
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Management API ${res.status}: ${text.slice(0, 400)}`);
  }
  console.log("✓ SQL ausgeführt");
}

async function runViaPg() {
  const { default: pg } = await import("pg");
  const connectionString =
    env.DATABASE_URL ||
    `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${ref}.supabase.co:5432/postgres`;
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("✓ SQL via Postgres ausgeführt");
}

async function main() {
  console.log("\n📋 Spotloop Migrationen 015–018\n");

  if (await verify()) {
    console.log("✅ Tabellen bereits vorhanden — nichts zu tun.\n");
    return;
  }

  if (token) {
    await runViaManagementApi();
  } else if (dbPassword || env.DATABASE_URL) {
    await runViaPg();
  } else {
    console.log("⚠️  Kein SUPABASE_ACCESS_TOKEN oder SUPABASE_DB_PASSWORD in .env.local\n");
    console.log("Bitte einmalig im SQL Editor ausführen:");
    console.log(`  https://supabase.com/dashboard/project/${ref}/sql/new\n`);
    console.log(`Datei: supabase/scripts/apply_pending_015_017.sql\n`);
    process.exit(1);
  }

  if (await verify()) {
    console.log("✅ Migration erfolgreich — spot_messages, privacy & communities bereit.\n");
  } else {
    console.log("⚠️  Verifikation fehlgeschlagen — bitte SQL manuell prüfen.\n");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
