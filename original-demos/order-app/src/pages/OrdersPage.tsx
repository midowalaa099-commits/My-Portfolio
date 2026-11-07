import { useState, useEffect } from "react"
import { Order, OrderStatus } from "../types"
import { apiGetOrders, apiUpdateOrderStatus } from "../mockData"
import { useApp } from "../store"
import OrderStatusTracker from "../components/OrderStatusTracker"
import { OrderCardSkeleton } from "../components/Skeleton"

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "#D4880A",
  preparing: "var(--primary)",
  on_the_way: "#4A90E2",
  delivered: "var(--success)",
  cancelled: "var(--destructive)",
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  preparing: "Preparing",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export default function OrdersPage() {
  const { navigate, toast } = useApp()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    apiGetOrders().then((data) => {
      setOrders(data)
      setLoading(false)
    })
  }, [])

  const active = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status),
  )
  const past = orders.filter((o) =>
    ["delivered", "cancelled"].includes(o.status),
  )

  const handleCancel = async (orderId: string) => {
    const updated = await apiUpdateOrderStatus(orderId, "cancelled")
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
    toast("Order cancelled", "info")
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const OrderCard = ({ order }: { order: Order }) => {
    const expanded = expandedId === order.id
    return (
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          transition: "border-color 0.15s",
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
              }}
            >
              <h3
                className="font-display"
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 700,
                  color: "var(--foreground)",
                }}
              >
                {order.restaurantName}
              </h3>
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
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "var(--muted-foreground)",
              }}
            >
              {order.items.length} item{order.items.length !== 1 ? "s" : ""} · $
              {order.total.toFixed(2)} · {formatDate(order.createdAt)}
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

        {/* Status tracker (active orders always visible) */}
        {!["delivered", "cancelled"].includes(order.status) && (
          <div style={{ padding: "0 18px 18px" }}>
            <OrderStatusTracker status={order.status} />
          </div>
        )}

        {/* Expanded content */}
        {expanded && (
          <div style={{ borderTop: "1px solid var(--border)", padding: 18 }}>
            {/* Items */}
            <div style={{ marginBottom: 16 }}>
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
                  fontSize: 15,
                  fontWeight: 800,
                  paddingTop: 10,
                  borderTop: "1px solid var(--border)",
                  marginTop: 8,
                }}
              >
                <span>Total</span>
                <span style={{ color: "var(--primary)" }}>
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
            {/* Address */}
            <div
              style={{
                background: "var(--secondary)",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 14,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--muted-foreground)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Delivery to
              </p>
              <p
                style={{ margin: 0, fontSize: 13, color: "var(--foreground)" }}
              >
                {order.address.street}, {order.address.city}
              </p>
            </div>
            {/* Cancelled status tracker */}
            {order.status === "cancelled" && (
              <OrderStatusTracker status={order.status} />
            )}
            {["on_the_way", "delivered"].includes(order.status) && (
              <button
                className="tracking-button"
                onClick={() => navigate("order-tracking", undefined, order.id)}
              >
                {order.status === "on_the_way" ? "Track live delivery" : "View delivery route"} →
              </button>
            )}
            {/* Cancel button */}
            {order.status === "pending" && (
              <button
                onClick={() => handleCancel(order.id)}
                style={{
                  width: "100%",
                  background: "rgba(201,48,48,0.1)",
                  border: "1px solid rgba(201,48,48,0.3)",
                  color: "var(--destructive)",
                  borderRadius: 10,
                  padding: "11px 0",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                Cancel order
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className="page-enter"
      style={{ padding: "24px 20px 100px", maxWidth: 680, margin: "0 auto" }}
    >
      <h1
        className="font-display"
        style={{ fontSize: 28, fontWeight: 700, margin: "0 0 24px" }}
      >
        Orders
      </h1>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[1, 2, 3].map((i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            background: "var(--card)",
            borderRadius: "var(--radius)",
            border: "1px dashed var(--border)",
          }}
        >
          <p style={{ fontSize: 48, marginBottom: 16 }}>📋</p>
          <h3
            className="font-display"
            style={{ fontSize: 22, fontWeight: 600, margin: "0 0 8px" }}
          >
            No orders yet
          </h3>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
            Your order history will appear here once you place your first order.
          </p>
        </div>
      )}

      {!loading && active.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--primary)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Active orders
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {active.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        </div>
      )}

      {!loading && past.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--muted-foreground)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Past orders
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {past.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
