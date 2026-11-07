import { useState, useEffect } from "react"
import { Address } from "../types"
import { useApp } from "../store"
import { apiCreateAddress, apiCreateOrder, apiGetAddresses } from "../mockData"
import CartItemRow from "../components/CartItemRow"
import AddressCard from "../components/AddressCard"

export default function CartPage() {
  const { state, navigate, cartTotal, clearCart, setAddress, toast } = useApp()
  const { cart, selectedAddress } = state
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [showAddNew, setShowAddNew] = useState(false)
  const [newAddr, setNewAddr] = useState({
    label: "Home",
    street: "",
    city: "",
    phone: "",
  })

  useEffect(() => {
    apiGetAddresses().then((addrs) => {
      setAddresses(addrs)
      if (addrs.length > 0 && !selectedAddress) setAddress(addrs[0])
      setLoadingAddresses(false)
    })
  }, [])

  const deliveryFee = 2.5
  const total = cartTotal + deliveryFee

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast("Please select a delivery address", "error")
      return
    }
    if (cart.length === 0) {
      toast("Your cart is empty", "error")
      return
    }
    setPlacing(true)
    try {
      await apiCreateOrder({
        restaurant_id: cart[0].meal.restaurantId,
        address_id: selectedAddress.id,
        items: cart.map((item) => ({
          meal_id: item.meal.id,
          quantity: item.quantity,
        })),
      })
      clearCart()
      toast(
        "Order placed! 🎉 Hang tight, the restaurant is getting to work.",
        "success",
      )
      navigate("orders")
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not place the order",
        "error",
      )
    } finally {
      setPlacing(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--muted)",
    border: "1.5px solid var(--border)",
    borderRadius: 10,
    padding: "11px 14px",
    color: "var(--foreground)",
    fontSize: 14,
    fontFamily: "var(--font-body)",
    boxSizing: "border-box",
  }

  if (cart.length === 0) {
    return (
      <div
        className="page-enter"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
          minHeight: "60vh",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 56, marginBottom: 16 }}>🛒</p>
        <h2
          className="font-display"
          style={{ fontSize: 26, fontWeight: 700, margin: "0 0 10px" }}
        >
          Your cart is empty
        </h2>
        <p
          style={{
            color: "var(--muted-foreground)",
            fontSize: 15,
            maxWidth: 280,
            margin: "0 auto 24px",
          }}
        >
          Browse restaurants and add some items to get started.
        </p>
        <button
          onClick={() => navigate("browse")}
          style={{
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "13px 28px",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          Browse restaurants
        </button>
      </div>
    )
  }

  return (
    <div
      className="page-enter"
      style={{ padding: "24px 20px 100px", maxWidth: 720, margin: "0 auto" }}
    >
      <h1
        className="font-display"
        style={{ fontSize: 28, fontWeight: 700, margin: "0 0 24px" }}
      >
        Your cart
      </h1>

      {/* Cart items */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          marginBottom: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              color: "var(--muted-foreground)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Items
          </h2>
        </div>
        <div style={{ padding: "0 20px" }}>
          {cart.map((item) => (
            <CartItemRow key={item.meal.id} item={item} />
          ))}
        </div>
      </div>

      {/* Delivery address */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          marginBottom: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 20px 14px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              color: "var(--muted-foreground)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Delivery address
          </h2>
          <button
            onClick={() => setShowAddNew((v) => !v)}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            {showAddNew ? "Cancel" : "+ Add new"}
          </button>
        </div>
        <div
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {loadingAddresses ? (
            <p style={{ color: "var(--muted-foreground)", fontSize: 14 }}>
              Loading addresses…
            </p>
          ) : (
            addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                selected={selectedAddress?.id === addr.id}
                onSelect={() => setAddress(addr)}
              />
            ))
          )}
          {!loadingAddresses && addresses.length === 0 && !showAddNew && (
            <p
              style={{
                color: "var(--muted-foreground)",
                fontSize: 14,
                padding: "8px 0",
              }}
            >
              No saved addresses. Add one below.
            </p>
          )}
          {showAddNew && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                paddingTop: 4,
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                {["Home", "Work", "Other"].map((label) => (
                  <button
                    key={label}
                    onClick={() => setNewAddr((a) => ({ ...a, label }))}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: 8,
                      border: `1.5px solid ${
                        newAddr.label === label
                          ? "var(--primary)"
                          : "var(--border)"
                      }`,
                      background:
                        newAddr.label === label
                          ? "rgba(232,88,26,0.1)"
                          : "transparent",
                      color:
                        newAddr.label === label
                          ? "var(--primary)"
                          : "var(--muted-foreground)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Street address"
                value={newAddr.street}
                onChange={(e) =>
                  setNewAddr((a) => ({ ...a, street: e.target.value }))
                }
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="City"
                value={newAddr.city}
                onChange={(e) =>
                  setNewAddr((a) => ({ ...a, city: e.target.value }))
                }
                style={inputStyle}
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={newAddr.phone}
                onChange={(e) =>
                  setNewAddr((a) => ({ ...a, phone: e.target.value }))
                }
                style={inputStyle}
              />
              <button
                onClick={async () => {
                  if (!newAddr.street || !newAddr.city || !newAddr.phone) {
                    toast("Please fill all address fields", "error")
                    return
                  }
                  const addr = await apiCreateAddress(newAddr)
                  setAddresses((prev) => [...prev, addr])
                  setAddress(addr)
                  setShowAddNew(false)
                  toast("Address added", "success")
                }}
                style={{
                  background: "var(--primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "11px 0",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                Save address
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Order summary */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 20,
        }}
      >
        <h2
          style={{
            margin: "0 0 16px",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--muted-foreground)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Order summary
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              color: "var(--muted-foreground)",
            }}
          >
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              color: "var(--muted-foreground)",
            }}
          >
            <span>Delivery fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 18,
              fontWeight: 800,
              paddingTop: 12,
              borderTop: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            <span>Total</span>
            <span style={{ color: "var(--primary)" }}>${total.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={placing}
          style={{
            marginTop: 20,
            width: "100%",
            background: placing ? "var(--muted)" : "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "16px 0",
            fontWeight: 700,
            fontSize: 16,
            cursor: placing ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.04em",
            boxShadow: placing ? "none" : "0 8px 24px rgba(232,88,26,0.35)",
          }}
        >
          {placing ? "Placing order…" : `Place order · $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}
