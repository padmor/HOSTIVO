export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className="group inline-flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 shadow-sm transition-transform group-hover:-translate-y-0.5 ${light ? "ring-1 ring-white/20" : ""}`}>
        <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M8 10h8" stroke="#38BDF8" strokeLinecap="round" strokeWidth="2" />
        </svg>
      </span>
      <span className="grid gap-0.5">
        <strong className={`text-xl leading-none font-extrabold tracking-tight ${light ? "text-white" : "text-slate-900"}`}>Hosti<span className="text-sky-500">vo</span></strong>
        <small className={`text-[7px] leading-none font-bold tracking-[0.2em] ${light ? "text-slate-400" : "text-slate-500"}`}>HOSTEL MANAGEMENT</small>
      </span>
    </span>
  );
}
