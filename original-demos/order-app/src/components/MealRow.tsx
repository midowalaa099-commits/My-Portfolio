import { Meal } from "../types"
import { useApp } from "../store"

interface Props {
  meal: Meal
  quantity?: number
}

export default function MealRow({ meal, quantity = 0 }: Props) {
  const { addToCart, setCartQty, state } = useApp()

  const cartItem = state.cart.find((i) => i.meal.id === meal.id)
  const qty = cartItem?.quantity ?? 0

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        padding: "18px 0",
        borderBottom: "1px solid var(--border)",
        opacity: meal.isAvailable ? 1 : 0.45,
      }}
    >
      {/* Text */}
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}
      >
        {meal.category && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--primary)",
              marginBottom: 2,
            }}
          >
            {meal.category}
          </span>
        )}
        <h4
          className="font-display"
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: "var(--foreground)",
            lineHeight: 1.25,
          }}
        >
          {meal.name}
        </h4>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "var(--muted-foreground)",
            lineHeight: 1.45,
            marginTop: 2,
          }}
        >
          {meal.description}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 10,
          }}
        >
          <span
            style={{ fontWeight: 700, color: "var(--primary)", fontSize: 16 }}
          >
            ${meal.price.toFixed(2)}
          </span>
          {!meal.isAvailable && (
            <span
              style={{
                fontSize: 11,
                color: "var(--muted-foreground)",
                fontWeight: 500,
              }}
            >
              Unavailable
            </span>
          )}
          {meal.isAvailable && qty === 0 && (
            <button
              onClick={() => addToCart(meal)}
              style={{
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 16px",
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              Add
            </button>
          )}
          {meal.isAvailable && qty > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setCartQty(meal.id, qty - 1)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "1.5px solid var(--primary)",
                  background: "transparent",
                  color: "var(--primary)",
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                −
              </button>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--foreground)",
                  minWidth: 16,
                  textAlign: "center",
                }}
              >
                {qty}
              </span>
              <button
                onClick={() => addToCart(meal)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--primary)",
                  border: "none",
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image */}
      {meal.imageUrl && (
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 10,
            overflow: "hidden",
            flexShrink: 0,
            background: "var(--muted)",
          }}
        >
          <img
            src={meal.imageUrl}
            alt={meal.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
    </div>
  )
}
