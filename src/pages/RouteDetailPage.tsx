import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, MapPin, ListOrdered } from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import RouteMap from '../components/RouteMap'
import molletImage from '../assets/Mollet.jpg'
import parisRuta1Image from '../assets/paris-ruta1.jpg'


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
  description: string | null
  latitude: number
  longitude: number
  order_number: number
}

export default function RouteDetailPage() {
  const { id } = useParams()
  const [route, setRoute] = useState<RouteData | null>(null)
  const [points, setPoints] = useState<RoutePoint[]>([])
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null)
  console.log('SELECTED POINT:', selectedPoint)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const TEST_PREMIUM_CODE = 'ITOURS2026'
  const [unlockCode, setUnlockCode] = useState('')
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false)

  useEffect(() => {
    const fetchRoute = async () => {
      if (!id) {
        setError('No se recibió el id de la ruta')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('routes')
        .select(
          'id, title, description, duration_estimated, distance_km, city_id, is_premium'
        )
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

  useEffect(() => {
    if (!id) return

    const unlockedRoutes = JSON.parse(
      localStorage.getItem('unlockedPremiumRoutes') || '[]'
    )

    setIsPremiumUnlocked(unlockedRoutes.includes(id))
  }, [id])

  function unlockPremiumRoute() {
    if (!id) return

    if (unlockCode.trim().toUpperCase() !== TEST_PREMIUM_CODE) {
      alert('Código incorrecto')
      return
    }

    const unlockedRoutes = JSON.parse(
      localStorage.getItem('unlockedPremiumRoutes') || '[]'
    )

    const updatedRoutes = [...new Set([...unlockedRoutes, id])]

    localStorage.setItem('unlockedPremiumRoutes', JSON.stringify(updatedRoutes))
    setIsPremiumUnlocked(true)
  }
  function speak(text: string) {
  if (!('speechSynthesis' in window)) {
    alert('Este dispositivo no permite reproducción de voz.')
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)

  utterance.lang = 'es-ES'
  utterance.rate = 0.95
  utterance.pitch = 1
  utterance.volume = 1

  utterance.onerror = (event) => {
    console.log('Error de voz:', event)
  }

  window.speechSynthesis.speak(utterance)
}

  if (loading) {
    return <div className="p-6">Cargando detalle de ruta...</div>
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>
  }

  if (!route) {
    return <div className="p-6">Ruta no encontrada</div>
  }
  const canAccessContent =
  !route.is_premium || isPremiumUnlocked

  const routeImage =
  route.city_id === '7c33ef71-1361-48ef-83ca-9ed66aaac565'
    ? parisRuta1Image
    : molletImage

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative h-64 overflow-hidden">
  <img
    src={routeImage}
    alt={route.title || 'Ruta'}
    className="absolute inset-0 h-full w-full object-cover"
  />

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

            <span className="text-sm text-gray-200">Ruta guiada con GPS</span>
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

        <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
            <RouteMap points={points} />
          </div>

          {route.is_premium && !isPremiumUnlocked && (
          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <div className="text-center">
              

              <span className="rounded-full bg-yellow-100 px-4 py-2 text-xs font-bold text-yellow-700">
                ⭐ RUTA PREMIUM
              </span>

              <h2 className="mt-6 text-2xl font-bold text-gray-800">
  ✨ Todo listo para empezar
</h2>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
  Ya conoces el recorrido y todo lo que vas a descubrir.
  <br /><br />
  Cuando quieras vivir esta experiencia con audioguía, historias
  y navegación GPS paso a paso, podrás acceder a ella desde aquí.
</p>

              <p className="mt-5 text-3xl font-extrabold text-gray-800">7 €</p>

              <p className="mt-1 text-sm text-gray-500">
  Acceso completo a esta experiencia
</p>

              <input
                value={unlockCode}
                onChange={(e) => setUnlockCode(e.target.value)}
                placeholder="Código de acceso (solo pruebas)"
                className="mt-6 w-full rounded-2xl border border-gray-200 px-4 py-3 text-center text-sm outline-none focus:border-yellow-400"
              />

              <button
                onClick={unlockPremiumRoute}
                className="mt-4 w-full rounded-full bg-yellow-400 px-6 py-3 font-semibold text-yellow-900 shadow-md transition hover:scale-105"
              >
                ✨ Comenzar esta experiencia
              </button>

              <p className="mt-4 text-xs leading-relaxed text-gray-400">
                Próximamente podrás desbloquear esta experiencia directamente desde iTours.
              </p>
            </div>
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
  <div key={point.id}>
    <div
      onClick={() =>
        setSelectedPoint(selectedPoint?.id === point.id ? null : point)
      }
      className="flex cursor-pointer items-center gap-4 rounded-3xl bg-white p-4 shadow-md transition active:scale-[0.98]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500 font-bold text-white shadow-md">
        {index + 1}
      </div>

      <div className="flex-1">
        <p className="font-semibold text-gray-800">
          {point.name || `Punto ${index + 1}`}
        </p>

        <p className="text-sm text-gray-500">
          Toca para descubrir este punto
        </p>
      </div>

      <span className="text-gray-400">
        {selectedPoint?.id === point.id ? '▲' : '▼'}
      </span>
    </div>

    {selectedPoint?.id === point.id && (
  <div className="mx-2 rounded-b-3xl bg-white px-5 pb-5 pt-3 shadow-md">
    {canAccessContent ? (
      point.description ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              speak(point.description!)
            }}
            className="relative z-50 mb-4 cursor-pointer rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-md pointer-events-auto"
          >
            🔊 Escuchar descripción
          </button>

          <p className="text-sm leading-relaxed text-gray-600">
            {point.description}
          </p>
        </>
      ) : (
        <p className="text-sm italic text-gray-400">
          Sin descripción disponible.
        </p>
      )
    ) : (
      <div className="rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
        🔒 Desbloquea esta ruta para acceder a la descripción y al audio.
      </div>
    )}
  </div>
)}
  </div>
))}
           
          </div>
        </div>
      </div>
    </div>
  )
}
