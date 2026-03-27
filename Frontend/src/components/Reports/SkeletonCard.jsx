import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="animate-pulse flex flex-col h-full">
            {/* KPI Skeletons */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 h-16">
                        <div className="h-2 w-12 bg-slate-700/50 rounded-full mb-2" />
                        <div className="h-5 w-16 bg-slate-700/50 rounded-full" />
                    </div>
                ))}
            </div>

            {/* AI Insight Skeleton */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-8 flex gap-3 h-20">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-2 bg-blue-500/10 rounded-full w-20" />
                    <div className="h-2 bg-slate-700/50 rounded-full w-full" />
                    <div className="h-2 bg-slate-700/50 rounded-full w-3/4" />
                </div>
            </div>

            {/* Elements Skeleton */}
            <div className="flex flex-wrap gap-4 mb-10">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-6 w-20 bg-white/5 border border-white/5 rounded-xl" />
                ))}
            </div>

            {/* Spacer to push buttons to bottom if needed */}
            <div className="flex-1" />
        </div>
    );
};

export default SkeletonCard;
