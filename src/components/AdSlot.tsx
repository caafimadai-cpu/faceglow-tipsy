import React from 'react';
import { cn } from '@/lib/utils';

interface AdSlotProps {
  type: 'banner' | 'video' | 'square' | 'skyscraper';
  className?: string;
  id?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ type, className, id }) => {
  const adDimensions = {
    banner: {
      desktop: 'h-[90px] w-full max-w-[728px]',
      mobile: 'h-[50px] w-full max-w-[320px]',
    },
    video: {
      desktop: 'h-[250px] w-full max-w-[300px]',
      mobile: 'h-[250px] w-full max-w-[300px]',
    },
    square: {
      desktop: 'h-[250px] w-full max-w-[300px]',
      mobile: 'h-[250px] w-full max-w-[300px]',
    },
    skyscraper: {
      desktop: 'h-[600px] w-[160px]',
      mobile: 'hidden', // Hide on mobile
    }
  };

  const dimensions = adDimensions[type];

  return (
    <div 
      className={cn(
        "ad-slot mx-auto bg-muted/30 border border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center",
        `${dimensions.mobile} md:${dimensions.desktop}`,
        className
      )}
      id={id}
      data-ad-type={type}
    >
      <div className="text-center p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          Advertisement
        </p>
        <p className="text-xs text-muted-foreground/60">
          {type === 'banner' && 'Leaderboard Banner (728×90)'}
          {type === 'video' && 'Video Ad (300×250)'}
          {type === 'square' && 'Medium Rectangle (300×250)'}
          {type === 'skyscraper' && 'Wide Skyscraper (160×600)'}
        </p>
      </div>
    </div>
  );
};
