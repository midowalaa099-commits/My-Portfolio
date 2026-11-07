import {
  Address,
  AdminStats,
  Meal,
  Order,
  OwnerApplication,
  DeliveryLocation,
  OrderTracking,
  Restaurant,
  User,
} from "./types"

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: "r1",
    name: "Al Halabi",
    address: "12 Damascus St, Beirut",
    isOpen: true,
    ownerId: "u2",
    createdAt: "2024-01-15",
    imageUrl:
      "https://images.unsplash.com/photo-1561339429-034b8a92e53d?w=800&h=500&fit=crop&auto=format",
    cuisine: "Syrian",
    rating: 4.8,
    deliveryTime: "25–35 min",
  },
  {
    id: "r2",
    name: "Zaatar w Zeit",
    address: "44 Hamra Ave, Beirut",
    isOpen: true,
    ownerId: "u2",
    createdAt: "2024-02-20",
    imageUrl:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop&auto=format",
    cuisine: "Lebanese",
    rating: 4.5,
    deliveryTime: "20–30 min",
  },
  {
    id: "r3",
    name: "Sushi Sora",
    address: "8 Gemmayze Lane, Beirut",
    isOpen: false,
    ownerId: "u2",
    createdAt: "2024-03-10",
    imageUrl:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=500&fit=crop&auto=format",
    cuisine: "Japanese",
    rating: 4.9,
    deliveryTime: "30–40 min",
  },
  {
    id: "r4",
    name: "The Burger Joint",
    address: "3 Mar Mikhael St, Beirut",
    isOpen: true,
    ownerId: "u2",
    createdAt: "2024-04-05",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=500&fit=crop&auto=format",
    cuisine: "American",
    rating: 4.3,
    deliveryTime: "15–25 min",
  },
  {
    id: "r5",
    name: "Noodle House",
    address: "19 Verdun St, Beirut",
    isOpen: true,
    ownerId: "u2",
    createdAt: "2024-05-01",
    imageUrl:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=500&fit=crop&auto=format",
    cuisine: "Asian",
    rating: 4.6,
    deliveryTime: "20–35 min",
  },
  {
    id: "r6",
    name: "Tawlet Beirut",
    address: "Naher St, Mar Mikhael, Beirut",
    isOpen: false,
    ownerId: "u2",
    createdAt: "2024-06-01",
    imageUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop&auto=format",
    cuisine: "Lebanese",
    rating: 4.7,
    deliveryTime: "35–45 min",
  },
]

const API_BASE = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "")
const TOKEN_KEY = "order-app-session-token"

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

function setToken(token?: string | null) {
  if (!token) {
    sessionStorage.removeItem(TOKEN_KEY)
    return
  }
  sessionStorage.setItem(TOKEN_KEY, token)
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers ?? {})
  headers.set("Accept", "application/json")
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const token = getToken()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const payload = await response.json().catch(() => null)
  const data =
    payload && typeof payload === "object" && "data" in payload
      ? payload.data
      : payload

  if (!response.ok) {
    const message =
      (payload &&
        typeof payload === "object" &&
        "message" in payload &&
        typeof payload.message === "string" &&
        payload.message) ||
      (payload &&
      typeof payload === "object" &&
      "errors" in payload &&
      payload.errors &&
      typeof payload.errors === "object"
        ? Object.values(payload.errors as Record<string, unknown>)
            .flat()
            .join(" ")
        : "Something went wrong")
    throw new Error(message)
  }

  return data as T
}

function mapUser(raw: any): User {
  return {
    id: String(raw?.id ?? ""),
    name: raw?.name ?? "",
    email: raw?.email ?? "",
    role:
      raw?.role === "admin"
        ? "admin"
        : raw?.role === "restaurant_owner" || raw?.role === "owner"
          ? "owner"
          : "customer",
  }
}

function mapRestaurant(raw: any): Restaurant {
  return {
    id: String(raw?.id ?? ""),
    name: raw?.name ?? "Restaurant",
    address: raw?.address ?? raw?.street ?? "",
    isOpen: Boolean(raw?.is_open ?? raw?.isOpen ?? true),
    ownerId: String(raw?.owner_id ?? raw?.ownerId ?? ""),
    createdAt: raw?.created_at ?? raw?.createdAt ?? new Date().toISOString(),
    imageUrl:
      raw?.image_url ??
      raw?.imageUrl ??
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=500&fit=crop&auto=format",
    cuisine: raw?.cuisine ?? raw?.category ?? "General",
    rating: Number(raw?.rating ?? 4.5),
    deliveryTime: raw?.delivery_time ?? raw?.deliveryTime ?? "25–35 min",
    latitude: raw?.latitude == null ? null : Number(raw.latitude),
    longitude: raw?.longitude == null ? null : Number(raw.longitude),
  }
}

