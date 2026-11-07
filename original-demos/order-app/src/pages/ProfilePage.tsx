import { useApp } from "../store"

export default function ProfilePage() {
  const { state, logout, navigate } = useApp()
  const { user } = state
  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className="page-enter"
      style={{ padding: "24px 20px 100px", maxWidth: 500, margin: "0 auto" }}
    >
      <h1
        className="font-display"
        style={{ fontSize: 28, fontWeight: 700, margin: "0 0 28px" }}
      >
        Profile
      </h1>

      {/* Avatar + name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 22,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
            fontFamily: "var(--font-display)",
          }}
        >
          {initials}
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 18,
              color: "var(--foreground)",
            }}
          >
            {user.name}
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 14,
              color: "var(--muted-foreground)",
            }}
          >
            {user.email}
          </p>
          <span
            style={{
              display: "inline-block",
              marginTop: 6,
              background:
                user.role === "owner"
                  ? "rgba(232,88,26,0.15)"
                  : "rgba(74,144,226,0.15)",
              color: user.role === "owner" ? "var(--primary)" : "#4A90E2",
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 10px",
              borderRadius: 100,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {user.role === "owner" ? "Restaurant owner" : "Customer"}
          </span>
        </div>
      </div>

      {/* Quick links */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        {user.role === "customer" && (
          <>
            <QuickLink
              icon="📋"
              label="Order history"
              onClick={() => navigate("orders")}
            />
            <QuickLink
              icon="📍"
              label="Saved addresses"
              onClick={() => navigate("addresses")}
            />
          </>
        )}
        {user.role === "owner" && (
          <>
            <QuickLink
              icon="🏪"
              label="My restaurants"
              onClick={() => navigate("owner-restaurants")}
            />
            <QuickLink
              icon="📋"
              label="Incoming orders"
              onClick={() => navigate("owner-orders")}
            />
          </>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        style={{
          width: "100%",
          background: "rgba(201,48,48,0.1)",
          border: "1px solid rgba(201,48,48,0.25)",
          color: "#ff6b6b",
          borderRadius: 12,
          padding: "14px 0",
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
          fontFamily: "var(--font-body)",
          letterSpacing: "0.02em",
        }}
      >
        Sign out
      </button>
    </div>
  )
}

function QuickLink({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 20px",
        width: "100%",
        background: "transparent",
        border: "none",
        borderBottom: "1px solid var(--border)",
        color: "var(--foreground)",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "var(--font-body)",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.background = "var(--secondary)"
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.background = "transparent"
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span>{label}</span>
      <span
        style={{
          marginLeft: "auto",
          color: "var(--muted-foreground)",
          fontSize: 16,
        }}
      >
        ›
      </span>
    </button>
  )
}
