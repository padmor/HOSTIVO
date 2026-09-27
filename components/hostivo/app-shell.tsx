import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

type AppShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  email?: string | null;
  navItems: NavItem[];
  activeHref: string;
  children: React.ReactNode;
  logoutAction: () => void | Promise<void>;
};

export function AppShell({
  eyebrow,
  title,
  description,
  email,
  navItems,
  activeHref,
  children,
  logoutAction,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="sidebar-brand">
          <span className="brand-mark">H</span>
          <span>
            <strong>Hostivo</strong>
            <small>Smart hostel management</small>
          </span>
        </Link>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          <span className="nav-label">Workspace</span>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={"nav-item" + (item.href === activeHref ? " active" : "")}
              aria-current={item.href === activeHref ? "page" : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link className="sidebar-account" href="/dashboard">
            <span className="avatar">{(email?.[0] ?? "U").toUpperCase()}</span>
            <span className="account-copy">
              <strong>{email ?? "Account"}</strong>
              <small>Open account</small>
            </span>
          </Link>
          <form action={logoutAction}>
            <button className="logout-link" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Hostivo <span>/</span> {eyebrow}</div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Notifications">
              ♢
            </button>
            <span className="topbar-avatar">{(email?.[0] ?? "U").toUpperCase()}</span>
          </div>
        </header>

        <div className="content-container">
          <section className="page-header">
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
          </section>
          {children}
        </div>
      </main>
    </div>
  );
}
