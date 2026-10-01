import { Routes, Route, Navigate } from 'react-router-dom'
import { AlertsPage } from './pages/AlertsPage'
import { AlertDetailPage } from './pages/AlertDetailPage'
import { FavoritesPage } from './pages/FavoritesPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AlertsPage />} />
      <Route path="/alerts/:id" element={<AlertDetailPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
