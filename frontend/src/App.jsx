import { BrowserRouter, Routes, Route, } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Library from './pages/Library.jsx'
import Queue from './pages/Queue.jsx'
import GenreSelect from './pages/GenreSelect.jsx'
import StatusSetup from './pages/StatusSetup.jsx'
import Profile from './pages/Profile.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/library' element={<Library />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/genre-select" element={<GenreSelect />} />
        <Route path="/status-setup" element={<StatusSetup />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>

    </BrowserRouter>
  )
}

