# Custom Ad Management System

## Overview
Your app now has a custom ad management system with backend database storage. You can upload your own banner images and video ads.

## Database Structure

### `ads` Table
Stores all your custom advertisements with the following fields:

- `id`: Unique identifier (auto-generated)
- `title`: Name/description of the ad
- `type`: Ad format (`banner`, `video`, `square`, `skyscraper`)
- `media_url`: URL of the image or video file
- `click_url`: Optional URL where users go when clicking the ad
- `placement`: Specific location on the page
- `is_active`: Whether the ad is currently displayed
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Ad Placements

Your app has 8 ad slots:

### Desktop + Mobile
1. **top-banner**: Top of page (728×90 desktop / 320×50 mobile)
2. **bottom-banner**: Bottom of page (728×90 desktop / 320×50 mobile)
3. **middle-square**: Middle of content (300×250)
4. **post-results-video**: After analysis results (300×250)

### Desktop Only
5. **left-skyscraper**: Left sidebar (160×600)
6. **right-square-1**: Right sidebar top (300×250)
7. **right-video**: Right sidebar middle (300×250)
8. **right-square-2**: Right sidebar bottom (300×250)

## How to Add Ads

### Option 1: Using Lovable Cloud Database UI

1. Open your Lovable project
2. Click on "Database" in the tools panel
3. Find the `ads` table
4. Click "Insert Row" or "Add New"
5. Fill in the fields:
   ```
   title: "My Banner Ad"
   type: "banner"
   media_url: "https://your-image-url.com/banner.jpg"
   click_url: "https://example.com"
   placement: "top-banner"
   is_active: true
   ```
6. Save

### Option 2: Using SQL

Run this in your database:

```sql
INSERT INTO public.ads (title, type, media_url, click_url, placement, is_active)
VALUES (
  'Top Banner Ad',
  'banner',
  'https://example.com/banner.jpg',
  'https://example.com',
  'top-banner',
  true
);
```

### Option 3: Upload Images First

If you want to upload images to your own storage:

1. Use Supabase Storage (recommended)
2. Upload image/video to a public bucket
3. Copy the public URL
4. Use that URL as `media_url`

## Ad Specifications

### Banner Ads
- **Desktop**: 728 × 90 pixels
- **Mobile**: 320 × 50 pixels
- **Format**: JPG, PNG, GIF
- **File Size**: Under 150KB recommended

### Square Ads
- **Size**: 300 × 250 pixels
- **Format**: JPG, PNG, GIF
- **File Size**: Under 150KB recommended

### Video Ads
- **Size**: 300 × 250 pixels
- **Format**: MP4, WebM
- **Duration**: 15-30 seconds recommended
- **File Size**: Under 5MB recommended

### Skyscraper Ads
- **Size**: 160 × 600 pixels
- **Format**: JPG, PNG, GIF
- **File Size**: Under 150KB recommended

## Managing Ads

### Activate/Deactivate an Ad
Set `is_active` to `true` or `false`:

```sql
UPDATE public.ads
SET is_active = false
WHERE id = 'your-ad-id';
```

### Update an Ad
```sql
UPDATE public.ads
SET media_url = 'https://new-image-url.com/banner.jpg',
    click_url = 'https://new-destination.com'
WHERE id = 'your-ad-id';
```

### Delete an Ad
```sql
DELETE FROM public.ads
WHERE id = 'your-ad-id';
```

## Example: Adding All Ads

```sql
-- Top banner
INSERT INTO public.ads (title, type, media_url, click_url, placement, is_active)
VALUES ('Top Banner', 'banner', 'https://example.com/top-banner.jpg', 'https://example.com', 'top-banner', true);

-- Bottom banner
INSERT INTO public.ads (title, type, media_url, click_url, placement, is_active)
VALUES ('Bottom Banner', 'banner', 'https://example.com/bottom-banner.jpg', 'https://example.com', 'bottom-banner', true);

-- Left skyscraper
INSERT INTO public.ads (title, type, media_url, click_url, placement, is_active)
VALUES ('Left Skyscraper', 'skyscraper', 'https://example.com/skyscraper.jpg', 'https://example.com', 'left-skyscraper', true);

-- Middle square
INSERT INTO public.ads (title, type, media_url, click_url, placement, is_active)
VALUES ('Middle Square', 'square', 'https://example.com/square.jpg', 'https://example.com', 'middle-square', true);

-- Right square 1
INSERT INTO public.ads (title, type, media_url, click_url, placement, is_active)
VALUES ('Right Square 1', 'square', 'https://example.com/right1.jpg', 'https://example.com', 'right-square-1', true);

-- Right video
INSERT INTO public.ads (title, type, media_url, click_url, placement, is_active)
VALUES ('Right Video', 'video', 'https://example.com/video.mp4', 'https://example.com', 'right-video', true);

-- Right square 2
INSERT INTO public.ads (title, type, media_url, click_url, placement, is_active)
VALUES ('Right Square 2', 'square', 'https://example.com/right2.jpg', 'https://example.com', 'right-square-2', true);

-- Post results video
INSERT INTO public.ads (title, type, media_url, click_url, placement, is_active)
VALUES ('Post Results Video', 'video', 'https://example.com/post-video.mp4', 'https://example.com', 'post-results-video', true);
```

## Features

✅ **Automatic Display**: Ads automatically show when you add them to the database
✅ **Click Tracking**: Users can click ads to visit the target URL
✅ **Responsive**: Different sizes for mobile/desktop
✅ **Video Support**: Auto-play muted video ads
✅ **Easy Management**: Enable/disable ads instantly
✅ **Multiple Placements**: 8 strategic ad positions

## Tips

1. **Test Before Live**: Set `is_active = false` initially, then enable when ready
2. **Optimize Images**: Compress images before uploading for faster loading
3. **Video Ads**: Keep videos short (15-30 sec) and under 5MB
4. **Track Performance**: Monitor which placements work best
5. **A/B Testing**: Try different creatives in the same placement

## Need Help?

- View your ads in the Database panel
- Check the `ads` table for all entries
- Use the query builder for easy management
