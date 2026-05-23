/** Full-height layout for mobile shell (#root overflow). Use scroll-y on inner content. */
export default function AppShell({ banner, children }) {
  return (
    <div className="app-shell">
      {banner}
      <div className="app-shell-body">{children}</div>
    </div>
  );
}
