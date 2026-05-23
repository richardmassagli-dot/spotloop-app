import { useAuth } from "../context/AuthContext";
import SpotloopWatermark from "./SpotloopWatermark";

/** Logo auf allen Seiten außer Login / vor Anmeldung. */
export default function SpotloopWatermarkGate() {
  const { user } = useAuth();
  if (!user) return null;
  return <SpotloopWatermark />;
}
