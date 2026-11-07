export type Role = "customer" | "owner" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface Restaurant {
  id: string
  name: string
  address: string
  isOpen: boolean
  ownerId: string
  createdAt: string
  imageUrl: string
  cuisine: string
  rating: number
  deliveryTime: string
  latitude?: number | null
  longitude?: number | null
}

export interface Meal {
  id: string
  restaurantId: string
  name: string
  description: string
  price: number
  isAvailable: boolean
  imageUrl?: string
  category?: string
}

export interface CartLineItem {
  meal: Meal
  quantity: number
}

export interface Address {
  id: string
  userId: string
  label: string
  street: string
  city: string
  phone: string
  latitude?: number | null
  longitude?: number | null
}

export interface DeliveryLocation {
  id: string
  latitude: number
  longitude: number
  recordedAt: string
}

export interface OrderTracking {
  orderId: string
  status: OrderStatus
  trackingActive: boolean
  location: DeliveryLocation | null
  restaurant: {
    id: string
    name: string
    address: string
    latitude: number | null
    longitude: number | null
  }
  destination: {
    label: string
    addressLine: string
    city: string
    latitude: number | null
    longitude: number | null
  }
}

export type OrderStatus = "pending" | "preparing" | "on_the_way" | "delivered" | "cancelled"

export interface OrderItem {
  meal: Meal
  quantity: number
  price: number
}

export interface Order {
  id: string
  userId: string
  restaurantId: string
  restaurantName: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  address: Address
  createdAt: string
}

export type Page = "login" | "register" | "browse" | "restaurant" | "cart" | "addresses" | "orders" | "order-tracking" | "profile" | "owner-restaurants" | "owner-meals" | "owner-orders" | "partner-application" | "admin-dashboard"

export interface NavState {
  page: Page
  restaurantId?: string
  orderId?: string
}

export interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

export type OwnerApplicationStatus = "pending" | "approved" | "rejected"

export interface OwnerApplication {
  id: string
  userId: string
  businessName: string
  notes: string
  status: OwnerApplicationStatus
  createdAt: string
  applicant?: User
}

export interface AdminStats {
  customers: number
  restaurantOwners: number
  restaurants: number
  orders: number
  pendingApplications: number
}
