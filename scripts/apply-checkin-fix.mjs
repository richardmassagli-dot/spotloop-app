#!/usr/bin/env node
/**
 * Wendet supabase/RUN_CHECKIN_FIX.sql an (Check-in für Gäste).
 * Benötigt SUPABASE_ACCESS_TOKEN oder SUPABASE_DB_PASSWORD in .env.local
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");
const sqlPath = resolve(root, "supabase/RUN_CHECKIN_FIX.sql");

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

const SQL_EDITOR = ref
  ? `https://supabase.com/dashboard/project/${ref}/sql/new`
  : "https://supabase.com/dashboard";

async function verify() {
  const key = env.VITE_SUPABASE_ANON_KEY;
  const res = await fetch(`${url}/rest/v1/rpc/guest_checkin`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_spot_id: "00000000-0000-0000-0000-000000000001" }),
  });
  const text = await res.text();
  return !/Could not find the function/i.test(text);
}

async function runViaManagementApi() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Management API ${res.status}: ${text.slice(0, 500)}`);
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
}

async function main() {
  console.log("\n🔧 Check-in Fix (019 + 020)\n");

  if (await verify()) {
    console.log("✅ guest_checkin ist bereits aktiv — nichts zu tun.\n");
    return;
  }

  if (token) {
    await runViaManagementApi();
    console.log("✅ SQL via Management API ausgeführt.\n");
  } else if (dbPassword || env.DATABASE_URL) {
    await runViaPg();
    console.log("✅ SQL via Postgres ausgeführt.\n");
  } else {
    console.log("⚠️  Kein SUPABASE_ACCESS_TOKEN / SUPABASE_DB_PASSWORD in .env.local\n");
    console.log("Bitte einmalig im SQL Editor ausführen:");
    console.log(`  ${SQL_EDITOR}\n`);
    console.log(`Datei: ${sqlPath}\n`);
    process.exit(1);
  }

  if (await verify()) {
    console.log("✅ Verifiziert: guest_checkin erreichbar.\n");
  } else {
    console.log("⚠️  SQL lief, aber RPC noch nicht sichtbar — 10s warten und App neu laden.\n");
  }
}

main().catch((e) => {
  console.error("❌", e.message);
  console.log(`\nManuell: ${SQL_EDITOR}`);
  console.log(`Datei: ${sqlPath}\n`);
  process.exit(1);
});
