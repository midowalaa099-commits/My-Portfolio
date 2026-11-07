import { useState, useEffect } from "react"
import { Address } from "../types"
import { useApp } from "../store"
import {
  apiCreateAddress,
  apiDeleteAddress,
  apiGetAddresses,
  apiUpdateAddress,
} from "../mockData"
import AddressCard from "../components/AddressCard"

const EMPTY_FORM = { label: "Home", street: "", city: "", phone: "", latitude: null as number | null, longitude: null as number | null }

export default function AddressesPage() {
  const { toast } = useApp()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    apiGetAddresses().then((data) => {
      setAddresses(data)
      setLoading(false)
    })
  }, [])

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(true)
  }
  const openEdit = (a: Address) => {
    setForm({ label: a.label, street: a.street, city: a.city, phone: a.phone, latitude: a.latitude ?? null, longitude: a.longitude ?? null })
    setEditId(a.id)
    setShowForm(true)
  }
  const closeForm = () => {
    setShowForm(false)
    setEditId(null)
  }

  const handleSave = async () => {
    if (!form.street || !form.city || !form.phone) {
      toast("Please fill all fields", "error")
      return
    }
    try {
      if (editId) {
        const updated = await apiUpdateAddress(editId, form)
        setAddresses((prev) => prev.map((a) => (a.id === editId ? updated : a)))
        toast("Address updated", "success")
      } else {
        const newAddr = await apiCreateAddress(form)
        setAddresses((prev) => [...prev, newAddr])
        toast("Address added", "success")
      }
      closeForm()
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not save address",
        "error",
      )
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast("Location is not available in this browser", "error")
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({ ...current, latitude: coords.latitude, longitude: coords.longitude }))
        toast("Delivery pin added", "success")
      },
      () => toast("Location permission was not granted", "error"),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteAddress(id)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      toast("Address removed", "info")
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not remove address",
        "error",
      )
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

  return (
    <div
      className="page-enter"
      style={{ padding: "24px 20px 100px", maxWidth: 600, margin: "0 auto" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1
          className="font-display"
          style={{ fontSize: 28, fontWeight: 700, margin: 0 }}
        >
          Addresses
        </h1>
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

      {/* Add/Edit form */}
      {showForm && (
        <div
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--primary)",
            borderRadius: "var(--radius)",
            padding: 20,
            marginBottom: 20,
            boxShadow: "0 0 0 4px rgba(232,88,26,0.1)",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px",
              fontWeight: 700,
              fontSize: 15,
              color: "var(--foreground)",
            }}
          >
            {editId ? "Edit address" : "New address"}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {["Home", "Work", "Other"].map((label) => (
                <button
                  key={label}
                  onClick={() => setForm((f) => ({ ...f, label }))}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 8,
                    border: `1.5px solid ${
                      form.label === label ? "var(--primary)" : "var(--border)"
                    }`,
                    background:
                      form.label === label
                        ? "rgba(232,88,26,0.1)"
                        : "transparent",
                    color:
                      form.label === label
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
              value={form.street}
              onChange={(e) =>
                setForm((f) => ({ ...f, street: e.target.value }))
              }
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              style={inputStyle}
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              style={inputStyle}
            />
            <button className="secondary-button location-button" onClick={useCurrentLocation}>
              ◎ {form.latitude == null ? "Add precise delivery pin" : "Delivery pin added — update location"}
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
                {editId ? "Update" : "Save address"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: 90,
                background: "var(--card)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
              }}
              className="skeleton"
            />
          ))}
        </div>
      )}

      {/* Address list */}
      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {addresses.map((a) => (
            <AddressCard
              key={a.id}
              address={a}
              onEdit={() => openEdit(a)}
              onDelete={() => handleDelete(a.id)}
            />
          ))}
          {addresses.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 24px",
                background: "var(--card)",
                borderRadius: "var(--radius)",
                border: "1px dashed var(--border)",
              }}
            >
              <p style={{ fontSize: 40, marginBottom: 12 }}>📍</p>
              <h3
                className="font-display"
                style={{ fontSize: 20, fontWeight: 600, margin: "0 0 8px" }}
              >
                No saved addresses
              </h3>
              <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
                Add your first delivery address to get started.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
