import { Skeleton } from './skeleton';

export const TemplateCardSkeleton = () => {
  return (
    <div className="w-full shrink-0 rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200">
      <Skeleton className="w-full aspect-[4/5] rounded-none" />
      <div className="p-8 bg-white flex justify-between items-start">
        <div className="space-y-2 w-full">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </div>
  );
};
