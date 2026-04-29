import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

type City = {
  id: string
  name: string
}

export default function HomePage() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name')

      if (error) {
        setError(error.message)
      } else {
        setCities(data || [])
      }

      setLoading(false)
    }

    fetchCities()
  }, [])

  if (loading) {
    return <div className="p-6">Cargando ciudades...</div>
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-3xl font-bold text-blue-600">iTours</h1>
      <h2 className="mb-3 text-xl font-semibold">Ciudades</h2>

      <div className="grid gap-4">
        {cities.map((city) => (
          <Link
            key={city.id}
            to={`/city/${city.id}`}
            className="rounded-2xl border p-4 text-left shadow-sm transition hover:shadow-md"
          >
            <h3 className="text-lg font-semibold">{city.name}</h3>
            <p className="text-sm text-gray-500">Explorar rutas</p>
          </Link>
        ))}
      </div>
    </div>
  )
}