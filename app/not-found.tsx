export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-purple-400 font-bold text-6xl mb-4">404</p>
        <h1 className="text-white text-2xl font-bold mb-2">הדף לא נמצא</h1>
        <p className="text-white/50 mb-8">Page not found</p>
        <a href="/" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition">
          חזרה לדף הבית
        </a>
      </div>
    </div>
  );
}
