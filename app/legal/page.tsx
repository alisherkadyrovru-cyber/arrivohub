import { Header } from "@/components/Header";
export default function LegalPage() {
  return (
    <div className="min-h-screen pb-12">
      <div className="mx-auto pt-6"><Header /></div>
      <div className="mx-auto mt-8 max-w-4xl px-4">
        <div className="glass p-6">
          <h1 className="text-2xl font-semibold">License Agreement</h1>
          <p className="mt-2 text-sm text-white/75">Placeholder. Later we will add full text.</p>
        </div>
      </div>
    </div>
  );
}
