const TourCardSkeleton = () => (
    <div className="bg-[var(--tv-surface)] rounded-3xl border border-[var(--tv-border)] overflow-hidden">
        <div className="h-56 tv-shimmer" />
        <div className="p-5 space-y-3">
            <div className="h-3 w-1/3 rounded tv-shimmer" />
            <div className="h-4 w-5/6 rounded tv-shimmer" />
            <div className="h-4 w-2/3 rounded tv-shimmer" />
            <div className="flex justify-between items-center pt-4">
                <div className="h-6 w-24 rounded tv-shimmer" />
                <div className="h-9 w-24 rounded-xl tv-shimmer" />
            </div>
        </div>
    </div>
);

export default TourCardSkeleton;
