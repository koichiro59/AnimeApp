import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { AnimeListPage } from './pages/AnimeListPage'
import { AnimeDetailPage } from './pages/AnimeDetailPage'
import { CharacterListPage } from './pages/CharacterListPage'
import { CharacterDetailPage } from './pages/CharacterDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/animes" element={<AnimeListPage />} />
          <Route path="/anime/:id" element={<AnimeDetailPage />} />
          <Route path="/characters" element={<CharacterListPage />} />
          <Route path="/character/:id" element={<CharacterDetailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App