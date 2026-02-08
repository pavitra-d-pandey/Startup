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
              <div className={styles.kicker}>Trust OS for Voice · SMS · Email</div>
              <h1 className={`${styles.fadeUp} ${styles.delay1}`}>
                Make every outbound message look legit, feel legit, and land clean.
              </h1>
              <p className="muted">
                SentinelBrand simulates carrier-grade trust signals for a hackathon demo. In production,
                these signals come from providers and feedback loops. Here, you see how the control plane
                behaves when it gets real data.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/request-access" className={styles.buttonPrimary}>
                  Request Access
                </Link>
                <Link to="/security" className={styles.buttonOutline}>
                  View Security
                </Link>
              </div>
              <div className={styles.pillRow}>
                <span className={styles.pill}>AI Risk Guard</span>
                <span className={styles.pill}>Synthetic Reputation Lab</span>
                <span className={styles.pill}>Tenant Isolation</span>
                <span className={styles.pill}>Audit Trails</span>
              </div>
              <div className={styles.statRow}>
                <div className={styles.statCard}>
                  <strong>99.2%</strong>
                  <div className="muted">deliverability</div>
                </div>
                <div className={styles.statCard}>
                  <strong>32%</strong>
                  <div className="muted">spam flags reduced</div>
                </div>
                <div className={styles.statCard}>
                  <strong>24h</strong>
                  <div className="muted">avg verification</div>
                </div>
              </div>
            </div>
            <div className={styles.heroPanel}>
              <div className={styles.badge}>Simulation Mode · Signals Streaming</div>
              <h3>Trust Control Room</h3>
              <p className="muted">Live flags, deliverability, and verification status in one view.</p>
              <div className={styles.gridTwo}>
                <div className="card">
                  <div className="mono">VOICE</div>
                  <strong>Attestation: B</strong>
                  <p className="muted">Label risk: low</p>
                </div>
                <div className="card">
                  <div className="mono">SMS</div>
                  <strong>Spam rate: 0.8%</strong>
                  <p className="muted">Throttled: no</p>
                </div>
                <div className="card">
                  <div className="mono">EMAIL</div>
                  <strong>Inbox: 96%</strong>
                  <p className="muted">DMARC aligned</p>
                </div>
                <div className="card">
                  <div className="mono">AI</div>
                  <strong>Risk score: 12</strong>
                  <p className="muted">Safe to send</p>
                </div>
              </div>
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
              <p className="muted">Versioned logos, secure uploads, and rollback controls.</p>
            </div>
            <div className={styles.featureCard}>
              <strong>Identity Verification</strong>
              <p className="muted">Phone, domain, and sender lifecycle with audit trails.</p>
            </div>
            <div className={styles.featureCard}>
              <strong>Reputation Monitor</strong>
              <p className="muted">Flag detection, evidence tracking, and proactive rechecks.</p>
            </div>
            <div className={styles.featureCard}>
              <strong>Communication Logs</strong>
              <p className="muted">Unified telemetry for Voice, SMS, and Email.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container card">
          <h2 className={styles.sectionTitle}>Security by design</h2>
          <p className="muted">Strict tenant isolation, RBAC, audit logging, and request tracing on every call.</p>
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
