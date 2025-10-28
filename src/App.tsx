import { Routes, Route, Link } from 'react-router-dom'
import About from './pages/About'
import Home from './pages/Home'
import { Feed } from './pages/Feed'
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
            <Link className="nav-link" to="/about">About</Link>
          </div>
        </div>
      </nav>
      
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
