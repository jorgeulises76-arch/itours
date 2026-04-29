import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import RouteMap from '../components/RouteMap'

type RouteData = {
  id: string
  title: string | null
  description: string | null
  duration_estimated: number | null
  distance_km: number | null
  city_id: string
}

type RoutePoint = {
  id: string
  name: string | null
  latitude: number
  longitude: number
  order_number: number
}

export default function RouteDetailPage() {
  const { id } = useParams()
  const [route, setRoute] = useState<RouteData | null>(null)
  const [points, setPoints] = useState<RoutePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoute = async () => {
      if (!id) {
        setError('No se recibió el id de la ruta')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('routes')
        .select('id, title, description, duration_estimated, distance_km, city_id')
        .eq('id', id)
        .single()

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setRoute(data)

      const { data: pointsData, error: pointsError } = await supabase
        .from('route_points')
        .select('id, name, latitude, longitude, order_number')
        .eq('route_id', id)
        .order('order_number', { ascending: true })

      if (pointsError) {
        setError(pointsError.message)
      } else {
        setPoints(pointsData || [])
      }

      setLoading(false)
    }

    fetchRoute()
  }, [id])

  if (loading) {
    return <div className="p-6">Cargando detalle de ruta...</div>
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>
  }

  if (!route) {
    return <div className="p-6">Ruta no encontrada</div>
  }

  return (
    <div className="p-6">
      <Link to={`/city/${route.city_id}`} className="text-blue-600">
        ← Volver a rutas
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-blue-600">
        {route.title || 'Ruta sin título'}
      </h1>

      {route.description && (
        <p className="mt-2 text-gray-600">{route.description}</p>
      )}

      <div className="mt-4 space-y-2 text-sm text-gray-700">
        {route.duration_estimated !== null && (
          <p>⏱ Duración: {route.duration_estimated} min</p>
        )}
        {route.distance_km !== null && (
          <p>📍 Distancia: {route.distance_km} km</p>
        )}
      </div>

      <RouteMap points={points} />

      <div className="mt-6">
        <h2 className="mb-3 text-xl font-semibold">Puntos de la ruta</h2>

        <div className="space-y-3">
          {points.map((point, index) => (
            <div
              key={point.id}
              className="rounded-xl border p-3 text-sm shadow-sm"
            >
              <p className="font-medium">
  {point.name || `Punto ${index + 1}`}
</p>
              <p className="text-gray-600">
                📍 {point.latitude}, {point.longitude}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}