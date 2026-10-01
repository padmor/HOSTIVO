"use client";

import { ArrowRight, Building2, Check, ChevronDown, CircleCheck, CreditCard, LayoutDashboard, Menu, ShieldCheck, Users, X } from "lucide-react";
import { useState } from "react";

const features = [
  { icon: Building2, title: "Know every room", text: "Organize hostels by blocks, floors, and rooms with live capacity and occupancy." },
  { icon: Users, title: "Manage tenants simply", text: "Move from application to accommodation with one connected tenant journey." },
  { icon: CreditCard, title: "Track payments", text: "Keep application fees, accommodation payments, and payment status in one place." },
  { icon: ShieldCheck, title: "Built for control", text: "Role-aware workflows and secure operations keep sensitive hostel data protected." },
];

const steps = [
  ["01", "Set up your hostel", "Create your hostel, blocks, floors, rooms, capacities, and rules."],
  ["02", "Receive applications", "Let students apply online and keep every application organized."],
  ["03", "Verify and allocate", "Connect payment verification to room availability and allocation."],
];

export default function Home() {
  const [open, setOpen] = useState(false);
  return <main>
    <header className="nav"><div className="container nav-inner"><a className="brand" href="#"><span className="brand-mark">H</span><span>Hostivo</span></a><nav className={open ? "nav-links open" : "nav-links"}><a href="#features" onClick={()=>setOpen(false)}>Features</a><a href="#how-it-works" onClick={()=>setOpen(false)}>How it works</a><a href="#about" onClick={()=>setOpen(false)}>About</a><a className="mobile-login" href="/login">Log in</a><a className="mobile-cta" href="/register">Get started <ArrowRight size={16}/></a></nav><div className="nav-actions"><a className="login" href="/login">Log in</a><a className="button button-dark button-small" href="/register">Get started <ArrowRight size={16}/></a></div><button className="menu" aria-label="Toggle menu" onClick={()=>setOpen(!open)}>{open ? <X/> : <Menu/>}</button></div></header>

    <section className="hero"><div className="hero-glow"/><div className="container hero-grid"><div className="hero-copy"><div className="eyebrow"><span className="pulse"/><span>Modern hostel management</span></div><h1>Run your hostel.<br/><em>Simply.</em></h1><p className="hero-text">Hostivo brings applications, payments, tenants, rooms, and allocation into one intelligent platform.</p><div className="hero-actions"><a className="button button-primary" href="/register">Get started <ArrowRight size={18}/></a><a className="text-link" href="#how-it-works">See how it works <ArrowRight size={17}/></a></div><div className="trust"><CircleCheck size={17}/><span>Built for modern hostel operations</span></div></div><div className="hero-visual"><div className="dashboard-card"><div className="dash-top"><div><span className="muted">Overview</span><h3>Good morning, Admin</h3></div><div className="avatar">A</div></div><div className="stat-grid"><div className="stat"><span>Total rooms</span><strong>48</strong><small>Across 3 blocks</small></div><div className="stat"><span>Occupied</span><strong>164</strong><small className="positive">↑ 8 this week</small></div><div className="stat"><span>Available</span><strong>28</strong><small>Room capacity</small></div></div><div className="occupancy"><div className="row"><span>Occupancy</span><strong>85%</strong></div><div className="bar"><span/></div><div className="occupancy-meta"><span>164 occupied</span><span>192 total capacity</span></div></div><div className="room-list"><div className="row room-title"><span>Recent room status</span><a href="/dashboard">View all</a></div><div className="room"><div><b>Block A · Floor 2</b><span>Room 204 · Capacity 4</span></div><span className="status available">2 spaces</span></div><div className="room"><div><b>Block B · Floor 1</b><span>Room 106 · Capacity 4</span></div><span className="status full">Full</span></div></div></div></div></div></section>

    <section className="logo-strip"><div className="container strip-inner"><span>ONE PLATFORM FOR</span><div>APPLICATIONS</div><div>PAYMENTS</div><div>ROOMS</div><div>TENANTS</div><div>OPERATIONS</div></div></section>

    <section className="section" id="features"><div className="container"><div className="section-heading"><span className="kicker">Everything connected</span><h2>Less paperwork.<br/>More control.</h2><p>Hostivo gives hostel managers a clear view of what matters, while giving tenants a simpler way to get accommodated.</p></div><div className="feature-grid">{features.map(({icon:Icon,title,text})=><article className="feature" key={title}><div className="icon-box"><Icon size={22}/></div><h3>{title}</h3><p>{text}</p><a href="/register">Explore <ArrowRight size={15}/></a></article>)}</div></div></section>

    <section className="dark-section" id="how-it-works"><div className="container workflow"><div className="section-heading light"><span className="kicker">How it works</span><h2>From application<br/>to room.</h2><p>One connected flow designed around how hostels actually operate.</p></div><div className="steps">{steps.map(([num,title,text])=><div className="step" key={num}><span className="step-num">{num}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></div></section>

    <section className="section about" id="about"><div className="container about-grid"><div><span className="kicker">Designed around the real world</span><h2>Rooms, not beds.</h2></div><div><p className="large">Hostivo keeps accommodation management focused on the things managers actually need: <strong>hostels, blocks, floors, rooms, capacity, occupancy, and tenants.</strong></p><p>No unnecessary bed-level complexity. When a room has space, the system knows it—and can use that information throughout the tenant journey.</p></div></div></section>

    <section className="cta"><div className="container cta-inner"><div><span className="kicker">Ready to simplify?</span><h2>Build a better hostel<br/>experience.</h2></div><a className="button button-light" href="/register">Get started with Hostivo <ArrowRight size={18}/></a></div></section>

    <footer><div className="container footer-inner"><a className="brand" href="#"><span className="brand-mark">H</span><span>Hostivo</span></a><span>© 2026 Hostivo. Smarter hostel management.</span><div><a href="/login">Log in</a><a href="/register">Get started</a></div></div></footer>
  </main>;
}