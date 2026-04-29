import React from 'react';
import { motion } from 'framer-motion';

const Shimmer = () => (
  <motion.div
    initial={{ x: '-100%' }}
    animate={{ x: '100%' }}
    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"
  />
);

export const PostSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 relative overflow-hidden">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-100 relative overflow-hidden">
          <Shimmer />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded w-24 relative overflow-hidden">
            <Shimmer />
          </div>
          <div className="h-2 bg-slate-50 rounded w-32 relative overflow-hidden">
            <Shimmer />
          </div>
        </div>
      </div>
      <div className="w-8 h-8 bg-slate-50 rounded-xl relative overflow-hidden">
        <Shimmer />
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="h-3 bg-slate-100 rounded w-full relative overflow-hidden">
        <Shimmer />
      </div>
      <div className="h-3 bg-slate-100 rounded w-full relative overflow-hidden">
        <Shimmer />
      </div>
      <div className="h-3 bg-slate-100 rounded w-2/3 relative overflow-hidden">
        <Shimmer />
      </div>
    </div>

    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-4 bg-slate-50 rounded w-12 relative overflow-hidden">
          <Shimmer />
        </div>
        <div className="h-4 bg-slate-50 rounded w-12 relative overflow-hidden">
          <Shimmer />
        </div>
      </div>
      <div className="h-5 bg-slate-50 rounded-full w-20 relative overflow-hidden">
        <Shimmer />
      </div>
    </div>
  </div>
);

export const NetworkSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col items-center text-center relative overflow-hidden">
    <div className="w-12 h-12 rounded-full bg-slate-100 mb-3 relative overflow-hidden">
      <Shimmer />
    </div>
    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2 relative overflow-hidden">
      <Shimmer />
    </div>
    <div className="h-3 bg-slate-50 rounded w-1/2 mb-1 relative overflow-hidden">
      <Shimmer />
    </div>
    <div className="h-3 bg-slate-50 rounded w-1/3 mb-4 relative overflow-hidden">
      <Shimmer />
    </div>
    
    <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-between">
      <div className="h-3 bg-teal-50/50 rounded w-16 relative overflow-hidden">
        <Shimmer />
      </div>
      <div className="h-7 bg-slate-100 rounded-[50px] w-20 relative overflow-hidden">
        <Shimmer />
      </div>
    </div>
  </div>
);

export const ImageSkeleton = ({ aspectRatio = 'video' }: { aspectRatio?: string }) => (
  <div className={`w-full rounded-2xl bg-slate-100 relative overflow-hidden ${aspectRatio === 'video' ? 'aspect-video' : 'aspect-square'}`}>
    <Shimmer />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  </div>
);
