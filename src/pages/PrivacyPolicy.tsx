import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Terms.module.css';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className={styles.terms}>
      <div className={styles.terms__container}>
        <Link to="/register" className={styles.terms__backLink}>
          ← Вернуться к регистрации
        </Link>

        <h1 className={styles.terms__title}>Политика обработки персональных данных</h1>

        <section className={styles.terms__section}>
          <h2 className={styles.terms__sectionTitle}>1. Общие положения</h2>
          <p className={styles.terms__text}>
            Настоящая Политика обработки персональных данных (далее — Политика) определяет порядок
            обработки и защиты персональных данных пользователей сервиса PetMatch.
          </p>
          <p className={styles.terms__text}>
            Использование сервиса означает согласие Пользователя с настоящей Политикой и условиями
            обработки его персональных данных.
          </p>
        </section>

        <section className={styles.terms__section}>
          <h2 className={styles.terms__sectionTitle}>2. Собираемые данные</h2>
          <p className={styles.terms__text}>
            При использовании сервиса могут собираться следующие персональные данные:
          </p>
          <ul className={styles.terms__list}>
            <li>Фамилия, имя, отчество</li>
            <li>Адрес электронной почты</li>
            <li>Номер телефона</li>
            <li>Данные аккаунтов в социальных сетях (Telegram, VK)</li>
            <li>Город и регион проживания</li>
            <li>Предпочтительное время для связи</li>
          </ul>
        </section>

        <section className={styles.terms__section}>
          <h2 className={styles.terms__sectionTitle}>3. Цели обработки данных</h2>
          <p className={styles.terms__text}>
            Персональные данные обрабатываются в следующих целях:
          </p>
          <ul className={styles.terms__list}>
            <li>Регистрация и идентификация пользователя в сервисе</li>
            <li>Обеспечение связи между пользователями</li>
            <li>Улучшение качества сервиса</li>
            <li>Отправка уведомлений и информационных сообщений</li>
            <li>Обеспечение безопасности сервиса</li>
          </ul>
        </section>

        <section className={styles.terms__section}>
          <h2 className={styles.terms__sectionTitle}>4. Защита данных</h2>
          <p className={styles.terms__text}>
            Администрация принимает необходимые организационные и технические меры для защиты
            персональных данных от неправомерного доступа, изменения, раскрытия или уничтожения.
          </p>
          <p className={styles.terms__text}>
            Доступ к персональным данным имеют только уполномоченные сотрудники, которые обязаны
            соблюдать конфиденциальность.
          </p>
        </section>

        <section className={styles.terms__section}>
          <h2 className={styles.terms__sectionTitle}>5. Передача данных третьим лицам</h2>
          <p className={styles.terms__text}>
            Персональные данные не передаются третьим лицам, за исключением случаев:
          </p>
          <ul className={styles.terms__list}>
            <li>Когда пользователь дал на это согласие</li>
            <li>Когда это требуется по законодательству РФ</li>
            <li>Для защиты прав и законных интересов Администрации</li>
          </ul>
        </section>

        <section className={styles.terms__section}>
          <h2 className={styles.terms__sectionTitle}>6. Права пользователя</h2>
          <p className={styles.terms__text}>
            Пользователь имеет право:
          </p>
          <ul className={styles.terms__list}>
            <li>Получить информацию об обработке своих персональных данных</li>
            <li>Требовать уточнения, блокирования или удаления своих данных</li>
            <li>Отозвать согласие на обработку персональных данных</li>
          </ul>
        </section>

        <section className={styles.terms__section}>
          <h2 className={styles.terms__sectionTitle}>7. Срок хранения данных</h2>
          <p className={styles.terms__text}>
            Персональные данные хранятся в течение всего срока использования сервиса и могут быть
            удалены по запросу пользователя или при удалении аккаунта.
          </p>
        </section>

        <section className={styles.terms__section}>
          <h2 className={styles.terms__sectionTitle}>8. Изменение политики</h2>
          <p className={styles.terms__text}>
            Администрация оставляет за собой право вносить изменения в настоящую Политику.
            Актуальная версия Политики всегда доступна на данной странице.
          </p>
        </section>

        <div className={styles.terms__date}>
          Дата последнего обновления: 17 декабря 2025 г.
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
