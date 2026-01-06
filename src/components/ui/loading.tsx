export function MovieCardSkeleton() {
    return (
        <div className="flex-shrink-0 w-[160px] md:w-[200px] animate-pulse">
            <div className="aspect-[2/3] bg-white/5 rounded-xl mb-3" />
            <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
            <div className="h-3 bg-white/5 rounded w-1/2" />
        </div>
    );
}

export function CarouselSkeleton() {
    return (
        <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
                <MovieCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="aspect-[2/3] bg-white/5 rounded-xl mb-3" />
                    <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
            ))}
        </div>
    );
}

export function ActivityFeedSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-white/5" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-white/5 rounded w-3/4" />
                            <div className="h-3 bg-white/5 rounded w-1/2" />
                        </div>
                        <div className="w-12 h-16 bg-white/5 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "h-4 w-4 border-2",
        md: "h-8 w-8 border-3",
        lg: "h-12 w-12 border-4",
    };

    return (
        <div className="flex items-center justify-center">
            <div
                className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`}
                role="status"
                aria-label="Loading"
            />
        </div>
    );
}

export function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="text-center space-y-4">
                <Spinner size="lg" />
                <p className="text-gray-400 text-sm">Loading...</p>
            </div>
        </div>
    );
}
