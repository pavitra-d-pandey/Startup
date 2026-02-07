import React from 'react';
import MarketingLayout from '../../components/layouts/MarketingLayout';
import styles from '../../App.module.scss';

export default function Solutions() {
  return (
    <MarketingLayout>
      <section className="page-section">
        <div className="container">
          <h1>Solutions</h1>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>Support Centers: verified outbound and inbound trust</div>
            <div className={styles.featureCard}>BFSI: compliance-ready identity and audit trails</div>
            <div className={styles.featureCard}>Healthcare: verified appointment messaging</div>
            <div className={styles.featureCard}>Marketplaces: prevent impersonation at scale</div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
