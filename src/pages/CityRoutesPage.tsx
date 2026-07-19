import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, Route as RouteIcon } from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import molletImage from '../assets/Mollet.jpg'
import parisRuta1Image from '../assets/paris-ruta1.jpg'

type City = {
  id: string
  name: string
}

type Route = {
  id: string
  title: string
  description?: string | null
  is_premium?: boolean
}

export default function CityRoutesPage() {
  const { id } = useParams()
  const [city, setCity] = useState<City | null>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      const { data: cityData, error: cityError } = await supabase
        .from('cities')
        .select('id, name')
        .eq('id', id)
        .single()

      if (cityError) {
        setError(cityError.message)
        setLoading(false)
        return
      }

      setCity(cityData)

      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('id, title, description, is_premium')  
        .eq('city_id', id)

      if (routesError) {
        setError(routesError.message)
      } else {
        setRoutes(routesData || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [id])

  if (loading) {
    return <div className="p-6">Cargando rutas...</div>
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>
  }

  const heroImage =
  city?.id === '7c33ef71-1361-48ef-83ca-9ed66aaac565'
    ? parisRuta1Image
    : city?.name === 'Mollet del Vallès'
      ? molletImage
      : 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?q=80&w=1600&auto=format&fit=crop'

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative h-64 overflow-hidden">
  <img
    src={heroImage}
    alt={city?.name || 'Ciudad'}
    className="absolute inset-0 h-full w-full object-cover"
  />

  <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-8 text-white">
          <Link
            to="/"
            className="mb-6 flex w-fit items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-md"
          >
            <ArrowLeft size={18} />
            Volver
          </Link>

          <p className="mb-1 text-sm text-gray-200">Rutas disponibles</p>

          <h1 className="text-4xl font-extrabold">
            {city?.name}
          </h1>
        </div>
      </div>

      <div className="px-5 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Elige una ruta
            </h2>
            <p className="text-sm text-gray-500">
              Explora recorridos guiados a tu ritmo
            </p>
          </div>

          <div className="rounded-full bg-blue-100 p-3 text-blue-600">
            <MapPin size={22} />
          </div>
        </div>

        {routes.length === 0 ? (
          <div className="rounded-3xl bg-white p-5 text-gray-600 shadow-md">
            No hay rutas disponibles para esta ciudad.
          </div>
        ) : (
          <div className="grid gap-5">
            {routes.map((route) => (
              <Link
                to={`/route/${route.id}`}
                key={route.id}
                className="group block overflow-hidden rounded-3xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                      <RouteIcon size={22} />
                    </div>

                    <span
  className={`rounded-full px-3 py-1 text-xs font-semibold ${
    route.is_premium
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-gray-100 text-gray-600'
  }`}
>
  {route.is_premium ? '✨ Experiencia exclusiva' : '🆓 Experiencia gratuita'}
</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800">
                    {route.title}
                  </h3>

                  {route.description && (
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {route.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-center gap-4 text-sm text-gray-500">
  <span className="flex items-center gap-1">
    <Clock size={16} />
    A tu ritmo
  </span>

  <span className="flex items-center gap-1">
    <MapPin size={16} />
    Con GPS
  </span>
</div>

{route.is_premium && (
  <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
  <p className="font-semibold text-yellow-900">
    ✨ Una experiencia para descubrir la ciudad
  </p>

  <p className="mt-2 text-sm leading-relaxed text-yellow-800">
    Déjate guiar por las obras más emblemáticas mientras descubres las
    historias y curiosidades que hacen único cada lugar.
  </p>

  <div className="mt-4 space-y-2 text-sm text-yellow-800">
    <p>🎧 Audioguía durante todo el recorrido</p>
    <p>📍 Navegación GPS paso a paso</p>
    <p>🏛️ Lugares imprescindibles</p>
    <p>💶 Acceso por 7 €</p>
  </div>
</div>
)}

<div
  className={`mt-5 rounded-full px-5 py-3 text-center text-sm font-semibold shadow-md transition ${
    route.is_premium
      ? 'bg-yellow-400 text-yellow-900 group-hover:bg-yellow-500'
      : 'bg-blue-600 text-white group-hover:bg-blue-700'
  }`}
>
  {route.is_premium ? '✨ Descubrir esta experiencia' : 'Empezar ruta'}
</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}