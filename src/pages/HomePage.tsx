import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import molletImage from '../assets/Mollet.jpeg'
import parisRuta1Image from '../assets/paris-ruta1.jpg'

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
    <div className="min-h-screen bg-gray-100">
      
      {/* HERO */}
      <div
        className="relative h-72 bg-cover bg-center transition duration-700"
        style={{
          backgroundImage:
  "url('https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?q=80&w=1600&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-10 text-white">
          <h1 className="text-5xl font-extrabold">iTours</h1>

          <p className="mt-3 max-w-xs text-lg text-gray-200">
            Descubre ciudades y explora rutas turísticas a tu ritmo.
          </p>

          <button
  onClick={() =>
    document.getElementById('cities-section')?.scrollIntoView({
      behavior: 'smooth',
    })
  }
  className="mt-6 w-fit rounded-full bg-blue-600 px-7 py-3 text-lg font-semibold shadow-2xl transition hover:scale-105 hover:bg-blue-700"
>
  Explorar rutas
</button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div id="cities-section" className="px-5 py-6">
        <h2 className="mb-5 text-2xl font-bold text-gray-800">
          Ciudades disponibles
        </h2>

        <div className="grid gap-5">
          {cities.map((city) => (
            <Link
              key={city.id}
              to={`/city/${city.id}`}
              className="group overflow-hidden rounded-3xl bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="h-40 overflow-hidden">
                <img
  src={
    city.name === 'Barcelona'
      ? 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?q=80&w=1200&auto=format&fit=crop'
      : city.name === 'París'
        ? parisRuta1Image
        : molletImage
  }
  alt={city.name}
  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
/>
              </div>

              <div className="flex items-center justify-between p-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {city.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Explorar rutas turísticas
                  </p>
                </div>

                <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                  <MapPin size={22} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}