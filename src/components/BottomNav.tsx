import { Home, Map, Compass, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const location = useLocation()

  const navItems = [
    { label: 'Inicio', icon: Home, path: '/' },
    { label: 'Rutas', icon: Map, path: '/' },
    { label: 'Explorar', icon: Compass, path: '/' },
    { label: 'Perfil', icon: User, path: '/' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around py-3">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive =
            index === 0 && location.pathname === '/'

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-blue-500'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}