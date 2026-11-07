import { useApp } from "../store"

const icons = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M13.5 4.5L6.5 11.5L2.5 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 7v4M8 5.5v.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
}

const colors = {
  success: {
    bg: "var(--success)",
    icon: "#fff",
    border: "rgba(46,139,87,0.4)",
  },
  error: {
    bg: "var(--destructive)",
    icon: "#fff",
    border: "rgba(201,48,48,0.4)",
  },
  info: { bg: "var(--card)", icon: "var(--primary)", border: "var(--border)" },
}

export default function ToastContainer() {
  const { state, dismissToast } = useApp()

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {state.toasts.map((t) => {
        const c = colors[t.type]
        return (
          <div
            key={t.id}
            className="toast-enter"
            style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: "var(--radius)",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              maxWidth: 320,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              pointerEvents: "auto",
              cursor: "pointer",
            }}
            onClick={() => dismissToast(t.id)}
          >
            <span style={{ color: c.icon, flexShrink: 0 }}>
              {icons[t.type]}
            </span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.6)",
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
                fontSize: 16,
              }}
              onClick={() => dismissToast(t.id)}
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
