import { SpotloopIcon } from "./ui";

/** Dezentes Spotloop-Branding — auf jeder Seite, nicht klickbar, stört nicht. */
export default function SpotloopWatermark() {
  return (
    <div className="spotloop-watermark" aria-hidden>
      <SpotloopIcon size={13} />
      <span className="spotloop-watermark__word">spotloop</span>
    </div>
  );
}
