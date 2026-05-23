import { useAuth } from "../context/AuthContext";
import SpotloopWatermark from "./SpotloopWatermark";

/** Logo auf Gast-Seiten; Merchant-Dashboard hat eigenes Logo im Header. */
export default function SpotloopWatermarkGate() {
  const { user, profile } = useAuth();
  if (!user || profile?.role === "merchant") return null;
  return <SpotloopWatermark />;
}
