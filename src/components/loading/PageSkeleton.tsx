/** Instant placeholder shown while a server-rendered page loads, so navigation feels immediate. */
export function PublicPageSkeleton({ variant = "list" }: { variant?: "list" | "article" | "split" }) {
  return (
    <div className="min-h-screen bg-[#F7F1E8]" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      {variant === "split" ? (
        <div className="grid h-screen grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col items-center justify-center gap-4 px-8">
            <div className="h-9 w-3/4 max-w-md animate-pulse rounded-full bg-gray-900/10" />
            <div className="h-4 w-2/3 max-w-sm animate-pulse rounded-full bg-gray-900/10" />
            <div className="mt-6 h-12 w-full max-w-md animate-pulse rounded-full bg-gray-900/10" />
          </div>
          <div className="hidden animate-pulse rounded-b-[2.5rem] bg-gray-900/10 lg:block lg:h-[95vh]" />
        </div>
      ) : variant === "article" ? (
        <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
          <div className="h-8 w-2/3 animate-pulse rounded-full bg-gray-900/10" />
          <div className="mt-4 h-4 w-1/3 animate-pulse rounded-full bg-gray-900/10" />
          <div className="mt-8 aspect-[16/10] w-full max-w-4xl animate-pulse rounded-2xl bg-gray-900/10" />
        </div>
      ) : (
        <div className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="h-[60vh] animate-pulse rounded-[28px] bg-gray-900/10" />
          <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-900/10" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-7 w-48 animate-pulse rounded-full bg-gray-900/10" />
      <div className="h-4 w-80 max-w-full animate-pulse rounded-full bg-gray-900/10" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}
