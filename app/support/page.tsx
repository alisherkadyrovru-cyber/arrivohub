import Link from "next/link";

export default function Support() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="glass max-w-md w-full p-8 space-y-4 text-center">
        <div className="text-2xl font-semibold">Contact Support</div>
        <p className="text-white/70 text-sm">
          If you need help, please reach out to us via email or phone. Our team will respond as soon as possible.
        </p>
        <div className="space-y-2 text-sm">
          <div><span className="muted">Email: </span><span>support@arrivohub.com</span></div>
          <div><span className="muted">Phone: </span><span>+90 555 000 00 00</span></div>
        </div>
        <Link href="/" className="glass-btn inline-block mt-2">Back to home</Link>
      </div>
    </div>
  );
}
