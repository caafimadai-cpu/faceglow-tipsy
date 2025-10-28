import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AdSlotProps {
  type: 'banner' | 'video' | 'square' | 'skyscraper';
  className?: string;
  id?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ type, className, id }) => {

  const adConfig = {
    banner: {
      desktop: { width: 728, height: 90, class: 'h-[90px] w-full max-w-[728px]' },
      mobile: { width: 320, height: 50, class: 'h-[50px] w-full max-w-[320px]' },
      slot: '1234567890', // Replace with your AdSense slot ID
    },
    video: {
      desktop: { width: 300, height: 250, class: 'h-[250px] w-full max-w-[300px]' },
      mobile: { width: 300, height: 250, class: 'h-[250px] w-full max-w-[300px]' },
      slot: '1234567891', // Replace with your AdSense slot ID
    },
    square: {
      desktop: { width: 300, height: 250, class: 'h-[250px] w-full max-w-[300px]' },
      mobile: { width: 300, height: 250, class: 'h-[250px] w-full max-w-[300px]' },
      slot: '1234567892', // Replace with your AdSense slot ID
    },
    skyscraper: {
      desktop: { width: 160, height: 600, class: 'h-[600px] w-[160px]' },
      mobile: { width: 160, height: 600, class: 'hidden' },
      slot: '1234567893', // Replace with your AdSense slot ID
    }
  };

  const config = adConfig[type];
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const dimensions = isMobile ? config.mobile : config.desktop;

  useEffect(() => {
    // Load AdSense ads after component mounts
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div 
      className={cn(
        "ad-slot mx-auto overflow-hidden rounded-lg",
        `${dimensions.class}`,
        className
      )}
      id={id}
    >
      {/* Google AdSense Ad Unit */}
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your AdSense publisher ID
        data-ad-slot={config.slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      
      {/* Fallback placeholder - only shows if AdSense doesn't load */}
      <noscript>
        <div className="w-full h-full bg-muted/30 border border-dashed border-muted-foreground/20 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Advertisement</p>
        </div>
      </noscript>
    </div>
  );
};

// TypeScript declaration for AdSense
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
