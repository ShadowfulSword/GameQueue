import { BrowserRouter, Routes, Route, } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Library from './pages/Library.jsx'
import Queue from './pages/Queue.jsx'
import GenreSelect from './pages/GenreSelect.jsx'
import StatusSetup from './pages/StatusSetup.jsx'
import Profile from './pages/Profile.jsx'




//Root component that sets up the client page navigation
//Each route maps to the url so [ip]/route
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />} />                      {/* Enter SteamID and Import lib*/}
        <Route path='/library' element={<Library />} />               {/*User's game library with filters and updating game status */}
        <Route path="/queue" element={<Queue />} />                   {/*Top 5 reccomended games */}
        <Route path="/genre-select" element={<GenreSelect />} />      {/*Onboarding process: genre prefrences*/}
        <Route path="/status-setup" element={<StatusSetup />} />      {/*Onboarding process: sort game status*/}
        <Route path="/profile" element={<Profile />} />               {/*User profile and changing the genre prefrences*/}
      </Routes>

    </BrowserRouter>
  )
}

