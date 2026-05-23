import { Logo } from "./ui";

/** Spotloop-Branding oben rechts — auf jeder Seite sichtbar, unaufdringlich. */
export default function SpotloopWatermark() {
  return (
    <div className="spotloop-watermark" aria-hidden>
      <Logo size={17} />
    </div>
  );
}
