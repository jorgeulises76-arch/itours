import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useState } from 'react'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

type Point = {
  id: string
  name: string | null
  description: string | null
  latitude: number
  longitude: number
  order_number: number
}

type RouteMapProps = {
  points: Point[]
}

export default function RouteMap({ points }: RouteMapProps) {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [routeProgressIndex, setRouteProgressIndex] = useState(0)
  const [lastSpokenPointIndex, setLastSpokenPointIndex] = useState<number | null>(null)
  useEffect(() => {
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
  setUserPosition([
    position.coords.latitude,
    position.coords.longitude,
  ])
  setAccuracy(position.coords.accuracy)
},
    (error) => {
      console.log('Error geolocation:', error)
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }
  )

  return () => navigator.geolocation.clearWatch(watchId)
}, [])

  const sortedPoints = [...points].sort(
    (a, b) => a.order_number - b.order_number
  )

  let distanceToStart: number | null = null

if (userPosition && sortedPoints.length > 0) {
  distanceToStart = getDistance(
    userPosition[0],
    userPosition[1],
    sortedPoints[0].latitude,
    sortedPoints[0].longitude
  )
}
let nearestPoint:
  | {
      point: Point
      index: number
      distance: number
    }
  | null = null

if (userPosition && sortedPoints.length > 0) {
  const distances = sortedPoints.map((point, index) => ({
    point,
    index,
    distance: getDistance(
      userPosition[0],
      userPosition[1],
      point.latitude,
      point.longitude
    ),
  }))

  nearestPoint = distances.reduce((closest, current) =>
    current.distance < closest.distance ? current : closest
  )
}

const currentPoint =
  nearestPoint && nearestPoint.distance <= 0.02
    ? nearestPoint
    : null

useEffect(() => {
  if (!currentPoint) return

  if (currentPoint.index !== lastSpokenPointIndex) {
    speak(
      `Has llegado a ${
        currentPoint.point.name || `el punto ${currentPoint.index + 1}`
      }`
    )

    setLastSpokenPointIndex(currentPoint.index)
  }

  if (currentPoint.index >= routeProgressIndex) {
    const nextIndex = Math.min(
      currentPoint.index + 1,
      sortedPoints.length - 1
    )

    setRouteProgressIndex(nextIndex)
  }
}, [
  currentPoint,
  lastSpokenPointIndex,
  routeProgressIndex,
  sortedPoints.length,
])

const isLastPoint =
  currentPoint !== null && currentPoint.index === sortedPoints.length - 1

let nextPoint: typeof nearestPoint = null

if (userPosition && sortedPoints.length > 0 && !isLastPoint) {
  const pointToNavigate = sortedPoints[routeProgressIndex]

  nextPoint = {
    point: pointToNavigate,
    index: routeProgressIndex,
    distance: getDistance(
      userPosition[0],
      userPosition[1],
      pointToNavigate.latitude,
      pointToNavigate.longitude
    ),
  }
}

const distanceStatus = distanceToStart !== null
  ? getDistanceStatus(distanceToStart)
  : null

const shouldGuideToStart =
  routeProgressIndex === 0 && distanceToStart !== null && distanceToStart > 0.1

const targetPoint = shouldGuideToStart
  ? sortedPoints[0]
  : sortedPoints[routeProgressIndex]

const navigationText = shouldGuideToStart
  ? 'Ir al inicio de la ruta'
  : `Continuar al punto ${routeProgressIndex + 1}`

  const isNearestPointIntermediate =
  nearestPoint !== null && nearestPoint.index > 0 && !currentPoint

  const center: [number, number] = [
    sortedPoints[0].latitude,
    sortedPoints[0].longitude,
  ]

  const polylinePositions: [number, number][] = sortedPoints.map((point) => [
    point.latitude,
    point.longitude,
  ])

  function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371 // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}
