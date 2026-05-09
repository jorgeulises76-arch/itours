import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CityRoutesPage from './pages/CityRoutesPage'
import RouteDetailPage from './pages/RouteDetailPage'
import BottomNav from './components/BottomNav'

function App() {
  return (
  <BrowserRouter>
    <div className="pb-24">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/city/:id" element={<CityRoutesPage />} />
        <Route path="/route/:id" element={<RouteDetailPage />} />
      </Routes>

      <BottomNav />
    </div>
  </BrowserRouter>
)
}

export default App