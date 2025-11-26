import { Skeleton } from '../../ui/skeleton';

export const Loading = () => {
  return (
    <div className="container py-5 md:py-8">
      <div className="flex gap-4 justify-between w-full">
        <div className="flex flex-col gap-1 max-w-[350px] w-full">
          <Skeleton className="h-[26px]" />
          <Skeleton className="h-[34px]" />
        </div>
        <Skeleton className="h-[36px] w-[116px]" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:h-[74px] mt-8">
        <Skeleton className="h-[74px] w-full" />
        <Skeleton className="h-[74px] w-full" />
        <Skeleton className="h-[74px] w-full" />
        <Skeleton className="h-[74px] w-full" />
      </div>
      <div className="flex flex-col gap-4 mt-7">
        <Skeleton className="h-[30px] w-[150px]" />
        <div className="grid [grid-template-columns:1fr] md:[grid-template-columns:repeat(auto-fit,minmax(680px,_1fr))] gap-4">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    </div>
  );
};
