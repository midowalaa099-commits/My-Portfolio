import { Address } from "../types"

const LABEL_ICONS: Record<string, string> = {
  Home: "🏠",
  Work: "🏢",
  Other: "📍",
}

interface Props {
  address: Address
  selected?: boolean
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  const icon = LABEL_ICONS[address.label] ?? "📍"

  return (
    <div
      onClick={onSelect}
      style={{
        background: "var(--card)",
        border: `1.5px solid ${selected ? "var(--primary)" : "var(--border)"}`,
        borderRadius: "var(--radius)",
        padding: 16,
        cursor: onSelect ? "pointer" : "default",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        boxShadow: selected ? "0 0 0 3px rgba(232,88,26,0.15)" : "none",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: selected ? "var(--primary)" : "var(--secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: 14,
            color: "var(--foreground)",
          }}
        >
          {address.label}
        </p>
        <p
          style={{
            margin: "3px 0 0",
            fontSize: 13,
            color: "var(--muted-foreground)",
            lineHeight: 1.4,
          }}
        >
          {address.street}, {address.city}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: 12,
            color: "var(--muted-foreground)",
          }}
        >
          {address.phone}
        </p>
      </div>
      {(onEdit || onDelete) && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            flexShrink: 0,
          }}
        >
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              style={{
                background: "var(--secondary)",
                border: "none",
                color: "var(--foreground)",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              style={{
                background: "rgba(201,48,48,0.15)",
                border: "none",
                color: "var(--destructive)",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
