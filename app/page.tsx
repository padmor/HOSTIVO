import Link from "next/link";

const features = [
  ["01", "One hostel workspace", "Bring accommodation, tenants, payments, maintenance, and announcements into one operating system."],
  ["02", "Automated allocation", "Move verified tenant payments into controlled room and bed allocation without double-booking."],
  ["03", "Role-based access", "Give managers, staff, tenants, and system administrators focused experiences built around their responsibilities."],
];

export default function HomePage() {
  return (
    <main>
      <header className="public-header">
        <Link href="/" className="public-brand">
          <span className="brand-mark">H</span>
          <span>
            <strong>Hostivo</strong>
            <small>Smart hostel management</small>
          </span>
        </Link>
        <div className="inline-actions" style={{ marginTop: 0 }}>
          <Link className="secondary-button link-button" href="/login">Sign in</Link>
        </div>
      </header>

      <section className="public-hero">
        <div>
          <div className="public-kicker">Smart hostel operations · Built for scale</div>
          <h1>Run your hostel from one place.</h1>
          <p>
            Hostivo connects the full accommodation journey — from availability and
            applications to verified payment, room allocation, tenant records, and
            day-to-day hostel operations.
          </p>
          <div className="inline-actions">
            <Link className="primary-button link-button" href="/login">Get started</Link>
            <Link className="secondary-button link-button" href="#features">Explore Hostivo</Link>
          </div>
        </div>

        <div className="hero-panel" aria-label="Hostivo dashboard preview">
          <div className="hero-window">
            <div className="hero-window-top">
              <span className="window-dot" />
              <span className="window-dot" />
              <span className="window-dot" />
            </div>
            <div className="mock-layout">
              <aside className="mock-sidebar">
                <span className="brand-mark" style={{ width: 28, height: 28, borderRadius: 9, fontSize: 12 }}>H</span>
                <div className="mock-nav">
                  <span /><span /><span /><span />
                </div>
              </aside>
              <div className="mock-main">
                <div className="mock-title" />
                <div className="mock-subtitle" />
                <div className="mock-grid">
                  <div className="mock-stat"><b /><span /></div>
                  <div className="mock-stat"><b /><span /></div>
                  <div className="mock-stat"><b /><span /></div>
                  <div className="mock-stat"><b /><span /></div>
                </div>
                <div className="mock-table">
                  {[1,2,3,4].map((row) => (
                    <div className="mock-row" key={row}><span /><span /><span /></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-grid" id="features">
        {features.map(([number, title, description]) => (
          <article className="feature-card" key={number}>
            <div className="feature-icon">{number}</div>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
