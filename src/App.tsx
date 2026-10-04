import { useState } from "react";
import { ArrowRight, CheckCircle2, Building2, CreditCard, DoorOpen, ShieldCheck, Users, X } from "lucide-react";
import Admin from "./Admin";
import TenantPortal from "./TenantPortal";
import Brand from "./Brand";
import { useHostel, avail } from "./hostelStore";

type Portal = "tenant" | "manager";
type Mode = "login" | "register";

function Auth({ portal, mode, onClose, onDone, onSwitch }: { portal: Portal; mode: Mode; onClose: () => void; onDone: () => void; onSwitch: (m: Mode) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (email && password) onDone(); };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" onMouseDown={onClose}>
    <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl" onMouseDown={e => e.stopPropagation()}>
      <div className="flex items-center justify-between"><Brand/><button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100"><X/></button></div>
      <p className="mt-8 text-sm font-bold text-indigo-600">{portal === "tenant" ? "Tenant portal" : "Manager portal"}</p>
      <h2 className="mt-1 text-2xl font-black">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
      <p className="mt-2 text-sm text-slate-500">{mode === "login" ? "Sign in to continue." : "Use only your email and password."}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"/>
        <input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"/>
        <button className="w-full rounded-xl bg-slate-950 py-3.5 font-bold text-white">{mode === "login" ? "Log in" : "Create account"}</button>
      </form>
      <button onClick={() => onSwitch(mode === "login" ? "register" : "login")} className="mt-5 w-full text-center text-sm font-semibold text-indigo-600">{mode === "login" ? "Create an account" : "Already have an account? Log in"}</button>
    </div>
  </div>;
}

export default function App() {
  const { info, blocks, rooms } = useHostel();
  const [portal, setPortal] = useState<Portal | null>(null);
  const [mode, setMode] = useState<Mode>("login");
  const [admin, setAdmin] = useState(false);
  const [tenant, setTenant] = useState(false);
  const free = rooms.reduce((n, r) => n + avail(r), 0);
  const auth = (p: Portal, m: Mode) => { setPortal(p); setMode(m); };
  if (admin) return <Admin onLogout={() => setAdmin(false)}/>;
  if (tenant) return <TenantPortal onLogout={() => setTenant(false)}/>;
  return <div className="min-h-screen bg-white text-slate-950">
    <div className="bg-slate-950 px-5 py-2 text-center text-xs font-bold text-white">{free + " accommodation spaces currently available at " + info.name + "."}</div>
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"><a href="#home"><Brand/></a><nav className="hidden gap-7 text-sm font-bold text-slate-600 md:flex"><a href="#features">Features</a><a href="#flow">How it works</a><a href="#portals">Portals</a></nav><button onClick={() => auth("tenant","login")} className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white">Log in</button></div></header>
    <main id="home">
      <section className="relative overflow-hidden"><div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,rgba(99,102,241,.18),transparent_65%)]"/><div className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 text-center sm:pt-28"><span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-indigo-700">{info.name}</span><h1 className="mx-auto mt-7 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">Hostel management, <span className="text-indigo-600">made simple.</span></h1><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">{info.about} Applications, payments and accommodation allocation in one connected system.</p><div className="mt-9 flex flex-wrap justify-center gap-3"><button onClick={() => auth("tenant","register")} className="rounded-full bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20">Apply for accommodation <ArrowRight className="ml-2 inline" size={17}/></button><button onClick={() => auth("manager","login")} className="rounded-full border px-6 py-3.5 text-sm font-bold">Manager login</button></div><div className="mx-auto mt-12 grid max-w-xl grid-cols-3 gap-4"><div><b className="text-3xl">{blocks.length}</b><p className="text-xs font-bold text-slate-500">Blocks</p></div><div><b className="text-3xl">{rooms.length}</b><p className="text-xs font-bold text-slate-500">Rooms</p></div><div><b className="text-3xl">{free}</b><p className="text-xs font-bold text-slate-500">Available</p></div></div></div></section>
      <section id="features" className="border-y bg-slate-50"><div className="mx-auto max-w-6xl px-5 py-20"><p className="text-xs font-black uppercase tracking-widest text-indigo-600">One connected platform</p><h2 className="mt-2 text-4xl font-black tracking-tight">Everything your hostel needs.</h2><div className="mt-10 grid gap-4 md:grid-cols-3">{[[CreditCard,"Payments","Track payments and status clearly."],[DoorOpen,"Allocation","Move from payment to accommodation without unnecessary approval delays."],[Users,"Tenants","Keep tenant information and accommodation records organized."],[Building2,"Hostel operations","Manage the single hostel, blocks and rooms from one place."],[ShieldCheck,"Secure access","Separate tenant and manager portals."],[CheckCircle2,"Clear status","Know exactly where every application stands."]].map(([I,t,d]) => <article className="rounded-2xl border bg-white p-6" key={String(t)}><I className="text-indigo-600" size={23}/><h3 className="mt-5 font-black">{String(t)}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{String(d)}</p></article>)}</div></div></section>
      <section id="flow" className="mx-auto max-w-6xl px-5 py-20"><p className="text-xs font-black uppercase tracking-widest text-indigo-600">Tenant flow</p><h2 className="mt-2 text-4xl font-black">Login → payment → portal → accommodation.</h2><div className="mt-10 grid gap-4 md:grid-cols-4">{["Create account","Pay","Payment successful","Choose accommodation"].map((x,i) => <div className="rounded-2xl border p-6" key={x}><span className="text-sm font-black text-indigo-600">0{i+1}</span><h3 className="mt-5 font-black">{x}</h3><p className="mt-2 text-sm text-slate-500">Complete this step and continue automatically.</p></div>)}</div></section>
      <section id="portals" className="bg-slate-950 text-white"><div className="mx-auto max-w-6xl px-5 py-20"><p className="text-xs font-black uppercase tracking-widest text-indigo-300">Choose your portal</p><div className="mt-8 grid gap-5 md:grid-cols-2"><div className="rounded-3xl bg-white/10 p-8"><Building2/><h3 className="mt-6 text-3xl font-black">Manager portal</h3><p className="mt-3 text-slate-300">Rooms, tenants, payments and hostel operations for one managed residence.</p><button onClick={() => auth("manager","login")} className="mt-7 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950">Manager login</button></div><div className="rounded-3xl bg-indigo-600 p-8"><Users/><h3 className="mt-6 text-3xl font-black">Tenant portal</h3><p className="mt-3 text-indigo-100">Pay, continue to your portal and secure an available room.</p><button onClick={() => auth("tenant","register")} className="mt-7 rounded-full bg-white px-5 py-3 text-sm font-bold text-indigo-700">Create account</button></div></div></div></section>
    </main>
    <footer className="border-t px-5 py-8 text-center text-sm text-slate-500">© 2026 {info.name}. Hostivo hostel management.</footer>
    {portal && <Auth portal={portal} mode={mode} onClose={() => setPortal(null)} onSwitch={setMode} onDone={() => { setPortal(null); portal === "manager" ? setAdmin(true) : setTenant(true); }}/>}
  </div>;
}
