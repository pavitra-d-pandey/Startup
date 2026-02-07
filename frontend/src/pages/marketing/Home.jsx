import React from 'react';
import { Link } from 'react-router-dom';
import MarketingLayout from '../../components/layouts/MarketingLayout';
import styles from '../../App.module.scss';

export default function Home() {
  return (
    <MarketingLayout>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            <div>
              <h1 className={`${styles.fadeUp} ${styles.delay1}`}>
                Verified identity + reputation intelligence for business communications
              </h1>
              <p>
                Protect your brand across Voice, SMS, and Email with verified assets, proactive
                monitoring, and tenant-grade security.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/request-access" className={styles.buttonPrimary}>
                  Request Access
                </Link>
                <Link to="/security" className={styles.buttonOutline}>
                  View Security
                </Link>
              </div>
              <div className={styles.statRow}>
                <div className={styles.statCard}>
                  <strong>99.2%</strong>
                  <div>deliverability</div>
                </div>
                <div className={styles.statCard}>
                  <strong>32%</strong>
                  <div>spam flags reduced</div>
                </div>
                <div className={styles.statCard}>
                  <strong>24h</strong>
                  <div>avg verification</div>
                </div>
              </div>
            </div>
            <div className="card">
              <strong>Trust Dashboard</strong>
              <p>Live flags, deliverability, and verification status in one view.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container" style={{ display: 'grid', gap: 16 }}>
          <h2 className={styles.sectionTitle}>Core modules</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <strong>Asset Store</strong>
              <p>Versioned logos, secure uploads, and rollback controls.</p>
            </div>
            <div className={styles.featureCard}>
              <strong>Identity Verification</strong>
              <p>Phone, domain, and sender lifecycle with audit trails.</p>
            </div>
            <div className={styles.featureCard}>
              <strong>Reputation Monitor</strong>
              <p>Flag detection, evidence tracking, and proactive rechecks.</p>
            </div>
            <div className={styles.featureCard}>
              <strong>Communication Logs</strong>
              <p>Unified telemetry for Voice, SMS, and Email.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container card">
          <h2 className={styles.sectionTitle}>Security by design</h2>
          <p>Strict tenant isolation, RBAC, audit logging, and request tracing on every call.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <h2 className={styles.sectionTitle}>What teams are saying</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>“Our spam labels dropped within weeks.”</div>
            <div className={styles.featureCard}>“We can finally prove caller identity.”</div>
            <div className={styles.featureCard}>“Ops and compliance both have visibility.”</div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container card">
          <h2>Ready to protect your brand?</h2>
          <Link to="/request-access" className={styles.buttonPrimary}>
            Request Access
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
