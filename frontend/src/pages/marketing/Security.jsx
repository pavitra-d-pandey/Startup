import React from 'react';
import MarketingLayout from '../../components/layouts/MarketingLayout';
import styles from '../../App.module.scss';

export default function Security() {
  return (
    <MarketingLayout>
      <section className="page-section">
        <div className="container">
          <h1>Security</h1>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>Tenant isolation enforced at middleware + database scope</div>
            <div className={styles.featureCard}>RBAC with permission checks on every route</div>
            <div className={styles.featureCard}>Audit logging for sensitive actions</div>
            <div className={styles.featureCard}>Rate limiting and request ID tracing</div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
