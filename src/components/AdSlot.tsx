import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AdSlotProps {
  type: 'banner' | 'video' | 'square' | 'skyscraper';
  placement: 'top-banner' | 'bottom-banner' | 'left-skyscraper' | 'right-square-1' | 'right-square-2' | 'right-video' | 'middle-square' | 'post-results-video';
  className?: string;
  id?: string;
}

interface Ad {
  id: string;
  title: string;
  type: string;
  media_url: string;
  click_url: string | null;
  placement: string;
  is_active: boolean;
}

export const AdSlot: React.FC<AdSlotProps> = ({ type, placement, className, id }) => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      mobile: 'hidden',
    }
  };

  const dimensions = adDimensions[type];

  useEffect(() => {
    fetchAd();
  }, [placement]);

  const fetchAd = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('placement', placement)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setAd(data);
    } catch (error) {
      console.error('Error fetching ad:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdClick = () => {
    if (ad?.click_url) {
      window.open(ad.click_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return (
      <div 
        className={cn(
          "ad-slot mx-auto bg-muted/20 rounded-lg animate-pulse",
          `${dimensions.mobile} md:${dimensions.desktop}`,
          className
        )}
        id={id}
      />
    );
  }

  if (!ad) {
    return (
      <div 
        className={cn(
          "ad-slot mx-auto bg-muted/30 border border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center",
          `${dimensions.mobile} md:${dimensions.desktop}`,
          className
        )}
        id={id}
      >
        <div className="text-center p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Advertisement Space
          </p>
          <p className="text-xs text-muted-foreground/60">
            {type === 'banner' && 'Banner (728×90 / 320×50)'}
            {type === 'video' && 'Video Ad (300×250)'}
            {type === 'square' && 'Square Ad (300×250)'}
            {type === 'skyscraper' && 'Skyscraper (160×600)'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "ad-slot mx-auto overflow-hidden rounded-lg",
        `${dimensions.mobile} md:${dimensions.desktop}`,
        ad.click_url && "cursor-pointer hover:opacity-90 transition-opacity",
        className
      )}
      id={id}
      onClick={handleAdClick}
      role={ad.click_url ? "button" : undefined}
      tabIndex={ad.click_url ? 0 : undefined}
    >
      {ad.type === 'video' ? (
        <video
          src={ad.media_url}
          className="w-full h-full object-cover"
          controls
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img
          src={ad.media_url}
          alt={ad.title}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};
