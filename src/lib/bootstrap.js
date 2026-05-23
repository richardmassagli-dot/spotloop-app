import { supabase } from "./supabase";
import { ENABLE_DEV_BOOTSTRAP, IS_LOCAL_MODE } from "./config";

/** Admin + Spot-Freigabe für E-Mails in `app_bootstrap_emails` (Migration 004). */
export async function runDevBootstrap() {
  if (IS_LOCAL_MODE) {
    return { ok: true, local: true, message: "Demo-Modus: Admin und Verifizierung sind bereits aktiv." };
  }
  if (!ENABLE_DEV_BOOTSTRAP) {
    return { ok: false, message: "Bootstrap ist nicht aktiviert (VITE_ENABLE_DEV_BOOTSTRAP)." };
  }

  const { error: adminErr } = await supabase.rpc("bootstrap_grant_admin");
  if (adminErr && !/bootstrap list/i.test(adminErr.message)) {
    return { ok: false, message: adminErr.message };
  }

  const { error: spotErr } = await supabase.rpc("bootstrap_approve_own_spot");
  if (spotErr && !/bootstrap list/i.test(spotErr.message)) {
    return { ok: false, message: spotErr.message };
  }

  await supabase.auth.refreshSession();

  if (adminErr?.message?.includes("bootstrap list") || spotErr?.message?.includes("bootstrap list")) {
    return {
      ok: false,
      needsSql: true,
      message:
        "Deine E-Mail steht noch nicht in app_bootstrap_emails. Einmal in Supabase SQL ausführen: insert into public.app_bootstrap_emails (email) values ('deine@email.de');",
    };
  }

  return { ok: true, message: "Admin aktiv und Spot freigeschaltet. Seite neu laden falls nötig." };
}
