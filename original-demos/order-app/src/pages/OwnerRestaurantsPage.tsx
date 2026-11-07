import { useState, useEffect } from "react"
import { Restaurant } from "../types"
import { useApp } from "../store"
import {
  apiCreateRestaurant,
  apiDeleteRestaurant,
  apiGetOwnerRestaurants,
  apiUpdateRestaurant,
} from "../mockData"
import { RestaurantCardSkeleton } from "../components/Skeleton"

const EMPTY_FORM = { name: "", address: "", cuisine: "", latitude: null as number | null, longitude: null as number | null }

export default function OwnerRestaurantsPage() {
  const { navigate, toast } = useApp()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    apiGetOwnerRestaurants()
      .then(setRestaurants)
      .catch((error) =>
        toast(
          error instanceof Error ? error.message : "Could not load restaurants",
          "error",
        ),
      )
      .finally(() => setLoading(false))
  }, [toast])

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(true)
  }
  const openEdit = (r: Restaurant) => {
    setForm({ name: r.name, address: r.address, cuisine: r.cuisine, latitude: r.latitude ?? null, longitude: r.longitude ?? null })
    setEditId(r.id)
    setShowForm(true)
  }
  const closeForm = () => {
    setShowForm(false)
    setEditId(null)
  }

  const handleSave = async () => {
    if (!form.name || !form.address) {
      toast("Name and address are required", "error")
      return
    }
    if (editId) {
      const updated = await apiUpdateRestaurant(editId, {
        name: form.name,
        address: form.address,
        latitude: form.latitude,
        longitude: form.longitude,
      })
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === editId ? { ...updated, cuisine: form.cuisine } : r,
        ),
      )
      toast("Restaurant updated", "success")
    } else {
      const created = await apiCreateRestaurant({
        name: form.name,
        address: form.address,
        latitude: form.latitude,
        longitude: form.longitude,
      })
      const newR: Restaurant = { ...created, cuisine: form.cuisine }
      setRestaurants((prev) => [...prev, newR])
      toast("Restaurant added!", "success")
    }
    closeForm()
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast("Location is not available in this browser", "error")
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({ ...current, latitude: coords.latitude, longitude: coords.longitude }))
        toast("Restaurant pin added", "success")
      },
      () => toast("Location permission was not granted", "error"),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const handleDelete = async (id: string) => {
    await apiDeleteRestaurant(id)
    setRestaurants((prev) => prev.filter((r) => r.id !== id))
    toast("Restaurant removed", "info")
  }

  const toggleOpen = async (id: string) => {
    const restaurant = restaurants.find((item) => item.id === id)
    if (!restaurant) return
    const updated = await apiUpdateRestaurant(id, {
      isOpen: !restaurant.isOpen,
    })
    setRestaurants((prev) => prev.map((r) => (r.id === id ? updated : r)))
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

  return (
    <div
      className="page-enter"
      style={{ padding: "24px 20px 100px", maxWidth: 860, margin: "0 auto" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            className="font-display"
            style={{ fontSize: 28, fontWeight: 700, margin: 0 }}
          >
            My Restaurants
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 14,
              color: "var(--muted-foreground)",
            }}
          >
            {restaurants.length} location{restaurants.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 18px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          + Add
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--primary)",
            borderRadius: "var(--radius)",
            padding: 20,
            marginBottom: 24,
            boxShadow: "0 0 0 4px rgba(232,88,26,0.1)",
          }}
        >
          <h3 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 15 }}>
            {editId ? "Edit restaurant" : "New restaurant"}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              placeholder="Restaurant name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Address"
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Cuisine (e.g. Lebanese)"
              value={form.cuisine}
              onChange={(e) =>
                setForm((f) => ({ ...f, cuisine: e.target.value }))
              }
              style={inputStyle}
            />
            <button className="secondary-button location-button" onClick={useCurrentLocation}>
              ◎ {form.latitude == null ? "Add restaurant map pin" : "Restaurant pin added — update location"}
            </button>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={closeForm}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  background: "transparent",
                  color: "var(--muted-foreground)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  flex: 2,
                  padding: "11px 0",
                  background: "var(--primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                {editId ? "Update" : "Add restaurant"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 18,
          }}
        >
          {[1, 2, 3].map((i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && restaurants.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 18,
          }}
        >
          {restaurants.map((r) => (
            <div
              key={r.id}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  position: "relative",
                  paddingTop: "52%",
                  background: "var(--muted)",
                }}
              >
                <img
                  src={r.imageUrl}
                  alt={r.name}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, transparent 50%, rgba(12,10,8,0.7) 100%)",
                  }}
                />
              </div>
              <div
                style={{
                  padding: "14px 16px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div>
                  <h3
                    className="font-display"
                    style={{ margin: 0, fontSize: 17, fontWeight: 700 }}
                  >
                    {r.name}
                  </h3>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 12,
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {r.address}
                  </p>
                </div>
                {/* Open/closed toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => toggleOpen(r.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: r.isOpen
                        ? "rgba(46,139,87,0.15)"
                        : "rgba(80,60,45,0.3)",
                      border: `1px solid ${
                        r.isOpen ? "rgba(46,139,87,0.4)" : "var(--border)"
                      }`,
                      color: r.isOpen ? "#4ade80" : "var(--muted-foreground)",
                      borderRadius: 100,
                      padding: "5px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      transition: "all 0.2s",
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: r.isOpen
                          ? "#4ade80"
                          : "var(--muted-foreground)",
                        flexShrink: 0,
                      }}
                    />
                    {r.isOpen ? "Open" : "Closed"}
                  </button>
                </div>
                {/* Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                  <button
                    onClick={() => navigate("owner-meals", r.id)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      background: "var(--secondary)",
                      color: "var(--foreground)",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    🍽 Meals
                  </button>
                  <button
                    onClick={() => openEdit(r)}
                    style={{
                      padding: "8px 12px",
                      background: "var(--secondary)",
                      color: "var(--foreground)",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    style={{
                      padding: "8px 12px",
                      background: "rgba(201,48,48,0.1)",
                      color: "var(--destructive)",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && restaurants.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            background: "var(--card)",
            borderRadius: "var(--radius)",
            border: "1px dashed var(--border)",
          }}
        >
          <p style={{ fontSize: 48, marginBottom: 16 }}>🏪</p>
          <h3
            className="font-display"
            style={{ fontSize: 22, fontWeight: 600, margin: "0 0 8px" }}
          >
            No restaurants yet
          </h3>
          <p
            style={{
              fontSize: 14,
              color: "var(--muted-foreground)",
              marginBottom: 20,
            }}
          >
            Add your first restaurant to start accepting orders.
          </p>
          <button
            onClick={openAdd}
            style={{
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 24px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            Add restaurant
          </button>
        </div>
      )}
    </div>
  )
}
