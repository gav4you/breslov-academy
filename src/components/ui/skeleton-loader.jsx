import React from 'react';

export function SkeletonCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-sm shadow-lg animate-pulse">
          <div className="h-56 bg-slate-200" />
          <div className="p-8 space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-slate-200 rounded-full" />
              <div className="h-6 w-16 bg-slate-200 rounded-full" />
            </div>
            <div className="h-8 bg-slate-200 rounded-lg w-3/4" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-5/6" />
              <div className="h-4 bg-slate-200 rounded w-4/6" />
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-200 rounded w-24" />
              <div className="h-6 bg-slate-200 rounded-full w-16" />
            </div>
            <div className="h-12 bg-slate-200 rounded-2xl w-full" />
          </div>
        </div>
      ))}
    </>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 rounded animate-pulse"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({ size = 12, className = '' }) {
  return (
    <div
      className={`rounded-full bg-slate-200 animate-pulse ${className}`}
      style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
    />
  );
}