import React from 'react';
import MarketingLayout from '../../components/layouts/MarketingLayout';

export default function Docs() {
  return (
    <MarketingLayout>
      <section className="page-section">
        <div className="container">
          <h1>Docs (Teaser)</h1>
          <div style={{ display: 'grid', gap: 16 }}>
            <div className="card">API Overview</div>
            <div className="card">Tenant Routing & Security</div>
            <div className="card">SDKs (Coming soon)</div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
