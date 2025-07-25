
import { Skeleton } from "@/components/ui/skeleton";

const MovieCardSkeleton = () => {
  return (
    <div className="relative group">
      <Skeleton className="w-full aspect-[2/3] rounded-lg" />
      <div className="mt-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2 mt-2" />
      </div>
    </div>
  );
};

export default MovieCardSkeleton;
