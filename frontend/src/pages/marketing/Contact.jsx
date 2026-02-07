import React from 'react';
import MarketingLayout from '../../components/layouts/MarketingLayout';

export default function Contact() {
  return (
    <MarketingLayout>
      <section className="page-section">
        <div className="container">
          <h1>Contact</h1>
          <div className="card" style={{ display: 'grid', gap: 12 }}>
            <input placeholder="Name" />
            <input placeholder="Email" />
            <textarea placeholder="Message" />
            <button>Send</button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
