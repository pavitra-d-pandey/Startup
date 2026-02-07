/*
  SentinelBrand Cloud - Frontend Blueprint (Simulation-Ready)
  Purpose: Marketing routes + multi-tenant dashboard routes + DashboardWrapper.
*/

import React, { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from 'react-router-dom';

// Styles (SCSS Modules / CSS Modules recommended)
import styles from './App.module.scss';

// ------------------------------
// Utils
// ------------------------------
async function fetchTenantBranding(tenantSlug) {
  // Replace with real API call: GET /api/tenants/:tenantSlug/branding
  return {
    name: 'Acme Health',
    logoUrl: '/assets/tenant-logo.svg',
    theme: {
      primary: '#0B5FFF',
      accent: '#00BFA6',
      on: '#FFFFFF',
      mode: 'light',
    },
  };
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (!theme) return;
  root.style.setProperty('--brand-primary', theme.primary);
  root.style.setProperty('--brand-accent', theme.accent);
  root.style.setProperty('--brand-on', theme.on);
  root.setAttribute('data-theme', theme.mode || 'light');
}

// ------------------------------
// Auth + Protected Route
// ------------------------------
function useAuth() {
  // Replace with real auth store
  return { isAuthenticated: true, permissions: ['LOG_VIEW', 'ASSET_UPLOAD'], role: 'CLIENT_ADMIN' };
}

function ProtectedRoute({ children }) {
  const auth = useAuth();
  const location = useLocation();
  if (!auth.isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return children;
}

// ------------------------------
// Dashboard Wrapper
// ------------------------------
function DashboardWrapper({ children }) {
  const { tenantSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchTenantBranding(tenantSlug)
      .then((data) => {
        if (!active) return;
        setTenant(data);
        applyTheme(data.theme);
      })
      .catch(() => {
        if (!active) return;
        setError('Unable to load tenant branding');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [tenantSlug]);

  if (loading) return <div className={styles.loadingState}>Loading tenant…</div>;
  if (error) return <div className={styles.errorState}>{error}</div>;
  if (!tenant) return <div className={styles.emptyState}>Tenant not found</div>;

  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.tenantBadge}>
          <img src={tenant.logoUrl} alt={`${tenant.name} logo`} />
          <div>
            <div className={styles.tenantName}>{tenant.name}</div>
            <div className={styles.tenantSlug}>{tenantSlug}</div>
          </div>
        </div>
        <nav>
          <a href={`/dashboard/${tenantSlug}`}>Overview</a>
          <a href={`/dashboard/${tenantSlug}/assets`}>Assets</a>
          <a href={`/dashboard/${tenantSlug}/verification`}>Verification</a>
          <a href={`/dashboard/${tenantSlug}/reputation`}>Reputation</a>
          <a href={`/dashboard/${tenantSlug}/logs`}>Logs</a>
          <a href={`/dashboard/${tenantSlug}/users`}>Users</a>
          <a href={`/dashboard/${tenantSlug}/settings`}>Settings</a>
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <input className={styles.search} aria-label="Search" placeholder="Search logs, numbers, domains" />
          <div className={styles.topbarActions}>
            <button className={styles.iconButton} aria-label="Notifications">🔔</button>
            <button className={styles.userMenu} aria-label="User menu">Admin ▾</button>
          </div>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

// ------------------------------
// Marketing Pages (Skeletons)
// ------------------------------
const Home = () => <div className={styles.page}>Home</div>;
const Features = () => <div className={styles.page}>Features</div>;
const Solutions = () => <div className={styles.page}>Solutions</div>;
const Pricing = () => <div className={styles.page}>Pricing</div>;
const Security = () => <div className={styles.page}>Security</div>;
const RequestAccess = () => <div className={styles.page}>Request Access</div>;
const Contact = () => <div className={styles.page}>Contact</div>;
const Docs = () => <div className={styles.page}>Docs</div>;

// ------------------------------
// Dashboard Pages (Skeletons)
// ------------------------------
const Overview = () => <div className={styles.page}>Overview</div>;
const Assets = () => <div className={styles.page}>Assets</div>;
const Verification = () => <div className={styles.page}>Verification</div>;
const Reputation = () => <div className={styles.page}>Reputation</div>;
const Logs = () => <div className={styles.page}>Logs</div>;
const Users = () => <div className={styles.page}>Users</div>;
const Settings = () => <div className={styles.page}>Settings</div>;

// ------------------------------
// Routes
// ------------------------------
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing site */}
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/security" element={<Security />} />
        <Route path="/request-access" element={<RequestAccess />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/docs" element={<Docs />} />

        {/* Tenant dashboard */}
        <Route
          path="/dashboard/:tenantSlug/*"
          element={
            <ProtectedRoute>
              <DashboardWrapper>
                <Routes>
                  <Route path="" element={<Overview />} />
                  <Route path="assets" element={<Assets />} />
                  <Route path="verification" element={<Verification />} />
                  <Route path="reputation" element={<Reputation />} />
                  <Route path="logs" element={<Logs />} />
                  <Route path="users" element={<Users />} />
                  <Route path="settings" element={<Settings />} />
                </Routes>
              </DashboardWrapper>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
