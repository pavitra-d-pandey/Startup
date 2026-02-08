import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../App.module.scss';

export default function MarketingLayout({ children }) {
  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <div className={`${styles.navbar} container`}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoMark}>SB</span>
            <span>SentinelBrand</span>
          </Link>
          <nav className={styles.navLinks} aria-label="Main">
            <Link to="/features">Product</Link>
            <Link to="/solutions">Solutions</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/security">Security</Link>
            <Link to="/docs">Docs</Link>
            <span className={styles.badge}>Demo Mode · Simulated Data</span>
            <Link to="/request-access" className={styles.ctaLink}>
              Request Access
            </Link>
            <Link to="/signin" className={styles.signIn}>
              Sign In
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className={styles.footer}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24 }}>
            <div>
              <strong>Product</strong>
              <div><Link to="/features">Verification</Link></div>
              <div><Link to="/features">Reputation</Link></div>
              <div><Link to="/features">Logs</Link></div>
            </div>
            <div>
              <strong>Company</strong>
              <div><Link to="/contact">About</Link></div>
              <div><Link to="/contact">Careers</Link></div>
              <div><Link to="/contact">Status</Link></div>
            </div>
            <div>
              <strong>Legal</strong>
              <div><Link to="/security">Privacy</Link></div>
              <div><Link to="/security">Terms</Link></div>
              <div><Link to="/security">Compliance</Link></div>
            </div>
            <div>
              <strong>Security</strong>
              <div><Link to="/security">Isolation</Link></div>
              <div><Link to="/security">Audit</Link></div>
              <div><Link to="/security">Encryption</Link></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
