type RouteWelcomeProps = {
  onClose: () => void
}

export default function RouteWelcome({ onClose }: RouteWelcomeProps) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="route-welcome-title"
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
      >
        <p className="text-center text-2xl font-bold text-teal-600">
          iTours
        </p>

        <h2
          id="route-welcome-title"
          className="mt-4 text-center text-2xl font-bold text-gray-800"
        >
          ¡Bienvenido a tu experiencia!
        </h2>

        <p className="mt-3 text-center text-sm leading-relaxed text-gray-600">
          Descubre la ciudad a tu ritmo. Tú decides cuándo avanzar
          y cuándo escuchar cada historia.
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-teal-50 p-4">
            <h3 className="font-bold text-teal-800">
              🧭 1. Dirígete al siguiente punto
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              Pulsa el botón de navegación para abrir Google Maps
              y seguir el recorrido.
            </p>
          </div>

          <div className="rounded-2xl bg-teal-50 p-4">
            <h3 className="font-bold text-teal-800">
              📱 2. Vuelve a iTours
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              Cuando llegues a tu destino, regresa a iTours
              desde tus aplicaciones recientes o vuelve
              a la pestaña de iTours en tu navegador.
            </p>
          </div>

          <div className="rounded-2xl bg-teal-50 p-4">
            <h3 className="font-bold text-teal-800">
              🎧 3. Escucha cuando quieras
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              Activa la narración cuando estés preparado.
              También puedes leer la descripción y descubrir
              curiosidades en «Quiero saber más» cuando esté disponible.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-teal-600 px-5 py-4 font-bold text-white shadow-md"
        >
          Entendido, ¡vamos allá!
        </button>
      </div>
    </div>
  )
}