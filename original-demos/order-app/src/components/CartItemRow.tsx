import { CartLineItem } from "../types"
import { useApp } from "../store"

interface Props {
  item: CartLineItem
}

export default function CartItemRow({ item }: Props) {
  const { removeFromCart, setCartQty } = useApp()
  const { meal, quantity } = item

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {meal.imageUrl && (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            overflow: "hidden",
            background: "var(--muted)",
            flexShrink: 0,
          }}
        >
          <img
            src={meal.imageUrl}
            alt={meal.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: 14,
            color: "var(--foreground)",
          }}
        >
          {meal.name}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: 13,
            color: "var(--primary)",
            fontWeight: 700,
          }}
        >
          ${(meal.price * quantity).toFixed(2)}
        </p>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setCartQty(meal.id, quantity - 1)}
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            border: "1.5px solid var(--border)",
            background: "transparent",
            color: "var(--foreground)",
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          −
        </button>
        <span
          style={{
            fontWeight: 700,
            fontSize: 14,
            minWidth: 14,
            textAlign: "center",
            color: "var(--foreground)",
          }}
        >
          {quantity}
        </span>
        <button
          onClick={() => setCartQty(meal.id, quantity + 1)}
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            border: "none",
            background: "var(--primary)",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          +
        </button>
        <button
          onClick={() => removeFromCart(meal.id)}
          style={{
            background: "none",
            border: "none",
            color: "var(--muted-foreground)",
            cursor: "pointer",
            fontSize: 18,
            padding: "0 0 0 6px",
            lineHeight: 1,
          }}
          title="Remove"
        >
          ×
        </button>
      </div>
    </div>
  )
}