function mapMeal(raw: any, restaurantId = ""): Meal {
  return {
    id: String(raw?.id ?? ""),
    restaurantId: String(
      raw?.restaurant_id ?? raw?.restaurantId ?? restaurantId,
    ),
    name: raw?.name ?? "Meal",
    description: raw?.description ?? "",
    price: Number(raw?.price ?? 0),
    isAvailable: Boolean(raw?.is_available ?? raw?.isAvailable ?? true),
    category: raw?.category ?? "Other",
    imageUrl: raw?.image_url ?? raw?.imageUrl ?? undefined,
  }
}

function mapAddress(raw: any): Address {
  return {
    id: String(raw?.id ?? ""),
    userId: String(raw?.user_id ?? raw?.userId ?? ""),
    label: raw?.label ?? "Home",
    street: raw?.address_line ?? raw?.street ?? "",
    city: raw?.city ?? "",
    phone: raw?.phone ?? "",
    latitude: raw?.latitude == null ? null : Number(raw.latitude),
    longitude: raw?.longitude == null ? null : Number(raw.longitude),
  }
}

function mapOrder(raw: any): Order {
  const items = Array.isArray(raw?.items)
    ? raw.items.map((item: any) => ({
        meal: mapMeal(
          item?.meal ?? {},
          String(raw?.restaurant?.id ?? raw?.restaurant_id ?? ""),
        ),
        quantity: Number(item?.quantity ?? 0),
        price: Number(item?.price ?? item?.subtotal ?? 0),
      }))
    : []

  return {
    id: String(raw?.id ?? ""),
    userId: String(raw?.user_id ?? raw?.userId ?? ""),
    restaurantId: String(
      raw?.restaurant?.id ?? raw?.restaurant_id ?? raw?.restaurantId ?? "",
    ),
    restaurantName:
      raw?.restaurant?.name ?? raw?.restaurantName ?? "Restaurant",
    items,
    total: Number(raw?.total_price ?? raw?.total ?? 0),
    status: (raw?.status ?? "pending") as Order["status"],
    address: mapAddress(
      raw?.address ?? {
        id: "",
        userId: "",
        label: "Home",
        street: "",
        city: "",
        phone: "",
      },
    ),
    createdAt: raw?.created_at ?? raw?.createdAt ?? new Date().toISOString(),
  }
}

export async function apiGetRestaurants(
  query?: string,
  openOnly?: boolean,
  sort?: string,
): Promise<Restaurant[]> {
  const params = new URLSearchParams()
  if (query) params.set("search", query)
  if (openOnly) params.set("is_open", "true")
  if (sort === "name") params.set("sort", "name")
  if (sort === "newest") params.set("sort", "-created_at")

  const data = await apiRequest<any[]>(
    `/restaurants${params.toString() ? `?${params.toString()}` : ""}`,
  )
  return Array.isArray(data) ? data.map(mapRestaurant) : []
}

export async function apiGetRestaurant(id: string): Promise<Restaurant | null> {
  const data = await apiRequest<any>(`/restaurants/${id}`)
  return data ? mapRestaurant(data) : null
}

export async function apiGetMeals(restaurantId: string): Promise<Meal[]> {
  const data = await apiRequest<any[]>(`/restaurants/${restaurantId}/meals`)
  return Array.isArray(data)
    ? data.map((meal) => mapMeal(meal, restaurantId))
    : []
}

export async function apiGetCurrentUser(): Promise<User | null> {
  if (!getToken()) return null
  try {
    return mapUser(await apiRequest<any>(`/me`))
  } catch {
    setToken(null)
    return null
  }
}

export async function apiGetAddresses(): Promise<Address[]> {
  const data = await apiRequest<any[]>(`/addresses`)
  return Array.isArray(data) ? data.map(mapAddress) : []
}

