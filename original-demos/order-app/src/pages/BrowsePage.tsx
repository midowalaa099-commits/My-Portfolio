import { useState, useEffect } from "react"
import { Restaurant } from "../types"
import { apiGetRestaurants } from "../mockData"
import RestaurantCard from "../components/RestaurantCard"
import { RestaurantCardSkeleton } from "../components/Skeleton"

export default function BrowsePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [openOnly, setOpenOnly] = useState(false)
  const [sort, setSort] = useState("newest")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError("")
    const timer = setTimeout(async () => {
      try {
        const data = await apiGetRestaurants(query, openOnly, sort)
        if (!cancelled) setRestaurants(data)
      } catch {
        if (!cancelled)
          setError("Failed to load restaurants. Please try again.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, openOnly, sort])

  return (
    <div
      className="page-enter"
      style={{ padding: "24px 20px 100px", maxWidth: 900, margin: "0 auto" }}
    >
      {/* Header */}
      <div className="hero-panel" style={{ marginBottom: 28 }}>
        <p
          style={{
            color: "var(--primary)",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            margin: "0 0 10px",
          }}
        >
          Fresh picks near you
        </p>
        <h1
          className="font-display"
          style={{
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          What are you
          <br />
          <span style={{ color: "var(--primary)" }}>craving today?</span>
        </h1>
        <p
          style={{
            color: "var(--muted-foreground)",
            fontSize: 14,
            lineHeight: 1.7,
            maxWidth: 480,
            margin: "14px 0 0",
          }}
        >
          Discover local favorites, order in a few taps, and follow every step
          to your door.
        </p>
      </div>

      {/* Search + filters */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 28,
        }}
      >
        {/* Search input */}
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted-foreground)",
              fontSize: 16,
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search restaurants or cuisines…"
            style={{
              width: "100%",
              background: "var(--card)",
              border: "1.5px solid var(--border)",
              borderRadius: 12,
              padding: "13px 16px 13px 44px",
              color: "var(--foreground)",
              fontSize: 15,
              fontFamily: "var(--font-body)",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Filter row */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Open now toggle */}
          <button
            onClick={() => setOpenOnly((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 16px",
              borderRadius: 100,
              border: `1.5px solid ${
                openOnly ? "var(--success)" : "var(--border)"
              }`,
              background: openOnly ? "rgba(46,139,87,0.15)" : "transparent",
              color: openOnly ? "#4ade80" : "var(--muted-foreground)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              transition: "all 0.2s",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: openOnly ? "#4ade80" : "var(--muted-foreground)",
                flexShrink: 0,
              }}
            />
            Open now
          </button>

          {/* Sort */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {[
              { value: "newest", label: "Newest" },
              { value: "name", label: "A–Z" },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setSort(s.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 100,
                  border: `1.5px solid ${
                    sort === s.value ? "var(--primary)" : "var(--border)"
                  }`,
                  background:
                    sort === s.value ? "rgba(232,88,26,0.15)" : "transparent",
                  color:
                    sort === s.value
                      ? "var(--primary)"
                      : "var(--muted-foreground)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  transition: "all 0.2s",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && !error && (
        <p
          style={{
            fontSize: 12,
            color: "var(--muted-foreground)",
            marginBottom: 16,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {restaurants.length}{" "}
          {restaurants.length === 1 ? "restaurant" : "restaurants"} found
        </p>
      )}

      {/* Error state */}
      {error && (
        <div
          style={{
            textAlign: "center",
            padding: 48,
            background: "var(--card)",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
          }}
        >
          <p style={{ fontSize: 32, marginBottom: 12 }}>⚠️</p>
          <p
            style={{
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: 6,
            }}
          >
            Something went wrong
          </p>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
            {error}
          </p>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Restaurant grid */}
      {!loading && !error && restaurants.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && restaurants.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            background: "var(--card)",
            borderRadius: "var(--radius)",
            border: "1px dashed var(--border)",
          }}
        >
          <p style={{ fontSize: 48, marginBottom: 16 }}>🍽️</p>
          <h3
            className="font-display"
            style={{ fontSize: 22, fontWeight: 600, margin: "0 0 8px" }}
          >
            No restaurants found
          </h3>
          <p
            style={{
              fontSize: 14,
              color: "var(--muted-foreground)",
              maxWidth: 280,
              margin: "0 auto",
            }}
          >
            Try a different search term or remove the "open now" filter to see
            more options.
          </p>
          <button
            onClick={() => {
              setQuery("")
              setOpenOnly(false)
            }}
            style={{
              marginTop: 20,
              padding: "10px 24px",
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "var(--font-body)",
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
