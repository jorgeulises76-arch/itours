import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, MapPin, ListOrdered } from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import RouteMap from '../components/RouteMap'
import molletImage from '../assets/Mollet.jpg'

type RouteData = {
  id: string
  title: string | null
  description: string | null
  duration_estimated: number | null
  distance_km: number | null
  city_id: string
  is_premium?: boolean
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
        .select('id, title, description, duration_estimated, distance_km, city_id, is_premium')
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
        .select('id, name, description, latitude, longitude, order_number')
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
    <div className="min-h-screen bg-gray-100">
      <div
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${molletImage})` }}
      >
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-8 text-white">
          <Link
            to={`/city/${route.city_id}`}
            className="mb-6 flex w-fit items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-md"
          >
            <ArrowLeft size={18} />
            Volver
          </Link>

          <div className="mb-3 flex items-center gap-2">
  {route.is_premium && (
    <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-900">
      ⭐ PREMIUM
    </span>
  )}

  <span className="text-sm text-gray-200">
    Ruta guiada con GPS
  </span>
</div>

          <h1 className="text-4xl font-extrabold leading-tight">
            {route.title || 'Ruta sin título'}
          </h1>
        </div>
      </div>

      <div className="px-5 py-6">
        {route.description && (
          <p className="mb-5 rounded-3xl bg-white p-5 text-sm leading-relaxed text-gray-600 shadow-md">
            {route.description}
          </p>
        )}

        <div className="mb-6 grid grid-cols-2 gap-4">
          {route.duration_estimated !== null && (
            <div className="rounded-3xl bg-white p-4 shadow-md">
              <div className="mb-2 w-fit rounded-full bg-blue-100 p-2 text-blue-600">
                <Clock size={20} />
              </div>
              <p className="text-xs font-medium text-gray-500">Duración</p>
              <p className="text-lg font-bold text-gray-800">
                {route.duration_estimated} min
              </p>
            </div>
          )}

          {route.distance_km !== null && (
            <div className="rounded-3xl bg-white p-4 shadow-md">
              <div className="mb-2 w-fit rounded-full bg-blue-100 p-2 text-blue-600">
                <MapPin size={20} />
              </div>
              <p className="text-xs font-medium text-gray-500">Distancia</p>
              <p className="text-lg font-bold text-gray-800">
                {route.distance_km} km
              </p>
            </div>
          )}
        </div>

        {route.is_premium ? (
  <div className="rounded-3xl bg-white p-8 shadow-lg">
    <div className="text-center">
      <div className="mb-4 text-5xl">🔒</div>

      <h2 className="text-2xl font-bold text-gray-800">
        Ruta Premium
      </h2>

      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        Esta experiencia premium estará disponible próximamente en iTours.
        Incluye navegación completa, contenido ampliado y una experiencia guiada mejorada.
      </p>

      <button
  disabled
  className="mt-6 cursor-not-allowed rounded-full bg-yellow-300 px-6 py-3 font-semibold text-yellow-900 opacity-80 shadow-md"
>
  Próximamente
</button>
    </div>
  </div>
) : (
  <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
    <RouteMap points={points} />
  </div>
)}

        <div className="mt-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <ListOrdered size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Puntos de la ruta
              </h2>
              <p className="text-sm text-gray-500">
                Sigue las paradas en orden
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {points.map((point, index) => (
              <div
                key={point.id}
                className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-white font-bold shadow-md">
                  {index + 1}
                </div>

                <div>
                  <p className="font-semibold text-gray-800">
                    {point.name || `Punto ${index + 1}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    Parada del recorrido
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}