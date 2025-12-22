import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import styles from './Navigation.module.css';
import Logo from '../Logo/Logo';
import { clearAuth } from '../../store/authSlice';

interface NavigationProps {
  isAuthenticated?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  path?: string;
  action?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  isAuthenticated = false
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1024);
      if (window.innerWidth > 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  // Элементы навигации для авторизованного пользователя
  const authNavItems: NavItem[] = [
    { id: 'feed', label: 'Лента', path: '/' },
    { id: 'pets', label: 'Мои питомцы', path: '/pets' },
    { id: 'notifications', label: 'Уведомления', path: '/notifications' },
    { id: 'profile', label: 'Профиль', path: '/profile' },
    { id: 'logout', label: 'Выйти', action: handleLogout },
  ];

  // Элементы навигации для неавторизованного пользователя
  const guestNavItems: NavItem[] = [
    { id: 'feed', label: 'Лента', path: '/' },
    { id: 'login', label: 'Вход/регистрация', path: '/login' },
  ];

  const navItems = isAuthenticated ? authNavItems : guestNavItems;

  const renderNavItem = (item: NavItem, isMobile: boolean = false) => {
    const linkClass = isMobile ? styles.sidebarLink : styles.navLink;
    const activeClass = isMobile ? styles.sidebarLinkActive : styles.navLinkActive;

    if (item.action) {
      return (
        <button
          key={item.id}
          className={linkClass}
          onClick={item.action}
        >
          {item.label}
        </button>
      );
    }

    return (
      <NavLink
        key={item.id}
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ''}`
        }
        to={item.path!}
        onClick={() => setIsMobileMenuOpen(false)}
        end={item.path === '/'}
      >
        {item.label}
      </NavLink>
    );
  };

  return (
    <>
      {isDesktop ? (
        <nav className={styles.navbar}>
          <div className={`container ${styles.navbarContent}`}>
            <NavLink
              className={styles.navbarBrand}
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Logo />
            </NavLink>
            <div className={styles.navLinks}>
              {navItems.map((item) => renderNavItem(item))}
            </div>
          </div>
        </nav>
      ) : (
        <>
          <div className={styles.mobileHeader}>
            <button
              className={styles.hamburger}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Открыть меню"
            >
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
            </button>
            <NavLink
              className={styles.mobileLogo}
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Logo variant='icon'/>
            </NavLink>
          </div>

          <div className={`${styles.mobileSidebar} ${isMobileMenuOpen ? styles.open : ''}`}>
            <div className={styles.sidebarHeader}>
              <button
                className={styles.closeBtn}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Закрыть меню"
              >
                ×
              </button>
            </div>
            <ul className={styles.sidebarMenu}>
              {navItems.map((item) => (
                <li key={item.id} className={styles.sidebarItem}>
                  {renderNavItem(item, true)}
                </li>
              ))}
            </ul>
          </div>

          {isMobileMenuOpen && (
            <div
              className={styles.sidebarOverlay}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </>
      )}
    </>
  );
};

export default Navigation;