import { Restaurant } from "../types"
import { useApp } from "../store"

interface Props {
  restaurant: Restaurant
}

export default function RestaurantCard({ restaurant }: Props) {
  const { navigate } = useApp()

  return (
    <button
      onClick={() => navigate("restaurant", restaurant.id)}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        textAlign: "left",
        width: "100%",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"
        ;(e.currentTarget as HTMLElement).style.boxShadow =
          "0 16px 40px rgba(0,0,0,0.4)"
        ;(e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.transform = "translateY(0)"
        ;(e.currentTarget as HTMLElement).style.boxShadow = "none"
        ;(e.currentTarget as HTMLElement).style.borderColor = "var(--border)"
      }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          paddingTop: "55%",
          background: "var(--muted)",
          overflow: "hidden",
        }}
      >
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.35s ease",
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.transform = "scale(1.04)"
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.transform = "scale(1)"
          }}
        />
        {/* Status badge */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: restaurant.isOpen
              ? "rgba(46,139,87,0.92)"
              : "rgba(80,60,45,0.92)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "3px 10px",
            borderRadius: 100,
            backdropFilter: "blur(4px)",
          }}
        >
          {restaurant.isOpen ? "Open" : "Closed"}
        </div>
        {/* Rating */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(12,10,8,0.85)",
            color: "var(--primary)",
            fontSize: 12,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 100,
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ★ {restaurant.rating}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "14px 16px 16px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <h3
          className="font-display"
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "var(--foreground)",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {restaurant.name}
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "var(--muted-foreground)",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {restaurant.address}
        </p>
        <div
          style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}
        >
          <span
            style={{
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              fontSize: 11,
              fontWeight: 500,
              padding: "3px 10px",
              borderRadius: 100,
              letterSpacing: "0.04em",
            }}
          >
            {restaurant.cuisine}
          </span>
          <span
            style={{
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              fontSize: 11,
              fontWeight: 500,
              padding: "3px 10px",
              borderRadius: 100,
            }}
          >
            🕐 {restaurant.deliveryTime}
          </span>
        </div>
      </div>
    </button>
  )
}
