import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
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
            <NavLink 
              className={styles.navbarBrand} 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Logo />
            </NavLink>
            <div className={styles.navLinks}>
              {navItems.map((item) => (
                <NavLink 
                  key={item.id} 
                  className={({ isActive }) => 
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  end={item.path === '/'}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
            <div className={styles.navLinks}>
              {isAuthenticated ? (
                <NavLink 
                  className={({ isActive }) => 
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                  to="/profile"
                >
                  Профиль
                </NavLink>
              ) : (
                <NavLink 
                  className={({ isActive }) => 
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                  to="/login"
                >
                  Вход / регистрация
                </NavLink>
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
                  <NavLink 
                    className={({ isActive }) => 
                      `${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`
                    }
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    end={item.path === '/'}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li className={styles.sidebarItem}>
                <NavLink 
                  className={({ isActive }) => 
                    `${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`
                  }
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {isAuthenticated ? 'Профиль' : 'Вход / регистрация'}
                </NavLink>
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