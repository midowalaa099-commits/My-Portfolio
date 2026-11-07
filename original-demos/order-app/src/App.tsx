import { AppProvider, useApp } from "./store"
import NavBar from "./components/NavBar"
import ToastContainer from "./components/Toast"
import AuthPage from "./pages/AuthPage"
import BrowsePage from "./pages/BrowsePage"
import RestaurantDetailPage from "./pages/RestaurantDetailPage"
import CartPage from "./pages/CartPage"
import AddressesPage from "./pages/AddressesPage"
import OrdersPage from "./pages/OrdersPage"
import ProfilePage from "./pages/ProfilePage"
import OwnerRestaurantsPage from "./pages/OwnerRestaurantsPage"
import OwnerMealsPage from "./pages/OwnerMealsPage"
import OwnerOrdersPage from "./pages/OwnerOrdersPage"
import PartnerApplicationPage from "./pages/PartnerApplicationPage"
import AdminDashboardPage from "./pages/AdminDashboardPage"
import TrackingPage from "./pages/TrackingPage"

function Router() {
  const { state } = useApp()
  const { user, nav } = state

  if (state.sessionLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "var(--muted-foreground)",
        }}
      >
        Loading…
      </div>
    )
  }

  // Unauthenticated routes
  if (!user) {
    return nav.page === "register" ? <AuthPage /> : <AuthPage />
  }

  // Authenticated routes
  switch (nav.page) {
    case "browse":
      return <BrowsePage />
    case "restaurant":
      return <RestaurantDetailPage />
    case "cart":
      return <CartPage />
    case "addresses":
      return <AddressesPage />
    case "orders":
      return <OrdersPage />
    case "order-tracking":
      return <TrackingPage />
    case "profile":
      return <ProfilePage />
    case "owner-restaurants":
      return <OwnerRestaurantsPage />
    case "owner-meals":
      return <OwnerMealsPage />
    case "owner-orders":
      return <OwnerOrdersPage />
    case "partner-application":
      return <PartnerApplicationPage />
    case "admin-dashboard":
      return <AdminDashboardPage />
    default:
      return user.role === "admin" ? (
        <AdminDashboardPage />
      ) : user.role === "owner" ? (
        <OwnerRestaurantsPage />
      ) : (
        <BrowsePage />
      )
  }
}

function AppShell() {
  const { state } = useApp()
  const { user, nav } = state
  const isAuth = !user
  const isRestaurantDetail = nav.page === "restaurant"

  // Restaurant detail has its own back button; other auth pages have no nav
  const showNav = user && !isAuth

  // On desktop, authenticated pages need left margin for sidebar
  const pageStyle: React.CSSProperties = showNav
    ? {
        flex: 1,
        minHeight: "100vh",
        background: "var(--background)",
        overflowY: "auto",
      }
    : {
        flex: 1,
        minHeight: "100vh",
        background: "var(--background)",
      }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--background)",
      }}
    >
      {showNav && <NavBar />}
      <div
        style={{
          ...pageStyle,
          ...(showNav ? {} : {}),
        }}
        className={showNav ? "app-content" : ""}
      >
        <Router />
      </div>
      <ToastContainer />
      <style>{`
        @media (min-width: 900px) {
          .app-content {
            margin-left: 240px;
          }
        }
      `}</style>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
