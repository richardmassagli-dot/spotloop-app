import { useEffect } from "react";

/** Entfernt den HTML-Boot-Screen erst nach dem ersten React-Paint. */
export default function BootComplete() {
  useEffect(() => {
    const done = () => {
      document.getElementById("spotloop-boot")?.remove();
      window.dispatchEvent(new Event("spotloop-app-ready"));
    };
    requestAnimationFrame(() => requestAnimationFrame(done));
  }, []);
  return null;
}
