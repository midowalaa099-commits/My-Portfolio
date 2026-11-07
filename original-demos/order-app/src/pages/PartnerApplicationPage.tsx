import { FormEvent, useEffect, useState } from "react"
import {
  apiCreateOwnerApplication,
  apiGetCurrentOwnerApplication,
} from "../mockData"
import { useApp } from "../store"
import { OwnerApplication } from "../types"

export default function PartnerApplicationPage() {
  const { toast } = useApp()
  const [application, setApplication] = useState<OwnerApplication | null>(null)
  const [businessName, setBusinessName] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiGetCurrentOwnerApplication()
      .then(setApplication)
      .catch((error) => toast(error.message, "error"))
      .finally(() => setLoading(false))
  }, [toast])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      setApplication(await apiCreateOwnerApplication(businessName, notes))
      toast("Application sent for admin review", "success")
    } catch (error: any) {
      toast(error.message ?? "Could not submit application", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <main className="page-enter dashboard-page">
        <p>Loading application…</p>
      </main>
    )

  return (
    <main className="page-enter dashboard-page">
      <div className="page-heading">
        <span className="eyebrow">Restaurant partners</span>
        <h1>Grow your business with Order App</h1>
        <p>
          Restaurant accounts are reviewed before they can publish menus or
          receive orders. This protects customers and restaurant brands.
        </p>
      </div>
      {application ? (
        <section className="panel partner-status">
          <span className={`status-pill status-${application.status}`}>
            {application.status}
          </span>
          <h2>{application.businessName}</h2>
          <p>
            {application.status === "pending"
              ? "Your application is waiting for an administrator. You can keep using your customer account meanwhile."
              : application.status === "approved"
                ? "Approved. Sign out and back in to open your restaurant dashboard."
                : "This application was not approved. Contact support before submitting new business details."}
          </p>
          {application.notes && (
            <div className="muted-box">
              <strong>Details</strong>
              <p>{application.notes}</p>
            </div>
          )}
        </section>
      ) : (
        <form className="panel form-stack" onSubmit={submit}>
          <label>
            Business or restaurant name
            <input
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              required
              maxLength={255}
              placeholder="Cairo Kitchen"
            />
          </label>
          <label>
            Tell us about your restaurant
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="Cuisine, location, opening plan, and anything our review team should know."
            />
          </label>
          <button className="primary-button" disabled={saving}>
            {saving ? "Sending…" : "Submit for review"}
          </button>
        </form>
      )}
    </main>
  )
}
