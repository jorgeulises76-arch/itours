import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

type City = {
  id: string
  name: string
}

type Route = {
  id: string
  title: string
  description?: string | null
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
        .select('id, title, description')
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

  return (
    <div className="p-6">
      <Link to="/" className="mb-4 inline-block text-blue-600">
        ← Volver a ciudades
      </Link>

      <h1 className="mb-4 text-3xl font-bold text-blue-600">
        Rutas de {city?.name}
      </h1>

      {routes.length === 0 ? (
        <p>No hay rutas para esta ciudad.</p>
      ) : (
        <div className="grid gap-4">
          {routes.map((route) => (
            <Link
              to={`/route/${route.id}`}
              key={route.id}
              className="block rounded-2xl border p-4 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-semibold">{route.title}</h3>
              {route.description && (
                <p className="mt-1 text-sm text-gray-600">
                  {route.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}