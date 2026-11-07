import { useEffect, useMemo, useState } from "react"
import DeliveryMap, { MapPoint } from "../components/DeliveryMap"
import {
  apiGetOrderTracking,
  apiGetOrderTrackingHistory,
} from "../mockData"
import { DeliveryLocation, OrderTracking } from "../types"
import { useApp } from "../store"

const STATUS_LABELS = {
  pending: "Order received",
  preparing: "Preparing your order",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

function point(latitude: number | null, longitude: number | null): MapPoint | null {
  return latitude == null || longitude == null ? null : { latitude, longitude }
}

function distanceInKm(a: MapPoint, b: MapPoint) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = radians(b.latitude - a.latitude)
  const dLon = radians(b.longitude - a.longitude)
  const startLat = radians(a.latitude)
  const endLat = radians(b.latitude)
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

export default function TrackingPage() {
  const { state, navigate, toast } = useApp()
  const orderId = state.nav.orderId
  const [tracking, setTracking] = useState<OrderTracking | null>(null)
  const [history, setHistory] = useState<DeliveryLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!orderId) return
    let cancelled = false
    let pollTimer: number | undefined

    async function refresh() {
      try {
        const data = await apiGetOrderTracking(orderId!)
        if (cancelled) return
        setTracking(data)
        if (state.user?.role !== "customer") {
          const locations = await apiGetOrderTrackingHistory(orderId!)
          if (!cancelled) setHistory(locations)
        }
        if (!cancelled && data.trackingActive) {
          pollTimer = window.setTimeout(refresh, 5000)
        }
      } catch (error) {
        if (!cancelled) {
          toast(error instanceof Error ? error.message : "Could not load tracking", "error")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void refresh()
    return () => {
      cancelled = true
      if (pollTimer) window.clearTimeout(pollTimer)
    }
  }, [orderId, state.user?.role, toast])

  const restaurantPoint = tracking
    ? point(tracking.restaurant.latitude, tracking.restaurant.longitude)
    : null
  const deliveryPoint = tracking?.location
    ? point(tracking.location.latitude, tracking.location.longitude)
    : null
  const destinationPoint = tracking
    ? point(tracking.destination.latitude, tracking.destination.longitude)
    : null
  const remaining = useMemo(
    () =>
      deliveryPoint && destinationPoint
        ? distanceInKm(deliveryPoint, destinationPoint)
        : null,
    [deliveryPoint, destinationPoint],
  )
  const lastUpdated = tracking?.location
    ? Math.max(0, Math.round((now - new Date(tracking.location.recordedAt).getTime()) / 1000))
    : null

  const backPage =
    state.user?.role === "admin"
      ? "admin-dashboard"
      : state.user?.role === "owner"
        ? "owner-orders"
        : "orders"

  if (!orderId) return null

  return (
    <main className="page-enter tracking-page">
      <button className="tracking-back" onClick={() => navigate(backPage)}>← Back to orders</button>
      <header className="tracking-header">
        <div>
          <span className="eyebrow">Live delivery · Order #{orderId}</span>
          <h1>{tracking ? STATUS_LABELS[tracking.status] : "Delivery tracking"}</h1>
          <p>
            {tracking?.trackingActive
              ? "Location updates automatically every five seconds."
              : "Live updates are available while the order is on the way."}
          </p>
        </div>
        {tracking && <span className={`tracking-state tracking-state-${tracking.status}`}>{STATUS_LABELS[tracking.status]}</span>}
      </header>

      {loading ? (
        <div className="panel tracking-loading">Loading secure tracking…</div>
      ) : tracking ? (
        <>
          <section className="tracking-map-shell">
            <DeliveryMap restaurant={restaurantPoint} delivery={deliveryPoint} destination={destinationPoint} />
            {!restaurantPoint && !deliveryPoint && !destinationPoint && (
              <div className="tracking-map-empty">Location coordinates have not been added yet.</div>
            )}
          </section>
          <section className="tracking-summary-grid">
            <article className="tracking-summary-card">
              <span>Restaurant</span>
              <strong>{tracking.restaurant.name}</strong>
              <small>{tracking.restaurant.address}</small>
            </article>
            <article className="tracking-summary-card">
              <span>Destination</span>
              <strong>{tracking.destination.label}</strong>
              <small>{tracking.destination.addressLine}, {tracking.destination.city}</small>
            </article>
            <article className="tracking-summary-card">
              <span>Last GPS update</span>
              <strong>{lastUpdated == null ? "Waiting for signal" : lastUpdated < 5 ? "Just now" : `${lastUpdated}s ago`}</strong>
              <small>{tracking.trackingActive ? "Live polling is active" : "Tracking is stopped"}</small>
            </article>
            <article className="tracking-summary-card">
              <span>Direct distance remaining</span>
              <strong>{remaining == null ? "Not available" : `${remaining.toFixed(1)} km`}</strong>
              <small>Estimate based on GPS, not road distance</small>
            </article>
          </section>
          {state.user?.role !== "customer" && (
            <section className="panel tracking-history">
              <div className="section-title"><div><span className="eyebrow">Operations</span><h2>Location history</h2></div><span className="count-badge">{history.length}</span></div>
              {history.length === 0 ? <p>No device updates have arrived yet.</p> : (
                <ol>{[...history].reverse().map((item) => <li key={item.id}><strong>{item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}</strong><span>{new Date(item.recordedAt).toLocaleString()}</span></li>)}</ol>
              )}
            </section>
          )}
        </>
      ) : null}
    </main>
  )
}
