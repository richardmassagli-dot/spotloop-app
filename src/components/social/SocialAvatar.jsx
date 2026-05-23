export default function SocialAvatar({ initials, color = "#1B4FD8", size = 40 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size > 44 ? 16 : 12,
        background: `${color}18`,
        border: `2px solid ${color}35`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.34,
        fontWeight: 800,
        color,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
