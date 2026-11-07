import { useState, useEffect, useRef } from "react"
import { Restaurant, Meal } from "../types"
import { apiGetRestaurant, apiGetMeals } from "../mockData"
import { useApp } from "../store"
import MealRow from "../components/MealRow"
import { MealRowSkeleton } from "../components/Skeleton"
import CartItemRow from "../components/CartItemRow"

export default function RestaurantDetailPage() {
  const { state, navigate, cartTotal, toast } = useApp()
  const restaurantId = state.nav.restaurantId ?? ""
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("")
  const cartItems = state.cart.filter(
    (i) => i.meal.restaurantId === restaurantId,
  )
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0)
  const cartPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      apiGetRestaurant(restaurantId),
      apiGetMeals(restaurantId),
    ]).then(([r, m]) => {
      if (cancelled) return
      setRestaurant(r)
      setMeals(m)
      const cats = [...new Set(m.map((x) => x.category ?? "Other"))]
      setActiveCategory(cats[0] ?? "")
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [restaurantId])

  const categories = [...new Set(meals.map((m) => m.category ?? "Other"))]
  const mealsByCategory = meals.filter(
    (m) => (m.category ?? "Other") === activeCategory,
  )

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    navigate("cart")
  }

  return (
    <div className="page-enter" style={{ minHeight: "100vh" }}>
      {/* Hero image */}
      <div
        style={{
          position: "relative",
          height: 240,
          background: "var(--muted)",
          overflow: "hidden",
        }}
      >
        {restaurant?.imageUrl && (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(12,10,8,0.2) 0%, rgba(12,10,8,0.85) 100%)",
          }}
        />
        {/* Back button */}
        <button
          onClick={() => navigate("browse")}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            background: "rgba(12,10,8,0.7)",
            border: "none",
            color: "#fff",
            borderRadius: "50%",
            width: 40,
            height: 40,
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
        >
          ←
        </button>
        {/* Info overlay */}
        {restaurant && (
          <div
            style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}
          >
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <h1
                  className="font-display"
                  style={{
                    margin: 0,
                    fontSize: "clamp(22px, 4vw, 32px)",
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1.1,
                  }}
                >
                  {restaurant.name}
                </h1>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {restaurant.address} · {restaurant.cuisine} · ⭐{" "}
                  {restaurant.rating}
                </p>
              </div>
              <span
                style={{
                  background: restaurant.isOpen
                    ? "rgba(46,139,87,0.9)"
                    : "rgba(80,60,45,0.9)",
                  color: "#fff",
                  padding: "5px 12px",
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  flexShrink: 0,
                }}
              >
                {restaurant.isOpen ? "Open" : "Closed"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content layout: menu + desktop cart panel */}
      <div
        style={{
          display: "flex",
          gap: 0,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 0 120px",
          position: "relative",
        }}
      >
        {/* Menu section */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Category tabs */}
          {!loading && categories.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                padding: "16px 20px",
                overflowX: "auto",
                borderBottom: "1px solid var(--border)",
                scrollbarWidth: "none",
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "7px 18px",
                    borderRadius: 100,
                    border: "1.5px solid",
                    borderColor:
                      activeCategory === cat
                        ? "var(--primary)"
                        : "var(--border)",
                    background:
                      activeCategory === cat ? "var(--primary)" : "transparent",
                    color:
                      activeCategory === cat
                        ? "#fff"
                        : "var(--muted-foreground)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "var(--font-body)",
                    transition: "all 0.15s",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Meal list */}
          <div style={{ padding: "0 20px" }}>
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <MealRowSkeleton key={i} />
              ))}
            {!loading &&
              mealsByCategory.map((meal) => (
                <MealRow key={meal.id} meal={meal} />
              ))}
          </div>
        </div>

        {/* Desktop sticky cart panel */}
        <div
          ref={cartPanelRef}
          className="desktop-cart-panel"
          style={{
            width: 320,
            flexShrink: 0,
            position: "sticky",
            top: 0,
            height: "fit-content",
            padding: "20px 20px 20px 0",
            display: "none",
          }}
        >
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
            }}
          >
            <div
              style={{ padding: 16, borderBottom: "1px solid var(--border)" }}
            >
              <h3
                style={{
                  margin: 0,
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--foreground)",
                }}
              >
                Your order {cartCount > 0 && `(${cartCount})`}
              </h3>
            </div>
            <div
              style={{ padding: "0 16px", maxHeight: 400, overflowY: "auto" }}
            >
              {cartItems.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center" }}>
                  <p style={{ fontSize: 28 }}>🛒</p>
                  <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                    Your cart is empty
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <CartItemRow key={item.meal.id} item={item} />
                ))
              )}
            </div>
            {cartItems.length > 0 && (
              <div
                style={{ padding: 16, borderTop: "1px solid var(--border)" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: "var(--muted-foreground)",
                      fontSize: 14,
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontWeight: 800,
                      color: "var(--primary)",
                      fontSize: 18,
                    }}
                  >
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  style={{
                    width: "100%",
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "13px 0",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    letterSpacing: "0.04em",
                  }}
                >
                  Proceed to checkout →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile floating cart bar */}
      {cartCount > 0 && (
        <div
          className="mobile-cart-bar"
          style={{
            position: "fixed",
            bottom: 70,
            left: 16,
            right: 16,
            background: "var(--primary)",
            borderRadius: 14,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 8px 32px rgba(232,88,26,0.45)",
            cursor: "pointer",
            zIndex: 50,
          }}
          onClick={handleCheckout}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                background: "rgba(255,255,255,0.25)",
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
                color: "#fff",
              }}
            >
              {cartCount}
            </span>
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>
              View cart
            </span>
          </div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
            ${cartTotal.toFixed(2)}
          </span>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-cart-panel { display: block !important; }
          .mobile-cart-bar { display: none !important; }
        }
      `}</style>
    </div>
  )
}
