import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { useEffect, useState } from 'react'

type Point = {
  id: string
  name: string | null
  latitude: number
  longitude: number
  order_number: number
}

type RouteMapProps = {
  points: Point[]
}

export default function RouteMap({ points }: RouteMapProps) {const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
  useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setUserPosition([
        position.coords.latitude,
        position.coords.longitude,
      ])
    },
    (error) => {
      console.log('Error geolocation:', error)
    }
  )
}, [])
    if (points.length === 0) {
    return null
  }

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
  nearestPoint && nearestPoint.distance <= 0.03
    ? nearestPoint
    : null
let nextPoint: typeof nearestPoint = null

if (currentPoint && sortedPoints.length > 0) {
  const nextIndex = currentPoint.index + 1

  if (nextIndex < sortedPoints.length) {
    nextPoint = {
      point: sortedPoints[nextIndex],
      index: nextIndex,
      distance: getDistance(
        userPosition![0],
        userPosition![1],
        sortedPoints[nextIndex].latitude,
        sortedPoints[nextIndex].longitude
      ),
    }
  }
}
const distanceStatus = distanceToStart !== null
  ? getDistanceStatus(distanceToStart)
  : null

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
  return (
    <div className="mt-6 space-y-4">
      <h2 className="mb-3 text-xl font-semibold">Mapa de la ruta</h2>
{distanceToStart !== null && distanceStatus && !currentPoint && (
  <div className={`mt-4 rounded-2xl border p-4 ${distanceStatus.color}`}>
    <p className="text-lg font-semibold">
      {distanceStatus.icon} {distanceStatus.title}
    </p>
    <p className="mt-1 text-sm">
      Estás a {distanceToStart.toFixed(2)} km del punto de inicio .
    </p>
    <p className="mt-1 text-sm">
      {distanceStatus.message}
    </p>
  </div>
)}

{nearestPoint && !currentPoint && (
  <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
    <p className="text-lg font-semibold">
      🧭 Punto más cercano: Punto {nearestPoint.index + 1}
    </p>
    <p className="mt-1 text-sm">
      Estás a {nearestPoint.distance.toFixed(2)} km de este punto.
    </p>
  </div>
)}
{currentPoint && (
  <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">
    {nextPoint && (
  <div className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-purple-800">
    <p className="text-lg font-semibold">
      ➡️ Siguiente parada: {nextPoint.point.name || `Punto ${nextPoint.index + 1}`}
    </p>
    <p className="mt-1 text-sm">
      A {nextPoint.distance.toFixed(2)} km de tu posición actual.
    </p>
  </div>
)}
    <p className="text-lg font-semibold">
      ✅ Estás en: {currentPoint.point.name || `Punto ${currentPoint.index + 1}`}
    </p>
    <p className="mt-1 text-sm">
      Ya puedes explorar este punto del recorrido.
    </p>
  </div>
)}
      <div className="h-80 overflow-hidden rounded-2xl border shadow-sm">
        <MapContainer
          center={center}
          zoom={15}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {sortedPoints.map((point, index) => (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
            >
              <Popup>{point.name || `Punto ${index + 1}`}</Popup>
            </Marker>
          ))}

          <Polyline positions={polylinePositions} />
          {userPosition && (
  <Marker position={userPosition}>
    <Popup>Estás aquí</Popup>
  </Marker>
)}

        </MapContainer>
      </div>
    </div>
  )
}