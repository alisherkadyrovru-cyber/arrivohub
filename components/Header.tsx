import Link from "next/link";
export function Header({ titleCenter, rightSlot, showContacts=true }:{ titleCenter?:string; rightSlot?:React.ReactNode; showContacts?:boolean }) {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="glass flex items-center justify-between px-5 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">ArrivoHub</Link>
        <div className="text-sm font-semibold text-white/90">{titleCenter ?? ""}</div>
        <div className="flex items-center gap-3">
          {showContacts ? <Link className="glass-btn" href="/contact">Контакты</Link> : null}
          {rightSlot}
        </div>
      </div>
    </div>
  );
}
