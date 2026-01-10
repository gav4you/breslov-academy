import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { tokens, cx } from '@/components/theme/tokens';

export function CourseCardSkeleton() {
  return (
    <div className={cx(tokens.glass.card, "h-full overflow-hidden flex flex-col")}>
      <div className="aspect-video bg-muted/50 relative">
        <Skeleton className="absolute inset-0 w-full h-full" />
      </div>
      <div className="p-6 flex-1 flex flex-col space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="pt-4 border-t border-border/50 flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className={tokens.glass.card}>
      <div className="p-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className={tokens.layout.sectionGap}>
      {/* Welcome Skeleton */}
      <div className={cx(tokens.glass.card, "p-8 md:p-12")}>
        <div className="space-y-4 max-w-lg">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-8 w-32 mt-4" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className={cx("grid grid-cols-1 md:grid-cols-3", tokens.layout.gridGap)}>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Courses Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className={cx("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3", tokens.layout.gridGap)}>
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function CourseDetailSkeleton() {
  return (
    <div className={tokens.layout.sectionGap}>
      {/* Hero Skeleton */}
      <div className="relative overflow-hidden rounded-3xl bg-muted/20 border border-border/50 h-[400px]">
        <div className="p-8 md:p-12 h-full flex flex-col justify-center">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-8 w-48 mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-border/50 bg-card/50 flex items-center p-4 gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}