export async function apiGetOrders(): Promise<Order[]> {
  const data = await apiRequest<any[]>(`/orders`)
  return Array.isArray(data) ? data.map(mapOrder) : []
}

function mapDeliveryLocation(raw: any): DeliveryLocation {
  return {
    id: String(raw?.id ?? ""),
    latitude: Number(raw?.latitude),
    longitude: Number(raw?.longitude),
    recordedAt: raw?.recorded_at ?? new Date().toISOString(),
  }
}

export async function apiGetOrderTracking(id: string): Promise<OrderTracking> {
  const raw = await apiRequest<any>(`/orders/${id}/tracking`)
  return {
    orderId: String(raw?.order_id ?? id),
    status: raw?.status ?? "pending",
    trackingActive: Boolean(raw?.tracking_active),
    location: raw?.location ? mapDeliveryLocation(raw.location) : null,
    restaurant: {
      id: String(raw?.restaurant?.id ?? ""),
      name: raw?.restaurant?.name ?? "Restaurant",
      address: raw?.restaurant?.address ?? "",
      latitude:
        raw?.restaurant?.latitude == null
          ? null
          : Number(raw.restaurant.latitude),
      longitude:
        raw?.restaurant?.longitude == null
          ? null
          : Number(raw.restaurant.longitude),
    },
    destination: {
      label: raw?.destination?.label ?? "Delivery address",
      addressLine: raw?.destination?.address_line ?? "",
      city: raw?.destination?.city ?? "",
      latitude:
        raw?.destination?.latitude == null
          ? null
          : Number(raw.destination.latitude),
      longitude:
        raw?.destination?.longitude == null
          ? null
          : Number(raw.destination.longitude),
    },
  }
}

export async function apiGetOrderTrackingHistory(
  id: string,
): Promise<DeliveryLocation[]> {
  const data = await apiRequest<any[]>(`/orders/${id}/tracking/history`)
  return Array.isArray(data) ? data.map(mapDeliveryLocation) : []
}

export async function apiLogin(email: string, password: string): Promise<User> {
  const data = await apiRequest<{ user: any; token: string }>(`/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  const user = mapUser(data?.user ?? data)
  setToken(data?.token ?? getToken())
  return user
}

export async function apiRegister(
  name: string,
  email: string,
  password: string,
  accountType: "customer" | "restaurant_owner" = "customer",
  businessName?: string,
): Promise<User> {
  await apiRequest<any>(`/register`, {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: password,
      account_type: accountType,
      ...(businessName ? { business_name: businessName } : {}),
    }),
  })

  return apiLogin(email, password)
}

export async function apiLogout(): Promise<void> {
  try {
    await apiRequest<void>(`/logout`, { method: "POST" })
  } finally {
    setToken(null)
  }
}

export async function apiCreateAddress(payload: {
  label: string
  street: string
  city: string
  phone: string
  latitude?: number | null
  longitude?: number | null
}): Promise<Address> {
  const data = await apiRequest<any>(`/addresses`, {
    method: "POST",
    body: JSON.stringify({
      label: payload.label,
      address_line: payload.street,
      city: payload.city,
      phone: payload.phone,
      latitude: payload.latitude,
      longitude: payload.longitude,
    }),
  })
  return mapAddress(data)
}

export async function apiUpdateAddress(
  id: string,
  payload: { label: string; street: string; city: string; phone: string; latitude?: number | null; longitude?: number | null },
): Promise<Address> {
  const data = await apiRequest<any>(`/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      label: payload.label,
      address_line: payload.street,
      city: payload.city,
      phone: payload.phone,
      latitude: payload.latitude,
      longitude: payload.longitude,
    }),
  })
  return mapAddress(data)
}

export async function apiDeleteAddress(id: string): Promise<void> {
  await apiRequest<void>(`/addresses/${id}`, { method: "DELETE" })
}

