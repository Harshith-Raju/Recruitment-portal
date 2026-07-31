import React from 'react';

export const SkeletonText = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-white/5 rounded-md ${className}`} />
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`glass-card p-6 flex flex-col gap-4 w-full ${className}`}>
      <SkeletonText className="h-6 w-3/4" />
      <SkeletonText className="h-4 w-full" />
      <SkeletonText className="h-4 w-5/6" />
      <div className="flex gap-2 mt-2">
        <SkeletonText className="h-8 w-20 rounded-full" />
        <SkeletonText className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
};
