import { Routes, Route, Link } from 'react-router-dom'
import About from './pages/About'
import Registration from './pages/Registration'
import Login from './pages/Login'
import Home from './pages/Home'
import Pets from './pages/Pets'
import Profile from './pages/Profile'
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
            <Link className="nav-link" to="/">Главная</Link>
            <Link className="nav-link" to="/register">Регистрация</Link>
            <Link className="nav-link" to="/feed">Лента</Link>
            <Link className="nav-link" to="/pets">Мои питомцы</Link>
            <Link className="nav-link" to="/about">About</Link>
          </div>
        </div>
      </nav>
      
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
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
