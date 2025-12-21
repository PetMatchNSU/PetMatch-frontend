import React from 'react';
import styles from './Logo.module.css';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'desktop' | 'mobile';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'full', 
  size = 'desktop',
  className = '' 
}) => {
  const logoClasses = `${styles.logoContainer} ${styles[`logo--${size}`]} ${className}`;

  const logoIcon = new URL('../../assets/logo/logo-icon.svg', import.meta.url).href;
  const logoText = new URL('../../assets/logo/logo-text.svg', import.meta.url).href;
  
  return (
    <div className={logoClasses}>
      <img 
        src={logoIcon} 
        alt="PetMatch Logo"
        className={styles.logoIcon}
      />
        
        {variant === 'full' && (
          <img 
            src={logoText} 
            alt="PetMatch"
            className={styles.logoText}
          />
        )}
    </div>
  );
};

Logo.displayName = 'Logo';

export default Logo;