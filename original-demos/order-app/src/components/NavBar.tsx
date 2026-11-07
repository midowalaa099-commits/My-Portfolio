import { useApp } from "../store"
import { Page } from "../types"
import BrandLogo from "./BrandLogo"

interface NavItem {
  page: Page
  label: string
  icon: string
  ownerOnly?: boolean
}

const CUSTOMER_NAV: NavItem[] = [
  { page: "browse", label: "Discover", icon: "🔍" },
  { page: "orders", label: "Orders", icon: "📋" },
  { page: "addresses", label: "Addresses", icon: "📍" },
  { page: "profile", label: "Profile", icon: "👤" },
  { page: "partner-application", label: "Sell with us", icon: "🏪" },
]

const ADMIN_NAV: NavItem[] = [
  { page: "admin-dashboard", label: "Dashboard", icon: "▦" },
  { page: "profile", label: "Profile", icon: "👤" },
]

const OWNER_NAV: NavItem[] = [
  { page: "owner-restaurants", label: "Restaurants", icon: "🏪" },
  { page: "owner-orders", label: "Orders", icon: "📋" },
  { page: "profile", label: "Profile", icon: "👤" },
]

export default function NavBar() {
  const { state, navigate, cartCount } = useApp()
  const { user, nav } = state
  if (!user) return null

  const isOwner = user.role === "owner"
  const isAdmin = user.role === "admin"
  const navItems = isAdmin ? ADMIN_NAV : isOwner ? OWNER_NAV : CUSTOMER_NAV
  const currentPage = nav.page

  const isCartPage = currentPage === "cart"
  const showCartBubble = !isCartPage && cartCount > 0 && !isOwner

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 240,
          background: "rgba(15, 16, 20, 0.9)",
          borderRight: "1px solid var(--border)",
          flexDirection: "column",
          padding: "24px 0",
          zIndex: 100,
          backdropFilter: "blur(20px)",
        }}
        className="desktop-nav"
      >
        {/* Logo */}
        <div style={{ padding: "0 18px 34px" }}>
          <BrandLogo size={40} />
        </div>

        {/* Nav items */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: "0 10px",
            flex: 1,
          }}
        >
          {navItems.map((item) => {
            const active = currentPage === item.page
            return (
              <button
                key={item.page}
                onClick={() => navigate(item.page)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: active ? "var(--primary)" : "transparent",
                  color: active ? "#fff" : "var(--muted-foreground)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  textAlign: "left",
                  width: "100%",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--secondary)"
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent"
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Cart button (desktop, customer) */}
        {!isOwner && !isAdmin && (
          <div style={{ padding: "0 10px 16px" }}>
            <button
              onClick={() => navigate("cart")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderRadius: 10,
                border: "none",
                background: isCartPage ? "var(--primary)" : "var(--secondary)",
                color: isCartPage ? "#fff" : "var(--secondary-foreground)",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                textAlign: "left",
                width: "100%",
                position: "relative",
              }}
            >
              <span style={{ fontSize: 16 }}>🛒</span>
              Cart
              {cartCount > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "var(--primary)",
                    color: "#fff",
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 7px",
                    minWidth: 20,
                    textAlign: "center",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        )}
      </nav>

      {/* Mobile bottom bar */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(15, 16, 20, 0.94)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          zIndex: 100,
          paddingBottom: "env(safe-area-inset-bottom)",
          backdropFilter: "blur(20px)",
        }}
        className="mobile-nav"
      >
        {navItems.map((item) => {
          const active = currentPage === item.page
          return (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "10px 4px 12px",
                border: "none",
                background: "transparent",
                color: active ? "var(--primary)" : "var(--muted-foreground)",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                letterSpacing: "0.04em",
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
        {!isOwner && !isAdmin && (
          <button
            onClick={() => navigate("cart")}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "10px 4px 12px",
              border: "none",
              background: "transparent",
              color: isCartPage ? "var(--primary)" : "var(--muted-foreground)",
              cursor: "pointer",
              fontSize: 10,
              fontWeight: isCartPage ? 700 : 500,
              letterSpacing: "0.04em",
              position: "relative",
            }}
          >
            <span style={{ fontSize: 20, position: "relative" }}>
              🛒
              {showCartBubble && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -8,
                    background: "var(--primary)",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 16,
                    height: 16,
                    fontSize: 9,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </span>
            Cart
          </button>
        )}
      </nav>

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav { display: none !important; }
        }
      `}</style>
    </>
  )
}
