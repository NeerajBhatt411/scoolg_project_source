import React from 'react';

// Premium Shimmer block with a sweeping gradient
export const ShimmerBlock = ({ className = "" }) => (
    <div className={`relative overflow-hidden bg-slate-100 rounded-2xl ${className}`}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
);

// Generic List Shimmer for simple list pages
export const StudentListShimmer = ({ count = 5 }) => (
    <div className="w-full space-y-4 px-4 sm:px-6 pt-6">
        <div className="flex justify-between items-center mb-6">
            <ShimmerBlock className="h-8 w-48" />
            <ShimmerBlock className="h-8 w-24 rounded-xl" />
        </div>
        {[...Array(count)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 flex items-start gap-4">
                <ShimmerBlock className="w-12 h-12 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2.5 py-1">
                    <ShimmerBlock className="h-4 w-3/4" />
                    <ShimmerBlock className="h-3 w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

// Dashboard Shimmer (Bento Grid)
export const DashboardShimmer = () => (
    <div className="w-full h-full pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
            {/* Title */}
            <div className="space-y-2.5 mb-6 sm:mb-8">
                <ShimmerBlock className="w-48 sm:w-64 h-8 sm:h-10 rounded-xl" />
                <ShimmerBlock className="w-32 h-4 rounded-md" />
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-[16px] sm:rounded-[24px] p-4 sm:p-5 border border-slate-100 flex items-center gap-3 sm:gap-4 shadow-sm">
                        <ShimmerBlock className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl shrink-0" />
                        <div className="flex-1 space-y-2">
                            <ShimmerBlock className="h-2.5 w-16 rounded" />
                            <ShimmerBlock className="h-6 sm:h-8 w-12 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                <div className="lg:col-span-2 bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm min-h-[350px]">
                    <div className="flex justify-between items-center mb-8">
                        <ShimmerBlock className="w-40 h-6 rounded-lg" />
                        <ShimmerBlock className="w-24 h-4 rounded" />
                    </div>
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4 items-center">
                                <ShimmerBlock className="w-16 h-10 rounded-lg shrink-0" />
                                <div className="w-[2px] h-12 bg-slate-100 shrink-0"></div>
                                <ShimmerBlock className="flex-1 h-16 rounded-[20px]" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm min-h-[350px] flex flex-col">
                    <ShimmerBlock className="w-32 h-6 rounded-lg mb-8" />
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <ShimmerBlock className="w-32 h-32 rounded-full" />
                        <div className="flex gap-2">
                            <ShimmerBlock className="w-10 h-3 rounded" />
                            <ShimmerBlock className="w-10 h-3 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Generic Page Shimmer (for single content view like Calendar, Attendance)
export const PageShimmer = () => (
    <div className="w-full h-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8">
            <div className="space-y-2">
                <ShimmerBlock className="h-8 w-48 rounded-xl" />
                <ShimmerBlock className="h-4 w-64 rounded-md" />
            </div>
            <div className="bg-white rounded-[32px] border border-slate-100 p-6 sm:p-8 min-h-[400px]">
                <ShimmerBlock className="h-8 w-32 mb-8" />
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {[1,2,3,4,5,6,7].map(i => <ShimmerBlock key={i} className="h-6 w-full" />)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {[...Array(35)].map((_, i) => (
                        <ShimmerBlock key={i} className="h-10 sm:h-14 w-full" />
                    ))}
                </div>
            </div>
        </div>
    </div>
);
