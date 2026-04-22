'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="font-heading font-bold text-xl text-[#1a1a2e] mb-2">Something went wrong</h2>
        <p className="text-gray-500 text-sm mb-6">
          We encountered an unexpected error loading your dashboard. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-[#0f172a] text-white rounded-xl text-sm font-semibold hover:bg-[#1e293b] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
