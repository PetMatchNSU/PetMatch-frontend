import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LinksBlock.module.css';

interface LinksBlockProps {
  title?: string;
  links?: Array<{
    text: string;
    to: string;
  }>;
}

const LinksBlock: React.FC<LinksBlockProps> = ({ 
  title = "Label",
  links = [
    { text: "Пользовательское соглашение", to: "/user-agreement" },
    { text: "Политика обработки персональных данных", to: "/privacy-policy" }
  ]
}) => {
  return (
    <div className={styles.linksBlock}>
      <div className={styles.title}>{title}</div>
      <div className={styles.links}>
        {links.map((link, index) => (
          <Link 
            key={index}
            to={link.to}
            className={styles.link}
          >
            {link.text}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LinksBlock;