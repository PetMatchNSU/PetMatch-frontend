/**
 * App Component - главный компонент приложения
 *
 * Функционал:
 * - Роутинг приложения
 * - Защищенные роуты (ProtectedRoute)
 * - Публичные страницы: /, /login, /register, /feed, /verify-email
 * - Приватные страницы: /pets, /animal/*
 * - Навигационное меню
 */

import { Routes, Route, Link } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { Registration } from './pages/Registration';
import Login from './pages/Login';
import Home from './pages/Home';
import Pets from './pages/Pets';
import { Feed } from './pages/Feed';
import EditPet from './pages/EditPet';
import EmailVerification from './pages/EmailVerification';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import './App.css';

function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <div className="container navbar-content">
          <Link className="navbar-brand" to="/">
            PetMatch
          </Link>
          <div className="nav-links">
            <Link className="nav-link" to="/">
              Главная
            </Link>
            <Link className="nav-link" to="/register">
              Регистрация
            </Link>
            <Link className="nav-link" to="/login">
              Вход
            </Link>
            <Link className="nav-link" to="/feed">
              Лента
            </Link>
            <Link className="nav-link" to="/pets">
              Мои питомцы
            </Link>
            <Link className="nav-link" to="/about">
              About
            </Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <Routes>
          {/* Публичные роуты */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/terms/tos" element={<TermsOfService />} />
          <Route path="/terms/toa" element={<PrivacyPolicy />} />

          {/* Защищенные роуты - требуют авторизации */}
          <Route
            path="/pets"
            element={
              <ProtectedRoute>
                <Pets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/animal/update/:id"
            element={
              <ProtectedRoute>
                <EditPet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/animal/create"
            element={
              <ProtectedRoute>
                <EditPet />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
