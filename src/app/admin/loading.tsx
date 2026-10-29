export default function LoadingAdminPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between">
        <div className="h-7 w-36 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-8 w-28 bg-slate-100 rounded-xl animate-pulse" />
      </header>
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 bg-white rounded-2xl border border-slate-200" />
          <div className="h-28 bg-white rounded-2xl border border-slate-200" />
          <div className="h-28 bg-white rounded-2xl border border-slate-200" />
        </div>
        <div className="h-80 bg-white rounded-3xl border border-slate-200" />
      </div>
    </div>
  );
}
