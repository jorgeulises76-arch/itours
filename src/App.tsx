import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CityRoutesPage from './pages/CityRoutesPage'
import RouteDetailPage from './pages/RouteDetailPage'
import BottomNav from './components/BottomNav'

function App() {
  return (
  <BrowserRouter>
    <div className="min-h-screen bg-gray-200 md:flex md:justify-center">
      <div className="min-h-screen w-full bg-gray-100 pb-24 shadow-2xl md:max-w-md">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/city/:id" element={<CityRoutesPage />} />
          <Route path="/route/:id" element={<RouteDetailPage />} />
        </Routes>

        <BottomNav />
      </div>
    </div>
  </BrowserRouter>
)
}

export default App