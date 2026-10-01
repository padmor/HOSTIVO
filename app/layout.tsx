import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Hostivo — Smarter Hostel Management", description: "A modern platform for managing hostel accommodation, applications, payments, and room allocation." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }