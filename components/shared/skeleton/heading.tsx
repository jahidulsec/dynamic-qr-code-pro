import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import React from "react";

const HeadingWithBackbuttonSkeleton = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div className={cn("flex gap-2", className)} {...props}>
      <Skeleton className="aspect-square h-10 rounded-full" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-6 w-32 rounded-md" />
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>
    </div>
  );
};

export { HeadingWithBackbuttonSkeleton };
