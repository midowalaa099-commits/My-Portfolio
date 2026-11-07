import { useCallback, useEffect, useState } from "react"
import {
  apiGetAdminOverview,
  apiGetOrders,
  apiGetOwnerApplications,
  apiReviewOwnerApplication,
} from "../mockData"
import { AdminStats, Order, OwnerApplication } from "../types"
import { useApp } from "../store"

export default function AdminDashboardPage() {
  const { navigate, toast } = useApp()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [applications, setApplications] = useState<OwnerApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  const load = useCallback(async () => {
    try {
      const [overview, pending, recentOrders] = await Promise.all([
        apiGetAdminOverview(),
        apiGetOwnerApplications(),
        apiGetOrders(),
      ])
      setStats(overview)
      setApplications(pending)
      setOrders(recentOrders)
    } catch (error: any) {
      toast(error.message ?? "Could not load admin dashboard", "error")
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void load()
  }, [load])

  async function review(id: string, decision: "approve" | "reject") {
    setReviewing(id)
    try {
      await apiReviewOwnerApplication(id, decision)
      setApplications((current) =>
        current.filter((application) => application.id !== id),
      )
      setStats((current) =>
        current
          ? {
              ...current,
              pendingApplications: Math.max(0, current.pendingApplications - 1),
              restaurantOwners:
                current.restaurantOwners + (decision === "approve" ? 1 : 0),
            }
          : current,
      )
      toast(
        `Application ${decision === "approve" ? "approved" : "rejected"}`,
        "success",
      )
    } catch (error: any) {
      toast(error.message ?? "Review failed", "error")
    } finally {
      setReviewing(null)
    }
  }

  return (
    <main className="page-enter dashboard-page admin-page">
      <div className="page-heading">
        <span className="eyebrow">Operations console</span>
        <h1>Admin dashboard</h1>
        <p>
          Review restaurant partners and monitor the marketplace from one
          protected workspace.
        </p>
      </div>
      {loading ? (
        <p>Loading dashboard…</p>
      ) : (
        <>
          <section className="stats-grid">
            {[
              ["Customers", stats?.customers],
              ["Restaurant owners", stats?.restaurantOwners],
              ["Restaurants", stats?.restaurants],
              ["Orders", stats?.orders],
              ["Awaiting review", stats?.pendingApplications],
            ].map(([label, value]) => (
              <article className="stat-card" key={String(label)}>
                <span>{label}</span>
                <strong>{value ?? 0}</strong>
              </article>
            ))}
          </section>
          <section className="panel applications-panel">
            <div className="section-title">
              <div>
                <span className="eyebrow">Partner onboarding</span>
                <h2>Pending applications</h2>
              </div>
              <span className="count-badge">{applications.length}</span>
            </div>
            {applications.length === 0 ? (
              <div className="empty-state">
                <span>✓</span>
                <h3>All caught up</h3>
                <p>There are no restaurant applications waiting for review.</p>
              </div>
            ) : (
              applications.map((application) => (
                <article className="application-row" key={application.id}>
                  <div>
                    <h3>{application.businessName}</h3>
                    <p>
                      {application.applicant?.name ?? "Applicant"} ·{" "}
                      {application.applicant?.email ?? "Email unavailable"}
                    </p>
                    {application.notes && (
                      <p className="application-notes">{application.notes}</p>
                    )}
                  </div>
                  <div className="review-actions">
                    <button
                      className="secondary-button danger-button"
                      disabled={reviewing === application.id}
                      onClick={() => review(application.id, "reject")}
                    >
                      Reject
                    </button>
                    <button
                      className="primary-button"
                      disabled={reviewing === application.id}
                      onClick={() => review(application.id, "approve")}
                    >
                      Approve owner
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
          <section className="panel admin-orders-panel">
            <div className="section-title">
              <div><span className="eyebrow">Delivery oversight</span><h2>Recent orders</h2></div>
              <span className="count-badge">{orders.length}</span>
            </div>
            {orders.length === 0 ? <p className="admin-order-empty">No orders yet.</p> : orders.map((order) => (
              <article className="admin-order-row" key={order.id}>
                <div><strong>#{order.id} · {order.restaurantName}</strong><span>{order.status.replace(/_/g, " ")} · {order.address.city}</span></div>
                <button className="secondary-button" onClick={() => navigate("order-tracking", undefined, order.id)}>Inspect tracking</button>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  )
}
