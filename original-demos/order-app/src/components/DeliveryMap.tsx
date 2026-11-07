import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

export interface MapPoint {
  latitude: number
  longitude: number
}

interface DeliveryMapProps {
  restaurant?: MapPoint | null
  delivery?: MapPoint | null
  destination?: MapPoint | null
}

const MARKERS = {
  restaurant: { label: "R", color: "#ff6738", title: "Restaurant" },
  delivery: { label: "●", color: "#4a90e2", title: "Delivery" },
  destination: { label: "⌂", color: "#2e8b57", title: "Destination" },
} as const

function markerIcon(kind: keyof typeof MARKERS) {
  const marker = MARKERS[kind]
  return L.divIcon({
    className: "delivery-map-marker",
    html: `<span style="--marker-color:${marker.color}">${marker.label}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

export default function DeliveryMap({
  restaurant,
  delivery,
  destination,
}: DeliveryMapProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!elementRef.current || mapRef.current) return
    const map = L.map(elementRef.current, { zoomControl: true }).setView(
      [30.0444, 31.2357],
      12,
    )
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)
    mapRef.current = map
    layerRef.current = L.layerGroup().addTo(map)
    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    layer.clearLayers()

    const points = [
      ["restaurant", restaurant] as const,
      ["delivery", delivery] as const,
      ["destination", destination] as const,
    ].filter((entry): entry is readonly [keyof typeof MARKERS, MapPoint] =>
      Boolean(entry[1]),
    )

    const latLngs = points.map(([kind, point]) => {
      const latLng = L.latLng(point.latitude, point.longitude)
      L.marker(latLng, { icon: markerIcon(kind) })
        .bindTooltip(MARKERS[kind].title, { direction: "top" })
        .addTo(layer)
      return latLng
    })

    if (latLngs.length > 1) {
      L.polyline(latLngs, {
        color: "#ff6738",
        weight: 3,
        opacity: 0.68,
        dashArray: "8 9",
      }).addTo(layer)
      map.fitBounds(L.latLngBounds(latLngs).pad(0.25), { maxZoom: 16 })
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 15)
    }
  }, [restaurant, delivery, destination])

  return <div className="delivery-map" ref={elementRef} aria-label="Delivery tracking map" />
}
