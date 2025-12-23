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

import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { Registration } from './pages/Registration';
import Login from './pages/Login';
import Pets from './pages/Pets';
import { Feed } from './pages/Feed';
import EditPet from './pages/EditPet';
import AnimalView from './pages/AnimalView';
import EmailVerification from './pages/EmailVerification';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import Navigation from './components/Navigation/Navigation';
import { selectIsAuthenticated, selectIsInitialized } from './store/authSelectors';
import { initializeAuth } from './store/authSlice';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsInitialized);

  // Инициализация auth при загрузке приложения
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  return (
    <div className="App">
      <Navigation isAuthenticated={isAuthenticated} />
      
      <div className="container">
        <Routes>
          {/* Публичные роуты */}
          <Route path="/" element={<Feed />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/terms/tos" element={<TermsOfService />} />
          <Route path="/terms/toa" element={<PrivacyPolicy />} />
          <Route path="/animal/:id" element={<AnimalView />} />

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
