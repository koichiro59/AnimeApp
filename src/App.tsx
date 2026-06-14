import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AnimeListPage } from './pages/AnimeListPage'
import { AnimeDetailPage } from './pages/AnimeDetailPage'
import { CharacterListPage } from './pages/CharacterListPage'
import { CharacterDetailPage } from './pages/CharacterDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<AnimeListPage />} />
          <Route path="/anime/:id" element={<AnimeDetailPage />} />
          <Route path="/characters" element={<CharacterListPage />} />
          <Route path="/character/:id" element={<CharacterDetailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App