import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface AdSlotProps {
  type: 'banner' | 'video' | 'square' | 'skyscraper';
  placement: string;
  className?: string;
}

interface Ad {
  id: string;
  title: string;
  type: string;
  media_url: string;
  click_url?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ type, placement, className }) => {
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
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setAd(data);
    } catch (error) {
      console.error('Error fetching ad:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dimensions = adDimensions[type];

  const handleClick = () => {
    if (ad?.click_url) {
      window.open(ad.click_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return (
      <div 
        className={cn(
          "mx-auto rounded-xl overflow-hidden",
          "bg-secondary/30 border border-border/30",
          `${dimensions.mobile} md:${dimensions.desktop}`,
          className
        )}
      >
        <div className="w-full h-full animate-pulse bg-gradient-to-r from-secondary/50 via-secondary to-secondary/50" />
      </div>
    );
  }

  if (!ad) {
    return (
      <div 
        className={cn(
          "mx-auto rounded-xl overflow-hidden",
          "bg-secondary/20 border border-dashed border-border/50",
          "flex items-center justify-center",
          `${dimensions.mobile} md:${dimensions.desktop}`,
          className
        )}
      >
        <div className="text-center p-4">
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-medium">
            Advertisement
          </p>
        </div>
      </div>
    );
  }

  const isVideo = type === 'video' || ad.media_url.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div 
      className={cn(
        "mx-auto overflow-hidden rounded-xl",
        "border border-border/30 bg-card/50",
        "transition-all duration-300",
        `${dimensions.mobile} md:${dimensions.desktop}`,
        ad.click_url && "cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
      onClick={handleClick}
      role={ad.click_url ? "button" : undefined}
      tabIndex={ad.click_url ? 0 : undefined}
    >
      {isVideo ? (
        <video
          src={ad.media_url}
          className="w-full h-full object-cover"
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
