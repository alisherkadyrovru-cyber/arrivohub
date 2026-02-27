import Link from "next/link";
export function Header({ titleCenter, rightSlot, showContacts=true, homeHref="/" }:{ titleCenter?:string; rightSlot?:React.ReactNode; showContacts?:boolean; homeHref?:string }) {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="glass flex items-center justify-between px-5 py-4">
        <Link href={homeHref} className="text-lg font-semibold tracking-tight">ArrivoHub</Link>
        <div className="text-sm font-semibold text-white/90">{titleCenter ?? ""}</div>
        <div className="flex items-center gap-3">
          {showContacts ? <Link className="glass-btn" href="/contact">Contacts</Link> : null}
          {rightSlot}
        </div>
      </div>
    </div>
  );
}
