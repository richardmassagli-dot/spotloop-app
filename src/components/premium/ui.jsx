import { motion } from "framer-motion";

export const cn = (...parts) => parts.filter(Boolean).join(" ");

export function GradientButton({ children, onClick, className = "", variant = "primary", disabled = false, type = "button" }) {
  const variants = {
    primary: "bg-gradient-to-r from-[#7C5CFF] via-[#3B82F6] to-[#42B8A6] text-white shadow-[0_8px_24px_rgba(124,92,255,0.35)]",
    navy: "bg-[#0B1F3A] text-white shadow-[0_8px_20px_rgba(11,31,58,0.25)]",
    ghost: "bg-white text-[#0B1F3A] border border-[#E8E8E4] shadow-sm",
    coral: "bg-gradient-to-r from-[#FF6B5A] to-[#7C5CFF] text-white shadow-[0_8px_20px_rgba(255,107,90,0.3)]",
  };

  return (
    <motion.button
      type={type}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition-opacity",
        variants[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

export function Card({ children, className = "", onClick }) {
  const Tag = onClick ? motion.button : motion.div;
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.99 } : {}}
      className={cn(
        "rounded-3xl bg-white border border-[#EEECE8] shadow-[0_4px_24px_rgba(11,31,58,0.06)]",
        onClick && "text-left w-full cursor-pointer",
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function SectionTitle({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <h2 className="text-[17px] font-bold text-[#0B1F3A] tracking-tight">{title}</h2>
      {action && (
        <button type="button" onClick={onAction} className="text-xs font-semibold text-[#7C5CFF]">
          {action}
        </button>
      )}
    </div>
  );
}

export function ProgressBar({ value, max, color = "#7C5CFF" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-2 rounded-full bg-[#F0EFEB] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

export function Pill({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
        active ? "bg-[#0B1F3A] text-white" : "bg-white text-[#5A6478] border border-[#E8E8E4]"
      )}
    >
      {children}
    </button>
  );
}

export function AuthInput({ label, type = "text", value, onChange, placeholder, error, max, className = "" }) {
  return (
    <label className={cn("block mb-3.5", className)}>
      {label && (
        <span className="mb-1.5 block text-xs font-semibold text-[#5A6478] tracking-wide uppercase">
          {label}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        max={max}
        className={cn(
          "w-full rounded-2xl border bg-white px-4 py-3.5 text-[15px] font-medium text-[#0B1F3A]",
          "placeholder:text-[#C5CAD4] outline-none transition-shadow",
          "focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/20",
          error ? "border-[#FF6B5A]" : "border-[#E8E8E4]"
        )}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-[#FF6B5A]">{error}</p>}
    </label>
  );
}

export function AuthAlert({ type = "error", children }) {
  const styles = {
    error: "bg-[#FFF0EE] border-[#FF6B5A]/25 text-[#C2410C]",
    success: "bg-[#ECFDF5] border-[#42B8A6]/30 text-[#0F766E]",
  };
  return (
    <div className={cn("mb-4 rounded-2xl border px-4 py-3 text-sm font-medium leading-relaxed", styles[type])}>
      {children}
    </div>
  );
}

export function AuthTabBar({ tabs, active, onChange }) {
  return (
    <div className="mb-5 flex gap-1 rounded-2xl bg-[#F0EFEB] p-1">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "flex-1 rounded-xl px-2 py-2.5 text-[11px] font-bold transition-all",
            active === id
              ? "bg-white text-[#0B1F3A] shadow-sm"
              : "text-[#5A6478] hover:text-[#0B1F3A]"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function GhostButton({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border border-[#E8E8E4] bg-white px-4 py-3 text-sm font-semibold text-[#5A6478]",
        "transition-colors hover:bg-[#FAFAF8] hover:text-[#0B1F3A]",
        className
      )}
    >
      {children}
    </button>
  );
}
