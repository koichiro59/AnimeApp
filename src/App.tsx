import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimeListPage } from './pages/AnimeListPage'
import { AnimeDetailPage } from './pages/AnimeDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AnimeListPage />} />
        <Route path="/anime/:id" element={<AnimeDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App