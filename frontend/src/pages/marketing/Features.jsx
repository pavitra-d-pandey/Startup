import React from 'react';
import MarketingLayout from '../../components/layouts/MarketingLayout';
import styles from '../../App.module.scss';

export default function Features() {
  return (
    <MarketingLayout>
      <section className="page-section">
        <div className="container">
          <div className={styles.kicker}>Product Modules</div>
          <h1>Features</h1>
          <p className="muted">
            Built to simulate real carrier and inbox feedback loops, so teams can prototype trust workflows
            without hooking production providers.
          </p>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>Voice Verification: caller ID profiles and verified numbers</div>
            <div className={styles.featureCard}>SMS Identity: sender approval and spam scoring</div>
            <div className={styles.featureCard}>Email Domains: SPF/DKIM alignment and identity verification</div>
            <div className={styles.featureCard}>Asset Store: versioned brand logos with rollback</div>
            <div className={styles.featureCard}>Reputation Monitor: evidence-based spam flags</div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
