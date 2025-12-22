import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Terms.module.css';

export const TermsOfService: React.FC = () => {
  return (
    <div className={styles.terms}>
      <div className={styles.terms__container}>
        <Link to="/register" className={styles.terms__backLink}>
          ← Вернуться к регистрации
        </Link>

        <h1 className={styles.terms__title}>Пользовательское соглашение</h1>

        <section className={styles.terms__section}>
          <h2 className={styles.terms__sectionTitle}>1. Общие положения</h2>
          <p className={styles.terms__text}>
            Настоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения между
            администрацией сервиса PetMatch (далее — Администрация) и пользователем сети Интернет
            (далее — Пользователь), возникающие при использовании сервиса PetMatch.
          </p>
          <p className={styles.terms__text}>
            Использование сервиса означает безоговорочное согласие Пользователя с настоящим
            Соглашением и указанными в нём условиями.
          </p>
        </section>

        <section className={styles.terms__section}>
          <h2 className={styles.terms__sectionTitle}>2. Предмет соглашения</h2>
          <p className={styles.terms__text}>
            Администрация предоставляет Пользователю доступ к сервису PetMatch, который позволяет:
          </p>
          <ul className={styles.terms__list}>
            <li>Размещать объявления о животных</li>
            <li>Искать животных для приобретения или усыновления</li>
            <li>Связываться с другими пользователями сервиса</li>
            <li>Управлять личным профилем и настройками</li>
          </ul>
        </section>

        <section className={styles.terms__section}>
          <h2 className={styles.terms__sectionTitle}>3. Права и обязанности сторон</h2>
          <p className={styles.terms__text}>
            <strong>Пользователь обязуется:</strong>
          </p>
          <ul className={styles.terms__list}>
            <li>Предоставлять достоверную информацию при регистрации</li>
            <li>Не использовать сервис в противоправных целях</li>
            <li>Соблюдать законодательство Российской Федерации</li>
            <li>Не размещать запрещённый контент</li>
            <li>Уважительно относиться к другим пользователям</li>
          </ul>
          <p className={styles.terms__text}>
            <strong>Администрация обязуется:</strong>
          </p>
          <ul className={styles.terms__list}>
            <li>Обеспечивать работоспособность сервиса</li>
            <li>Защищать персональные данные пользователей</li>
            <li>Рассматривать обращения пользователей</li>
          </ul>
        </section>

        <section className={styles.terms__section}>
          <h2 className={styles.terms__sectionTitle}>4. Ответственность</h2>
          <p className={styles.terms__text}>
            Администрация не несёт ответственности за действия пользователей, а также за
            достоверность информации, размещённой пользователями в объявлениях.
          </p>
          <p className={styles.terms__text}>
            Пользователь самостоятельно несёт ответственность за любые свои действия на сервисе.
          </p>
        </section>

        <section className={styles.terms__section}>
          <h2 className={styles.terms__sectionTitle}>5. Изменение условий</h2>
          <p className={styles.terms__text}>
            Администрация оставляет за собой право в любое время изменять условия настоящего
            Соглашения. Продолжение использования сервиса после внесения изменений означает
            согласие с новыми условиями.
          </p>
        </section>

        <div className={styles.terms__date}>
          Дата последнего обновления: 17 декабря 2025 г.
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
