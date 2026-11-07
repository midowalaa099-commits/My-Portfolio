import { useState, useEffect } from "react"
import { Meal, Restaurant } from "../types"
import { useApp } from "../store"
import {
  apiCreateMeal,
  apiDeleteMeal,
  apiGetMeals,
  apiGetRestaurant,
  apiUpdateMeal,
} from "../mockData"
import { MealRowSkeleton } from "../components/Skeleton"

const EMPTY_FORM = { name: "", description: "", price: "", category: "Mains" }
const CATEGORIES = ["Starters", "Mains", "Sides", "Desserts", "Drinks"]

export default function OwnerMealsPage() {
  const { state, navigate, toast } = useApp()
  const restaurantId = state.nav.restaurantId ?? ""
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    Promise.all([apiGetRestaurant(restaurantId), apiGetMeals(restaurantId)])
      .then(([restaurantData, mealsData]) => {
        setRestaurant(restaurantData)
        setMeals(mealsData)
      })
      .finally(() => setLoading(false))
  }, [restaurantId])

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(true)
  }
  const openEdit = (m: Meal) => {
    setForm({
      name: m.name,
      description: m.description,
      price: String(m.price),
      category: m.category ?? "Mains",
    })
    setEditId(m.id)
    setShowForm(true)
  }
  const closeForm = () => {
    setShowForm(false)
    setEditId(null)
  }

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast("Name and price are required", "error")
      return
    }
    const price = parseFloat(form.price)
    if (isNaN(price) || price <= 0) {
      toast("Enter a valid price", "error")
      return
    }
    if (editId) {
      const updated = await apiUpdateMeal(editId, {
        name: form.name,
        description: form.description,
        price,
      })
      setMeals((prev) =>
        prev.map((m) =>
          m.id === editId ? { ...updated, category: form.category } : m,
        ),
      )
      toast("Meal updated", "success")
    } else {
      const created = await apiCreateMeal(restaurantId, {
        name: form.name,
        description: form.description,
        price,
      })
      const newMeal: Meal = { ...created, category: form.category }
      setMeals((prev) => [...prev, newMeal])
      toast("Meal added!", "success")
    }
    closeForm()
  }

  const handleDelete = async (id: string) => {
    await apiDeleteMeal(id)
    setMeals((prev) => prev.filter((m) => m.id !== id))
    toast("Meal removed", "info")
  }

  const toggleAvailable = async (id: string) => {
    const meal = meals.find((item) => item.id === id)
    if (!meal) return
    const updated = await apiUpdateMeal(id, { isAvailable: !meal.isAvailable })
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...updated, category: m.category } : m)),
    )
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

  const categories = [...new Set(meals.map((m) => m.category ?? "Other"))]

  return (
    <div
      className="page-enter"
      style={{ padding: "24px 20px 100px", maxWidth: 720, margin: "0 auto" }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => navigate("owner-restaurants")}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            marginBottom: 8,
            padding: 0,
            fontFamily: "var(--font-body)",
          }}
        >
          ← My restaurants
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              className="font-display"
              style={{ fontSize: 26, fontWeight: 700, margin: 0 }}
            >
              {restaurant?.name ?? "Restaurant"} — Meals
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                color: "var(--muted-foreground)",
              }}
            >
              {meals.length} item{meals.length !== 1 ? "s" : ""}
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
            + Add meal
          </button>
        </div>
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
            {editId ? "Edit meal" : "New meal"}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              placeholder="Meal name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={inputStyle}
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  placeholder="Price ($)"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  style={inputStyle}
                  min="0"
                  step="0.5"
                />
              </div>
              <div style={{ flex: 1 }}>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  style={{ ...inputStyle }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
                {editId ? "Update" : "Add meal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading &&
        Array.from({ length: 4 }).map((_, i) => <MealRowSkeleton key={i} />)}

      {/* Meals by category */}
      {!loading &&
        meals.length > 0 &&
        categories.map((cat) => (
          <div key={cat} style={{ marginBottom: 24 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--primary)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 0,
              }}
            >
              {cat}
            </p>
            {meals
              .filter((m) => (m.category ?? "Other") === cat)
              .map((meal) => (
                <div
                  key={meal.id}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "14px 0",
                    borderBottom: "1px solid var(--border)",
                    opacity: meal.isAvailable ? 1 : 0.6,
                  }}
                >
                  {meal.imageUrl && (
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "var(--muted)",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={meal.imageUrl}
                        alt={meal.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: 15,
                        color: "var(--foreground)",
                      }}
                    >
                      {meal.name}
                    </p>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: 13,
                        color: "var(--muted-foreground)",
                        lineHeight: 1.4,
                      }}
                    >
                      {meal.description}
                    </p>
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontWeight: 800,
                        color: "var(--primary)",
                        fontSize: 15,
                      }}
                    >
                      ${meal.price.toFixed(2)}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      alignItems: "flex-end",
                      flexShrink: 0,
                    }}
                  >
                    <button
                      onClick={() => toggleAvailable(meal.id)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 100,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        background: meal.isAvailable
                          ? "rgba(46,139,87,0.15)"
                          : "rgba(80,60,45,0.3)",
                        color: meal.isAvailable
                          ? "#4ade80"
                          : "var(--muted-foreground)",
                        border: `1px solid ${
                          meal.isAvailable
                            ? "rgba(46,139,87,0.3)"
                            : "var(--border)"
                        }`,
                      }}
                    >
                      {meal.isAvailable ? "Available" : "Unavailable"}
                    </button>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => openEdit(meal)}
                        style={{
                          padding: "4px 10px",
                          background: "var(--secondary)",
                          border: "none",
                          color: "var(--foreground)",
                          borderRadius: 6,
                          fontSize: 12,
                          cursor: "pointer",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(meal.id)}
                        style={{
                          padding: "4px 10px",
                          background: "rgba(201,48,48,0.1)",
                          border: "none",
                          color: "var(--destructive)",
                          borderRadius: 6,
                          fontSize: 12,
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
        ))}

      {!loading && meals.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            background: "var(--card)",
            borderRadius: "var(--radius)",
            border: "1px dashed var(--border)",
          }}
        >
          <p style={{ fontSize: 40, marginBottom: 12 }}>🍽️</p>
          <h3
            className="font-display"
            style={{ fontSize: 20, fontWeight: 600, margin: "0 0 8px" }}
          >
            No meals yet
          </h3>
          <p
            style={{
              fontSize: 14,
              color: "var(--muted-foreground)",
              marginBottom: 20,
            }}
          >
            Add your first meal to start building your menu.
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
            Add meal
          </button>
        </div>
      )}
    </div>
  )
}
