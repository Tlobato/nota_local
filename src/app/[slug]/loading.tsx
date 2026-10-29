export default function LoadingReviewPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-pulse">
        <div className="h-28 bg-slate-200 p-6 flex flex-col justify-end">
          <div className="h-3 w-28 bg-slate-300 rounded mb-2" />
          <div className="h-5 w-48 bg-slate-300 rounded" />
        </div>
        <div className="p-6 space-y-5 flex flex-col items-center">
          <div className="h-5 w-56 bg-slate-200 rounded" />
          <div className="h-3.5 w-44 bg-slate-100 rounded" />
          <div className="flex items-center justify-center gap-3 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-11 h-11 rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
