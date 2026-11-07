import { useState, FormEvent } from "react"
import { useApp } from "../store"
import { apiLogin, apiRegister } from "../mockData"
import BrandLogo from "../components/BrandLogo"

export default function AuthPage() {
  const { login, navigate, toast } = useApp()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [accountType, setAccountType] =
    useState<"customer" | "restaurant_owner">("customer")
  const [businessName, setBusinessName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "login") {
        const user = await apiLogin(email, password)
        login(user)
        navigate(
          user.role === "admin"
            ? "admin-dashboard"
            : user.role === "owner"
              ? "owner-restaurants"
              : "browse",
        )
        toast(`Welcome back, ${user.name.split(" ")[0]}!`, "success")
      } else {
        if (!name.trim()) {
          setError("Name is required")
          setLoading(false)
          return
        }
        const user = await apiRegister(
          name,
          email,
          password,
          accountType,
          businessName,
        )
        login(user)
        navigate(
          accountType === "restaurant_owner" ? "partner-application" : "browse",
        )
        toast(
          accountType === "restaurant_owner"
            ? "Partner account created. Your restaurant is awaiting review."
            : `Account created! Welcome, ${user.name.split(" ")[0]}!`,
          "success",
        )
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--muted)",
    border: "1.5px solid var(--border)",
    borderRadius: 10,
    padding: "13px 16px",
    color: "var(--foreground)",
    fontSize: 15,
    fontFamily: "var(--font-body)",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  }

  return (
    <div
      className="page-enter"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--background)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background blobs */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(232,88,26,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -60,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(217,79,28,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        {/* Logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <BrandLogo size={54} />
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(20, 21, 25, 0.84)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "calc(var(--radius) * 1.5)",
            padding: 32,
            boxShadow: "0 30px 90px rgba(0,0,0,0.5)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Mode toggle */}
          <div
            style={{
              display: "flex",
              background: "var(--muted)",
              borderRadius: 10,
              padding: 4,
              marginBottom: 28,
            }}
          >
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m)
                  setError("")
                }}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  border: "none",
                  borderRadius: 8,
                  background: mode === m ? "var(--primary)" : "transparent",
                  color: mode === m ? "#fff" : "var(--muted-foreground)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "background 0.2s, color 0.2s",
                  fontFamily: "var(--font-body)",
                }}
              >
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {mode === "register" && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    background: "var(--muted)",
                    borderRadius: 10,
                    padding: 4,
                  }}
                >
                  {([
                    ["customer", "Order food"],
                    ["restaurant_owner", "Restaurant partner"],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAccountType(value)}
                      style={{
                        border: 0,
                        borderRadius: 8,
                        padding: "10px 8px",
                        cursor: "pointer",
                        fontWeight: 700,
                        background:
                          accountType === value ? "var(--card)" : "transparent",
                        color:
                          accountType === value
                            ? "var(--foreground)"
                            : "var(--muted-foreground)",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--muted-foreground)",
                      marginBottom: 6,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Full name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Layla Hassan"
                    style={inputStyle}
                    required
                  />
                </div>
                {accountType === "restaurant_owner" && (
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--muted-foreground)",
                        marginBottom: 6,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      Restaurant or business name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Cairo Kitchen"
                      style={inputStyle}
                      required
                      maxLength={255}
                    />
                  </div>
                )}
              </>
            )}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--muted-foreground)",
                  marginBottom: 6,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="layla@example.com"
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--muted-foreground)",
                  marginBottom: 6,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                required
                minLength={8}
              />
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(201,48,48,0.12)",
                  border: "1px solid rgba(201,48,48,0.3)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#ff6b6b",
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6,
                background: loading ? "var(--muted)" : "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "14px 0",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)",
                letterSpacing: "0.04em",
              }}
            >
              {loading
                ? "Loading…"
                : mode === "login"
                  ? "Sign in"
                  : accountType === "restaurant_owner"
                    ? "Apply as restaurant partner"
                    : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
