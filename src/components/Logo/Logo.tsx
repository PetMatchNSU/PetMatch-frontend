import React from 'react';
import styles from './Logo.module.css';
import logo from '../../assets/PetMatch_logo (1).svg';
import textLogo from '../../assets/PetMatch_text (3).svg';
import logoText from '../../assets/logo/logo-text.svg';

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

  // const logoText = new URL('../../assets/logo/logo-text.svg', import.meta.url).href;
  
  return (
    <div className={logoClasses}>
      <img 
        src={logo} 
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