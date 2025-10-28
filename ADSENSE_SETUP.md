# Google AdSense Integration Guide

## Overview
Your app is now set up to display Google AdSense ads including banner ads, video ads, and display ads optimized for both mobile and desktop.

## Setup Steps

### 1. Sign Up for Google AdSense
1. Go to [https://www.google.com/adsense](https://www.google.com/adsense)
2. Sign in with your Google account
3. Fill out the application form with your website details
4. Wait for approval (can take 1-3 days)

### 2. Get Your Publisher ID
Once approved:
1. Log in to your AdSense account
2. Go to **Account** → **Settings** → **Account information**
3. Copy your **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)

### 3. Update Your Code

#### A. Update index.html
Replace `ca-pub-XXXXXXXXXXXXXXXX` in `index.html` line 12 with your actual Publisher ID:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ACTUAL_ID"
 crossorigin="anonymous"></script>
```

#### B. Create Ad Units in AdSense Dashboard
1. Go to **Ads** → **By ad unit** → **Display ads**
2. Create the following ad units:

   - **Banner Ad**: 728×90 (Leaderboard)
   - **Square Ad**: 300×250 (Medium Rectangle)  
   - **Video Ad**: 300×250 (Medium Rectangle with video enabled)
   - **Skyscraper Ad**: 160×600 (Wide Skyscraper)

3. For each ad unit, copy the **Ad Slot ID** (format: `1234567890`)

#### C. Update AdSlot.tsx
Replace the slot IDs in `src/components/AdSlot.tsx` (lines 17, 22, 27, 32):
```typescript
const adConfig = {
  banner: {
    desktop: { width: 728, height: 90, class: 'h-[90px] w-full max-w-[728px]' },
    mobile: { width: 320, height: 50, class: 'h-[50px] w-full max-w-[320px]' },
    slot: 'YOUR_BANNER_SLOT_ID', // Replace
  },
  video: {
    desktop: { width: 300, height: 250, class: 'h-[250px] w-full max-w-[300px]' },
    mobile: { width: 300, height: 250, class: 'h-[250px] w-full max-w-[300px]' },
    slot: 'YOUR_VIDEO_SLOT_ID', // Replace
  },
  square: {
    desktop: { width: 300, height: 250, class: 'h-[250px] w-full max-w-[300px]' },
    mobile: { width: 300, height: 250, class: 'h-[250px] w-full max-w-[300px]' },
    slot: 'YOUR_SQUARE_SLOT_ID', // Replace
  },
  skyscraper: {
    desktop: { width: 160, height: 600, class: 'h-[600px] w-[160px]' },
    mobile: { width: 160, height: 600, class: 'hidden' },
    slot: 'YOUR_SKYSCRAPER_SLOT_ID', // Replace
  }
};
```

Also update line 65 with your Publisher ID:
```typescript
data-ad-client="ca-pub-YOUR_ACTUAL_ID"
```

### 4. Ad Placement Locations

Your app has ads placed strategically:

**Desktop Layout:**
- Top banner (728×90)
- Left sidebar skyscraper (160×600)
- Middle square ad (300×250)
- Right sidebar: 2 square ads + 1 video ad
- Post-results video ad (300×250)
- Bottom banner (728×90)

**Mobile Layout:**
- Top banner (320×50)
- Middle square ad (300×250)
- Post-results video ad (300×250)
- Bottom banner (320×50)

### 5. Testing

⚠️ **Important**: Do NOT click on your own ads during testing - this violates AdSense policy!

To test:
1. Publish your app
2. View it in an incognito/private browsing window
3. Verify ads appear correctly
4. Check mobile responsiveness

### 6. Monetization Tips

1. **Ad Placement**: Ads are already optimized for viewability
2. **Video Ads**: Enable video ads in your AdSense settings for higher RPM
3. **Auto Ads**: Consider enabling Auto Ads in AdSense for automatic optimization
4. **Traffic**: Focus on getting quality traffic - more users = more revenue

### 7. Alternative Ad Networks

If you want to use other ad networks instead of or alongside AdSense:

- **Media.net**: Good for content sites
- **PropellerAds**: Good for international traffic
- **AdThrive**: Premium network (requires 100k+ monthly pageviews)
- **Ezoic**: AI-powered ad testing and optimization

## Troubleshooting

**Ads not showing?**
- Verify your Publisher ID is correct
- Check browser console for errors
- Ensure AdSense account is fully approved
- Wait 24-48 hours after adding the code

**Blank ad spaces?**
- AdSense may not have enough ad inventory for your niche
- Enable "Auto ads" as a fallback
- Consider using multiple ad networks

## Revenue Expectations

Typical earnings vary widely:
- RPM (Revenue per 1000 views): $0.50 - $10
- Depends on: niche, traffic quality, geography, seasonality
- Video ads typically earn 2-3x more than display ads

## Support

For AdSense help:
- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Community](https://support.google.com/adsense/community)
