import { Routes, Route, Link } from 'react-router-dom'
import About from './pages/About'
import Home from './pages/Home'
import Pets from './pages/Pets'
import { Feed } from './pages/Feed'
import EditPet from './pages/EditPet'
import './App.css'

function App() {

  return (
    <div className="App">
      <nav className="navbar">
        <div className="container navbar-content">
          <Link className="navbar-brand" to="/">PetMatch</Link>
          <div className="nav-links">
            <Link className="nav-link" to="/">Home</Link>
            <Link className="nav-link" to="/feed">Лента</Link>
            <Link className="nav-link" to="/pets">Мои питомцы</Link>
            <Link className="nav-link" to="/about">About</Link>
          </div>
        </div>
      </nav>
      
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
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