export async function apiCreateOrder(payload: {
  restaurant_id: string
  address_id: string
  items: { meal_id: string; quantity: number }[]
}): Promise<Order> {
  const data = await apiRequest<any>(`/orders`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return mapOrder(data)
}

export async function apiUpdateOrderStatus(
  id: string,
  status: Order["status"],
): Promise<Order> {
  return mapOrder(
    await apiRequest<any>(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  )
}

export async function apiGetOwnerRestaurants(): Promise<Restaurant[]> {
  const user = await apiGetCurrentUser()
  const restaurants = await apiGetRestaurants()
  return restaurants.filter((restaurant) => restaurant.ownerId === user?.id)
}

export async function apiCreateRestaurant(payload: {
  name: string
  address: string
  latitude?: number | null
  longitude?: number | null
}): Promise<Restaurant> {
  return mapRestaurant(
    await apiRequest<any>(`/restaurants`, {
      method: "POST",
      body: JSON.stringify({ ...payload, is_open: true }),
    }),
  )
}

export async function apiUpdateRestaurant(
  id: string,
  payload: { name?: string; address?: string; isOpen?: boolean; latitude?: number | null; longitude?: number | null },
): Promise<Restaurant> {
  return mapRestaurant(
    await apiRequest<any>(`/restaurants/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.address !== undefined ? { address: payload.address } : {}),
        ...(payload.isOpen !== undefined ? { is_open: payload.isOpen } : {}),
        ...(payload.latitude !== undefined ? { latitude: payload.latitude } : {}),
        ...(payload.longitude !== undefined ? { longitude: payload.longitude } : {}),
      }),
    }),
  )
}

export async function apiDeleteRestaurant(id: string): Promise<void> {
  await apiRequest<void>(`/restaurants/${id}`, { method: "DELETE" })
}

export async function apiCreateMeal(
  restaurantId: string,
  payload: { name: string; description: string; price: number },
): Promise<Meal> {
  return mapMeal(
    await apiRequest<any>(`/restaurants/${restaurantId}/meals`, {
      method: "POST",
      body: JSON.stringify({ ...payload, is_available: true }),
    }),
    restaurantId,
  )
}

export async function apiUpdateMeal(
  id: string,
  payload: {
    name?: string
    description?: string
    price?: number
    isAvailable?: boolean
  },
): Promise<Meal> {
  return mapMeal(
    await apiRequest<any>(`/meals/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.description !== undefined
          ? { description: payload.description }
          : {}),
        ...(payload.price !== undefined ? { price: payload.price } : {}),
        ...(payload.isAvailable !== undefined
          ? { is_available: payload.isAvailable }
          : {}),
      }),
    }),
  )
}

export async function apiDeleteMeal(id: string): Promise<void> {
  await apiRequest<void>(`/meals/${id}`, { method: "DELETE" })
}

function mapOwnerApplication(raw: any): OwnerApplication {
  return {
    id: String(raw?.id ?? ""),
    userId: String(raw?.user_id ?? ""),
    businessName: raw?.business_name ?? "",
    notes: raw?.notes ?? "",
    status: raw?.status ?? "pending",
    createdAt: raw?.created_at ?? new Date().toISOString(),
    applicant: raw?.applicant ? mapUser(raw.applicant) : undefined,
  }
}

export async function apiGetCurrentOwnerApplication(): Promise<OwnerApplication | null> {
  const data = await apiRequest<any>(`/owner-applications/current`)
  return data ? mapOwnerApplication(data) : null
}

export async function apiCreateOwnerApplication(
  businessName: string,
  notes: string,
): Promise<OwnerApplication> {
  return mapOwnerApplication(
    await apiRequest<any>(`/owner-applications`, {
      method: "POST",
      body: JSON.stringify({ business_name: businessName, notes }),
    }),
  )
}

export async function apiGetAdminOverview(): Promise<AdminStats> {
  const data = await apiRequest<any>(`/admin/overview`)
  return {
    customers: Number(data?.stats?.customers ?? 0),
    restaurantOwners: Number(data?.stats?.restaurant_owners ?? 0),
    restaurants: Number(data?.stats?.restaurants ?? 0),
    orders: Number(data?.stats?.orders ?? 0),
    pendingApplications: Number(data?.stats?.pending_applications ?? 0),
  }
}

export async function apiGetOwnerApplications(): Promise<OwnerApplication[]> {
  const data = await apiRequest<any[]>(`/admin/owner-applications`)
  return Array.isArray(data) ? data.map(mapOwnerApplication) : []
}

export async function apiReviewOwnerApplication(
  id: string,
  decision: "approve" | "reject",
): Promise<OwnerApplication> {
  return mapOwnerApplication(
    await apiRequest<any>(`/admin/owner-applications/${id}/${decision}`, {
      method: "POST",
    }),
  )
}
