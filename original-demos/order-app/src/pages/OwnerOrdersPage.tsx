import { useState, useEffect } from "react"
import { Order, OrderStatus } from "../types"
import { useApp } from "../store"
import { apiGetOrders, apiUpdateOrderStatus } from "../mockData"
import OrderStatusTracker from "../components/OrderStatusTracker"
import { OrderCardSkeleton } from "../components/Skeleton"

const STATUS_SEQUENCE: OrderStatus[] = [
  "pending",
  "preparing",
  "on_the_way",
  "delivered",
]

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  preparing: "Preparing",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "#D4880A",
  preparing: "var(--primary)",
  on_the_way: "#4A90E2",
  delivered: "var(--success)",
  cancelled: "var(--destructive)",
}

function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = STATUS_SEQUENCE.indexOf(current)
  if (idx === -1 || idx >= STATUS_SEQUENCE.length - 1) return null
  return STATUS_SEQUENCE[idx + 1]
}

export default function OwnerOrdersPage() {
  const { navigate, toast } = useApp()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<OrderStatus | "all">("all")

  useEffect(() => {
    apiGetOrders().then((data) => {
      setOrders(data)
      setLoading(false)
    })
  }, [])

  const handleAdvance = async (orderId: string, current: OrderStatus) => {
    const next = nextStatus(current)
    if (!next) return
    const updated = await apiUpdateOrderStatus(orderId, next)
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
    toast(`Order advanced to ${STATUS_LABELS[next]}`, "success")
  }

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter)
  const activeCount = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status),
  ).length

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <div
      className="page-enter"
      style={{ padding: "24px 20px 100px", maxWidth: 720, margin: "0 auto" }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1
          className="font-display"
          style={{ fontSize: 28, fontWeight: 700, margin: 0 }}
        >
          Incoming Orders
        </h1>
        {activeCount > 0 && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 14,
              color: "var(--primary)",
              fontWeight: 600,
            }}
          >
            {activeCount} active order{activeCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Status filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 20,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {(["all", ...STATUS_SEQUENCE, "cancelled"] as const).map((s) => {
          const active = filter === s
          return (
            <button
              key={s}
              onClick={() => setFilter(s as any)}
              style={{
                padding: "7px 14px",
                borderRadius: 100,
                border: `1.5px solid ${
                  active
                    ? s === "all"
                      ? "var(--foreground)"
                      : STATUS_COLORS[(s as OrderStatus)]
                    : "var(--border)"
                }`,
                background: active
                  ? s === "all"
                    ? "var(--foreground)"
                    : `${STATUS_COLORS[(s as OrderStatus)]}22`
                  : "transparent",
                color: active
                  ? s === "all"
                    ? "var(--background)"
                    : STATUS_COLORS[(s as OrderStatus)]
                  : "var(--muted-foreground)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "var(--font-body)",
                letterSpacing: "0.04em",
                transition: "all 0.15s",
              }}
            >
              {s === "all" ? "All" : STATUS_LABELS[(s as OrderStatus)]}
            </button>
          )
        })}
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[1, 2, 3].map((i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            background: "var(--card)",
            borderRadius: "var(--radius)",
            border: "1px dashed var(--border)",
          }}
        >
          <p style={{ fontSize: 40, marginBottom: 12 }}>📋</p>
          <h3
            className="font-display"
            style={{ fontSize: 20, fontWeight: 600, margin: "0 0 8px" }}
          >
            No orders here
          </h3>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
            {filter === "all"
              ? "Orders from your restaurants will appear here."
              : `No ${STATUS_LABELS[(filter as OrderStatus)].toLowerCase()} orders right now.`}
          </p>
        </div>
      )}

      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((order) => {
            const expanded = expandedId === order.id
            const next = nextStatus(order.status)
            return (
              <div
                key={order.id}
                style={{
                  background: "var(--card)",
                  border: `1px solid ${
                    !["delivered", "cancelled"].includes(order.status)
                      ? "var(--border)"
                      : "var(--border)"
                  }`,
                  borderLeft: `3px solid ${STATUS_COLORS[order.status]}`,
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    padding: 18,
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: "var(--foreground)",
                        }}
                      >
                        #{order.id.toUpperCase()}
                      </span>
                      <span
                        style={{
                          background: `${STATUS_COLORS[order.status]}22`,
                          color: STATUS_COLORS[order.status],
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 9px",
                          borderRadius: 100,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--muted-foreground)",
                          marginLeft: "auto",
                        }}
                      >
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""} ·{" "}
                      <strong style={{ color: "var(--primary)" }}>
                        ${order.total.toFixed(2)}
                      </strong>
                    </p>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: 12,
                        color: "var(--muted-foreground)",
                      }}
                    >
                      → {order.address.street}, {order.address.city}
                    </p>
                  </div>
                  <span
                    style={{
                      color: "var(--muted-foreground)",
                      fontSize: 20,
                      flexShrink: 0,
                      lineHeight: 1,
                    }}
                  >
                    {expanded ? "−" : "+"}
                  </span>
                </button>

                {/* Status tracker (always visible for active) */}
                {!["delivered", "cancelled"].includes(order.status) && (
                  <div style={{ padding: "0 18px 14px" }}>
                    <OrderStatusTracker status={order.status} />
                  </div>
                )}

                {/* Expanded */}
                {expanded && (
                  <div
                    style={{
                      borderTop: "1px solid var(--border)",
                      padding: 18,
                    }}
                  >
                    {/* Items */}
                    <p
                      style={{
                        margin: "0 0 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--muted-foreground)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      Items
                    </p>
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 14,
                          padding: "5px 0",
                          color: "var(--foreground)",
                        }}
                      >
                        <span>
                          {item.quantity}× {item.meal.name}
                        </span>
                        <span style={{ color: "var(--muted-foreground)" }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: 800,
                        fontSize: 15,
                        paddingTop: 10,
                        borderTop: "1px solid var(--border)",
                        marginTop: 8,
                        marginBottom: 16,
                      }}
                    >
                      <span>Total</span>
                      <span style={{ color: "var(--primary)" }}>
                        ${order.total.toFixed(2)}
                      </span>
                    </div>

                    {["on_the_way", "delivered"].includes(order.status) && (
                      <button
                        className="tracking-button"
                        onClick={() => navigate("order-tracking", undefined, order.id)}
                      >
                        Open delivery tracking →
                      </button>
                    )}

                    {/* Advance status button */}
                    {next && order.status !== "cancelled" && (
                      <button
                        onClick={() => handleAdvance(order.id, order.status)}
                        style={{
                          width: "100%",
                          background: STATUS_COLORS[next],
                          color: "#fff",
                          border: "none",
                          borderRadius: 10,
                          padding: "12px 0",
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: "pointer",
                          fontFamily: "var(--font-body)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Mark as {STATUS_LABELS[next]} →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
