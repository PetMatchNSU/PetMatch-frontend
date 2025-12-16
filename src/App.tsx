import { Routes, Route } from 'react-router-dom'
import About from './pages/About'
import Registration from './pages/Registration'
import Login from './pages/Login'
import Home from './pages/Home'
import Pets from './pages/Pets'
import { Feed } from './pages/Feed'
import EditPet from './pages/EditPet'
import Navigation from './components/Navigation/Navigation'
import './App.css'

function App() {
  return (
    <div className="App">
      <Navigation />
      
      <div className="container main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/about" element={<About />} />
          <Route path="/animal/update/:id" element={<EditPet />} />
          <Route path="/animal/create" element={<EditPet />} />
        </Routes>
      </div>
    </div>
  )
}

export default App