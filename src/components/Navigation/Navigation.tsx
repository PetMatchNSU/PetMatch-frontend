import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navigation.module.css';
import Logo from '../Logo/Logo';

interface NavigationProps {
  isAuthenticated?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  isAuthenticated = false
}) => { 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

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

  const navItems = [
    { id: 'home', label: 'Главная', path: '/' },
    { id: 'feed', label: 'Лента', path: '/feed' },
    { id: 'pets', label: 'Мои питомцы', path: '/pets' },
    { id: 'about', label: 'О нас', path: '/about' },
  ];

  return (
    <>
      {isDesktop ? (
        <nav className={styles.navbar}>
          <div className={`container ${styles.navbarContent}`}>
            <Link 
              className={styles.navbarBrand} 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
               <Logo />
            </Link>
            <div className={styles.navLinks}>
              {navItems.map((item) => (
                <Link 
                  key={item.id} 
                  className={styles.navLink} 
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className={styles.navLinks}>
              {isAuthenticated ? (
                <Link className={styles.navLink} to="/profile">Профиль</Link>
              ) : (
                <Link className={styles.navLink} to="/login">Вход / регистрация</Link>
              )}
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
            <Link 
              className={styles.mobileLogo} 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
               <Logo variant='icon'/>
            </Link>
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
                  <Link 
                    className={styles.sidebarLink}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className={styles.sidebarItem}>
                <Link 
                  className={styles.sidebarLink}
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {isAuthenticated ? 'Профиль' : 'Вход / регистрация'}
                </Link>
              </li>
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