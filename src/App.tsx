import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CityRoutesPage from './pages/CityRoutesPage'
import RouteDetailPage from './pages/RouteDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/city/:id" element={<CityRoutesPage />} />
        <Route path="/route/:id" element={<RouteDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App