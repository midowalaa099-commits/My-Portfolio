interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({
  width,
  height,
  className = "",
  style = {},
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, ...style }}
    />
  )
}

export function RestaurantCardSkeleton() {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        border: "1px solid var(--border)",
      }}
    >
      <Skeleton height={180} style={{ borderRadius: 0 }} />
      <div
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <Skeleton height={22} width="60%" />
        <Skeleton height={14} width="80%" />
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <Skeleton height={22} width={70} style={{ borderRadius: 100 }} />
          <Skeleton height={22} width={80} style={{ borderRadius: 100 }} />
        </div>
      </div>
    </div>
  )
}

export function MealRowSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        padding: "16px 0",
        borderBottom: "1px solid var(--border)",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}
      >
        <Skeleton height={18} width="55%" />
        <Skeleton height={13} width="80%" />
        <Skeleton height={13} width="40%" />
        <Skeleton height={20} width={60} style={{ marginTop: 4 }} />
      </div>
      <Skeleton
        width={88}
        height={88}
        style={{ borderRadius: 10, flexShrink: 0 }}
      />
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: "var(--radius)",
        padding: 20,
        border: "1px solid var(--border)",
      }}
    >
      <Skeleton height={20} width="40%" style={{ marginBottom: 12 }} />
      <Skeleton height={14} width="60%" style={{ marginBottom: 8 }} />
      <Skeleton height={14} width="30%" style={{ marginBottom: 16 }} />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={4} style={{ flex: 1, borderRadius: 100 }} />
        ))}
      </div>
    </div>
  )
}
