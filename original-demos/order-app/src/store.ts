import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
  createElement,
  useEffect,
} from "react"
import { apiGetCurrentUser, apiLogout } from "./mockData"
import {
  User,
  CartLineItem,
  Meal,
  Address,
  NavState,
  Page,
  Toast,
} from "./types"

interface AppState {
  user: User | null
  cart: CartLineItem[]
  cartRestaurantId: string | null
  nav: NavState
  toasts: Toast[]
  selectedAddress: Address | null
  sessionLoading: boolean
}

type Action = { type: "LOGIN"; user: User } | {
  type: "SESSION_READY"
  user: User | null
} | { type: "LOGOUT" } | {
  type: "NAVIGATE"
  page: Page
  restaurantId?: string
  orderId?: string
} | { type: "CART_ADD"; meal: Meal } | { type: "CART_REMOVE"; mealId: string } | {
  type: "CART_SET_QTY"
  mealId: string
  qty: number
} | { type: "CART_CLEAR" } | { type: "SET_ADDRESS"; address: Address } | {
  type: "TOAST_ADD"
  toast: Toast
} | { type: "TOAST_REMOVE"; id: string }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.user }
    case "SESSION_READY":
      return {
        ...state,
        user: action.user,
        sessionLoading: false,
        nav: {
          page:
            action.user?.role === "admin"
              ? "admin-dashboard"
              : action.user?.role === "owner"
                ? "owner-restaurants"
                : action.user
                  ? "browse"
                  : "login",
        },
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        cart: [],
        cartRestaurantId: null,
        nav: { page: "login" },
      }
    case "NAVIGATE":
      return {
        ...state,
        nav: {
          page: action.page,
          restaurantId: action.restaurantId,
          orderId: action.orderId,
        },
      }
    case "CART_ADD": {
      const { meal } = action
      if (
        state.cartRestaurantId &&
        state.cartRestaurantId !== meal.restaurantId
      ) {
        // Different restaurant — reset cart
        return {
          ...state,
          cart: [{ meal, quantity: 1 }],
          cartRestaurantId: meal.restaurantId,
        }
      }
      const existing = state.cart.find((i) => i.meal.id === meal.id)
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((i) =>
            i.meal.id === meal.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
          cartRestaurantId: meal.restaurantId,
        }
      }
      return {
        ...state,
        cart: [...state.cart, { meal, quantity: 1 }],
        cartRestaurantId: meal.restaurantId,
      }
    }
    case "CART_REMOVE":
      return {
        ...state,
        cart: state.cart.filter((i) => i.meal.id !== action.mealId),
        cartRestaurantId:
          state.cart.length <= 1 ? null : state.cartRestaurantId,
      }
    case "CART_SET_QTY":
      if (action.qty <= 0) {
        return {
          ...state,
          cart: state.cart.filter((i) => i.meal.id !== action.mealId),
        }
      }
      return {
        ...state,
        cart: state.cart.map((i) =>
          i.meal.id === action.mealId ? { ...i, quantity: action.qty } : i,
        ),
      }
    case "CART_CLEAR":
      return { ...state, cart: [], cartRestaurantId: null }
    case "SET_ADDRESS":
      return { ...state, selectedAddress: action.address }
    case "TOAST_ADD":
      return { ...state, toasts: [...state.toasts, action.toast] }
    case "TOAST_REMOVE":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      }
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  login: (user: User) => void
  logout: () => void
  navigate: (page: Page, restaurantId?: string, orderId?: string) => void
  addToCart: (meal: Meal) => void
  removeFromCart: (mealId: string) => void
  setCartQty: (mealId: string, qty: number) => void
  clearCart: () => void
  setAddress: (address: Address) => void
  toast: (message: string, type?: Toast["type"]) => void
  dismissToast: (id: string) => void
  cartTotal: number
  cartCount: number
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    cart: [],
    cartRestaurantId: null,
    nav: { page: "login" },
    toasts: [],
    selectedAddress: null,
    sessionLoading: true,
  })

  useEffect(() => {
    apiGetCurrentUser().then((user) =>
      dispatch({ type: "SESSION_READY", user }),
    )
  }, [])

  const login = useCallback(
    (user: User) => dispatch({ type: "LOGIN", user }),
    [],
  )
  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // Ignore backend logout errors and keep the UI consistent.
    }
    dispatch({ type: "LOGOUT" })
  }, [])
  const navigate = useCallback(
    (page: Page, restaurantId?: string, orderId?: string) =>
      dispatch({ type: "NAVIGATE", page, restaurantId, orderId }),
    [],
  )
  const addToCart = useCallback(
    (meal: Meal) => dispatch({ type: "CART_ADD", meal }),
    [],
  )
  const removeFromCart = useCallback(
    (mealId: string) => dispatch({ type: "CART_REMOVE", mealId }),
    [],
  )
  const setCartQty = useCallback(
    (mealId: string, qty: number) =>
      dispatch({ type: "CART_SET_QTY", mealId, qty }),
    [],
  )
  const clearCart = useCallback(() => dispatch({ type: "CART_CLEAR" }), [])
  const setAddress = useCallback(
    (address: Address) => dispatch({ type: "SET_ADDRESS", address }),
    [],
  )

  const toast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = `t${Date.now()}`
    dispatch({ type: "TOAST_ADD", toast: { id, message, type } })
    setTimeout(() => dispatch({ type: "TOAST_REMOVE", id }), 3800)
  }, [])

  const dismissToast = useCallback(
    (id: string) => dispatch({ type: "TOAST_REMOVE", id }),
    [],
  )

  const cartTotal = state.cart.reduce(
    (sum, i) => sum + i.meal.price * i.quantity,
    0,
  )
  const cartCount = state.cart.reduce((sum, i) => sum + i.quantity, 0)

  return createElement(AppContext.Provider, {
    value: {
      state,
      login,
      logout,
      navigate,
      addToCart,
      removeFromCart,
      setCartQty,
      clearCart,
      setAddress,
      toast,
      dismissToast,
      cartTotal,
      cartCount,
    },
    children,
  })
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
