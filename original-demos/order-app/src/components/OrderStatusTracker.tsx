import { OrderStatus } from "../types"

const STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "pending", label: "Pending", icon: "⏳" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "on_the_way", label: "On the way", icon: "🛵" },
  { key: "delivered", label: "Delivered", icon: "✓" },
]

const STATUS_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  preparing: 1,
  on_the_way: 2,
  delivered: 3,
  cancelled: -1,
}

interface Props {
  status: OrderStatus
}

export default function OrderStatusTracker({ status }: Props) {
  if (status === "cancelled") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "var(--destructive)",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        <span>✕</span>
        <span>Order cancelled</span>
      </div>
    )
  }

  const activeIdx = STATUS_INDEX[status]

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {STEPS.map((step, idx) => {
        const isDone = idx < activeIdx
        const isActive = idx === activeIdx
        const isUpcoming = idx > activeIdx
        return (
          <div
            key={step.key}
            style={{
              display: "flex",
              alignItems: "center",
              flex: idx < STEPS.length - 1 ? 1 : 0,
            }}
          >
            {/* Node */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: isActive ? 34 : 28,
                  height: isActive ? 34 : 28,
                  borderRadius: "50%",
                  background: isDone
                    ? "var(--success)"
                    : isActive
                      ? "var(--primary)"
                      : "var(--muted)",
                  border: isActive ? "3px solid rgba(232,88,26,0.3)" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isActive ? 14 : 12,
                  transition: "all 0.3s ease",
                  boxShadow: isActive
                    ? "0 0 0 4px rgba(232,88,26,0.15)"
                    : "none",
                }}
              >
                {isDone ? "✓" : step.icon}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive
                    ? "var(--primary)"
                    : isDone
                      ? "var(--success)"
                      : "var(--muted-foreground)",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.03em",
                }}
              >
                {step.label}
              </span>
            </div>
            {/* Connector */}
            {idx < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 3,
                  background:
                    idx < activeIdx ? "var(--success)" : "var(--border)",
                  marginBottom: 20,
                  transition: "background 0.4s ease",
                  borderRadius: 2,
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
