import React from 'react';
import MarketingLayout from '../../components/layouts/MarketingLayout';
import styles from '../../App.module.scss';

export default function Pricing() {
  return (
    <MarketingLayout>
      <section className="page-section">
        <div className="container">
          <h1>Pricing</h1>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <h3>Starter</h3>
              <p>Verified basics for growing teams.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Growth</h3>
              <p>Advanced reputation monitoring and logs.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Enterprise</h3>
              <p>Custom governance, SLAs, and compliance.</p>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <a href="/request-access" className={styles.buttonPrimary}>
              Request Access
            </a>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
