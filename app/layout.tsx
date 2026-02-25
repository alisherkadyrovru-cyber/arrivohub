import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title:"ArrivoHub", description:"ArrivoHub — B2B platform for travel agencies, assistants and guides in Turkey" };
export default function RootLayout({ children }:{ children:React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