function getDistanceStatus(distanceKm: number) {
  if (distanceKm > 1) {
    return {
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: '🔴',
      title: 'Estás lejos del inicio',
      message: 'Acércate al punto de inicio para comenzar esta ruta.',
    }
  }

  if (distanceKm > 0.1) {
    return {
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: '🟡',
      title: 'Estás cerca del inicio',
      message: 'Estás a pocos minutos de poder empezar la ruta.',
    }
  }

  return {
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: '🟢',
    title: 'Puedes empezar la ruta',
    message: 'Ya estás en la zona de inicio. ¡Disfruta el tour!',
  }
}
function speak(text: string) {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'es-ES'
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

function RoutingToNextPoint({
  userPosition,
  nextPoint,
}: {
  userPosition: [number, number] | null
  nextPoint:
    | {
        point: Point
        index: number
        distance: number
      }
    | null
}) {
  const map = useMap()

  useEffect(() => {
    if (!userPosition || !nextPoint) return

    const routingControl = L.Routing.control({
  router: L.Routing.osrmv1({
    serviceUrl: 'https://router.project-osrm.org/route/v1',
    profile: 'foot',
  }),

  waypoints: [
    L.latLng(userPosition[0], userPosition[1]),
    L.latLng(nextPoint.point.latitude, nextPoint.point.longitude),
  ],
  routeWhileDragging: false,
  show: false,
  addWaypoints: false,
  fitSelectedRoutes: false,
}).addTo(map)

    return () => {
      map.removeControl(routingControl)
    }
  }, [map, userPosition, nextPoint])

  return null
}
function RecenterMap({ position }: { position: [number, number] | null }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom())
    }
  }, [position, map])

  return null
}
  return (
    <div className="mt-6 space-y-4">
      <h2 className="mb-3 text-xl font-semibold">Mapa de la ruta</h2>
{distanceToStart !== null && distanceStatus && !currentPoint && (
  <div
  className={`mt-4 rounded-3xl border p-5 shadow-md backdrop-blur-sm ${distanceStatus.color}`}
>
    <p className="text-lg font-semibold">
      {distanceStatus.icon} {distanceStatus.title}
    </p>
    <p className="mt-1 text-sm">
      Estás a {distanceToStart.toFixed(2)} km del punto de inicio .
    </p>
    <p className="mt-1 text-sm">
      {distanceStatus.message}
    </p>
    
    {targetPoint && (
  <a
    href={`https://www.google.com/maps/dir/?api=1&destination=${targetPoint.latitude},${targetPoint.longitude}&travelmode=walking`}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-3 inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
  >
    🧭 {navigationText}
  </a>
)}
  </div>
)}

{nearestPoint && !currentPoint && (
  <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-800">

    <p className="text-lg font-semibold">
      🧭 Punto más cercano: Punto {nearestPoint.point.name}
    </p>

    <p className="mt-1 text-sm">
      Estás a {nearestPoint.distance.toFixed(2)} km de este punto.
    </p>

    {isNearestPointIntermediate && (
      <div className="mt-3 rounded-xl bg-white/70 p-3 text-sm text-blue-900">
        <p>
          Estás más cerca de un punto intermedio de la ruta.
        </p>

        <p className="mt-1">
          Puedes empezar desde aquí o ir al inicio para hacer la ruta completa.
        </p>

        <div className="mt-3 flex gap-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${sortedPoints[0].latitude},${sortedPoints[0].longitude}&travelmode=walking`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-blue-700 px-3 py-2 text-white"
          >
            🧭 Ir al inicio
          </a>

          <a
  href={`https://www.google.com/maps/dir/?api=1&destination=${nearestPoint.point.latitude},${nearestPoint.point.longitude}&travelmode=walking`}
  target="_blank"
  rel="noopener noreferrer"
  className="rounded-xl bg-green-600 px-3 py-2 text-white"
>
  📍 Empezar desde aquí
</a>
        </div>
      </div>
    )}

  </div>
)}
{currentPoint && (
  <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">
    
    <p className="text-lg font-semibold">
      ✅ Estás en: {currentPoint.point.name || `Punto ${currentPoint.index + 1}`}
    </p>

    {currentPoint.point.description ? (
  <div className="mt-2 space-y-2">
    <p className="text-sm leading-relaxed">
      {currentPoint.point.description}
    </p>

    <button
  type="button"
  onClick={() => speak(currentPoint.point.description!)}
  className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white"
>
  🔊 Escuchar descripción
  </button>
  </div>
) : (
  <p className="mt-2 text-sm italic text-gray-500">
    (Sin descripción)
  </p>
)}
{isLastPoint && (
  <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
    <p className="text-lg font-semibold">
      🎉 Has llegado al final de la ruta
    </p>

    <p className="mt-2 text-sm">
      Gracias por hacer este recorrido con iTours. Esperamos que hayas disfrutado
      la experiencia.
    </p>

    <p className="mt-2 text-sm">
      Puedes volver al listado de rutas para descubrir nuevos recorridos cercanos.
    </p>

    <a
      href="/"
      className="mt-4 inline-block rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md"
    >
      Explorar nuevas rutas
    </a>
  </div>
)}

    {nextPoint && !isLastPoint && (
  <div className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-purple-800">
    <p className="text-lg font-semibold">
      ➡️ Siguiente parada: {nextPoint.point.name || `Punto ${nextPoint.index + 1}`}
    </p>

    <p className="mt-1 text-sm">
      A {nextPoint.distance.toFixed(2)} km de tu posición actual.
    </p>
    <a
  href={`https://www.google.com/maps/dir/?api=1&destination=${nextPoint.point.latitude},${nextPoint.point.longitude}&travelmode=walking`}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-3 inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
>
  🧭 Iniciar navegación
</a>
  </div>
)}
  </div>
)}

      <div className="h-80 overflow-hidden rounded-2xl border shadow-sm">
        <MapContainer
          center={center}
          zoom={16}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <RecenterMap position={userPosition} />
          
          
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {sortedPoints.map((point, index) => (
  <Marker
    key={point.id}
    position={[point.latitude, point.longitude]}
    icon={L.divIcon({
      className: '',
      html: `
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background: #14b8a6;
          border: 3px solid white;
          color: white;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          font-size: 14px;
        ">
          ${index + 1}
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    })}
  >
    <Popup>
      {index + 1}. {point.name || `Punto ${index + 1}`}
    </Popup>
  </Marker>
))}

          

{userPosition && accuracy && (
  <CircleMarker
    center={userPosition}
    radius={Math.min(accuracy / 4, 50)}
    pathOptions={{
      color: '#60a5fa',
      fillColor: '#93c5fd',
      fillOpacity: 0.12,
      weight: 1,
    }}
  />
)}

          {userPosition && (
  <CircleMarker
  center={userPosition}
  radius={12}
  pathOptions={{
    color: '#ffffff',
    fillColor: '#2563eb',
    fillOpacity: 1,
    weight: 4,
  }}
>
    <Popup>Estás aquí</Popup>
  </CircleMarker>
)}


        </MapContainer>
      </div>
    </div>
  )
}