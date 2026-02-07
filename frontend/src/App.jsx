import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import styles from './App.module.scss';
import { apiFetch } from './api/client';
import { AuthProvider, useAuth } from './components/common/AuthProvider';
import { ToastProvider, useToast } from './components/common/ToastProvider';

import Home from './pages/marketing/Home';
import Features from './pages/marketing/Features';
import Solutions from './pages/marketing/Solutions';
import Pricing from './pages/marketing/Pricing';
import Security from './pages/marketing/Security';
import RequestAccess from './pages/marketing/RequestAccess';
import Contact from './pages/marketing/Contact';
import Docs from './pages/marketing/Docs';
import SignIn from './pages/marketing/SignIn';
import SecretAdmin from './pages/marketing/SecretAdmin';

import Overview from './pages/dashboard/Overview';
import Assets from './pages/dashboard/Assets';
import Verification from './pages/dashboard/Verification';
import Reputation from './pages/dashboard/Reputation';
import Logs from './pages/dashboard/Logs';
import Users from './pages/dashboard/Users';
import Settings from './pages/dashboard/Settings';

function ProtectedRoute({ children }) {
  const auth = useAuth();
  const location = useLocation();
  if (!auth.isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return children;
}

function DashboardWrapper({ children }) {
  const { tenantSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    apiFetch(`/tenants/${tenantSlug}/branding`)
      .then((data) => {
        if (!active) return;
        setTenant(data);
        const theme = data?.brand?.theme || {};
        document.documentElement.style.setProperty('--brand-primary', theme.primary || '#0B5FFF');
        document.documentElement.style.setProperty('--brand-accent', theme.accent || '#00BFA6');
        document.documentElement.style.setProperty('--brand-on', theme.on || '#FFFFFF');
        document.documentElement.setAttribute('data-theme', theme.mode || 'light');
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Unable to load tenant branding');
        toast.push('Failed to load tenant branding', 'error');
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [tenantSlug, toast]);

  if (loading) return <div className={styles.loadingState}>Loading tenant…</div>;
  if (error) return <div className={styles.errorState}>{error}</div>;
  if (!tenant) return <div className={styles.emptyState}>Tenant not found</div>;

  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.tenantBadge}>
          <img src={tenant?.brand?.logoAssets?.find((l) => l.activeVersion)?.url || '/logo.svg'} alt="Tenant logo" />
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
            <button
              className={styles.iconButton}
              aria-label="Notifications"
              onClick={() => setShowNotifications((v) => !v)}
            >
              🔔
            </button>
            <button
              className={styles.userMenu}
              aria-label="User menu"
              onClick={() => setShowUserMenu((v) => !v)}
            >
              Admin ▾
            </button>
          </div>
          {showNotifications && (
            <div className={styles.dropdown}>
              <strong>Notifications</strong>
              <div>No alerts right now.</div>
            </div>
          )}
          {showUserMenu && (
            <div className={styles.dropdownRight}>
              <strong>Account</strong>
              <div>Role: CLIENT_ADMIN</div>
              <div>Sign out (coming soon)</div>
            </div>
          )}
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/security" element={<Security />} />
            <Route path="/request-access" element={<RequestAccess />} />
            <Route path="/signup" element={<RequestAccess />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/secret-admin" element={<SecretAdmin />} />

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
      </ToastProvider>
    </AuthProvider>
  );
}
