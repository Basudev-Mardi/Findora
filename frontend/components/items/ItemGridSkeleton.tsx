interface ItemGridSkeletonProps {
  count?: number;
}

export function ItemGridSkeleton({ count = 8 }: ItemGridSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Loading items"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden rounded-2xl border border-[#E7EBE8] bg-white"
        >
          <div className="aspect-[4/3] w-full animate-pulse bg-[#E7EBE8]" />
          <div className="flex flex-1 flex-col p-5">
            <div className="h-5 w-3/4 animate-pulse rounded-md bg-[#E7EBE8]" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-[#EFF2EF]" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-[#EFF2EF]" />
            </div>
            <div className="mt-4 space-y-2 border-t border-[#E7EBE8] pt-3.5">
              <div className="h-3 w-2/3 animate-pulse rounded bg-[#EFF2EF]" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-[#EFF2EF]" />
            </div>
            <div className="mt-5 h-9 w-full animate-pulse rounded-xl bg-[#E7EBE8]" />
          </div>
        </div>
      ))}
    </div>
  );
}
