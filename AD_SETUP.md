# Custom Ad Management System

## Overview
Your app has a custom ad management system where you can upload banner ads, video ads, and manage them through a simple admin interface.

## Ad Placements

### Desktop Layout
- **Top Banner**: 728×90 pixels
- **Left Skyscraper**: 160×600 pixels  
- **Middle Square**: 300×250 pixels
- **Right Sidebar**:
  - Square Ad 1: 300×250 pixels
  - Video Ad: 300×250 pixels
  - Square Ad 2: 300×250 pixels
- **Post-Results Video**: 300×250 pixels
- **Bottom Banner**: 728×90 pixels

### Mobile Layout
- **Top Banner**: 320×50 pixels
- **Middle Square**: 300×250 pixels
- **Post-Results Video**: 300×250 pixels
- **Bottom Banner**: 320×50 pixels

## How to Add Ads

### 1. Access Ad Manager
Navigate to: `/ad-manager` in your app (you must be signed in)

### 2. Upload Your Media
You have two options:

**Option A: Use External URLs**
- Upload your images/videos to any hosting service (Imgur, Cloudinary, AWS S3, etc.)
- Copy the direct URL to the media file
- Paste it in the "Media URL" field

**Option B: Use Lovable Cloud Storage** (Recommended)
Coming soon - will allow direct uploads

### 3. Create an Ad

Click "Add New Ad" and fill in:

1. **Ad Title**: Internal name for your ad (e.g., "Nike Banner - Summer Sale")

2. **Ad Type**: Choose from:
   - Banner (728×90 or 320×50)
   - Video (300×250)
   - Square (300×250)
   - Skyscraper (160×600)

3. **Placement**: Where the ad appears:
   - Top Banner
   - Bottom Banner
   - Left Skyscraper (desktop only)
   - Middle Square
   - Right Square 1
   - Right Square 2
   - Right Video
   - Post Results Video

4. **Media URL**: 
   - For images: `.jpg`, `.png`, `.gif`, `.webp`
   - For videos: `.mp4`, `.webm`, `.ogg`
   - Example: `https://example.com/banner.jpg`

5. **Click URL** (Optional):
   - Where users go when they click the ad
   - Example: `https://yoursite.com/promo`

6. Click "Create Ad"

### 4. Manage Ads

From the Ad Manager page you can:
- **Toggle Active/Inactive**: Turn ads on or off without deleting
- **Delete Ads**: Remove ads permanently
- **View All Ads**: See all your active and inactive ads

## Ad Formats & Specifications

### Banner Ads
- **Desktop**: 728×90 pixels
- **Mobile**: 320×50 pixels
- **Format**: JPG, PNG, GIF, WebP
- **File Size**: < 150KB recommended

### Square Ads
- **Size**: 300×250 pixels
- **Format**: JPG, PNG, GIF, WebP
- **File Size**: < 150KB recommended

### Video Ads
- **Size**: 300×250 pixels
- **Format**: MP4, WebM, OGG
- **Duration**: 15-30 seconds recommended
- **File Size**: < 5MB recommended
- **Note**: Videos autoplay muted and loop

### Skyscraper Ads
- **Size**: 160×600 pixels
- **Format**: JPG, PNG, GIF, WebP
- **File Size**: < 200KB recommended
- **Display**: Desktop only

## Tips for Best Performance

1. **Optimize Images**: Compress images before uploading
2. **Use WebP**: Better compression than JPG/PNG
3. **Video Optimization**: Keep videos short and compressed
4. **Responsive Design**: Ads automatically adapt to screen size
5. **Click Tracking**: Use URL parameters to track ad performance
   - Example: `https://yoursite.com/promo?source=banner-ad-1`

## Database Structure

Your ads are stored in the `ads` table with:
- `title`: Ad name
- `type`: banner, video, square, or skyscraper
- `media_url`: URL to your media file
- `click_url`: Where ad clicks go (optional)
- `placement`: Where ad appears on page
- `is_active`: Whether ad is currently shown
- `created_at`: When ad was created
- `updated_at`: Last update time

## Security

- Only authenticated users can create/manage ads
- Anyone can view active ads
- Row Level Security (RLS) is enabled

## Troubleshooting

**Ad not showing?**
- Check that `is_active` is ON
- Verify the media URL is publicly accessible
- Check browser console for errors
- Ensure placement matches available slots

**Video not playing?**
- Verify video format is MP4, WebM, or OGG
- Check file size (keep under 5MB)
- Ensure URL is direct link to video file

**Ad looks wrong on mobile?**
- Check that image dimensions match recommended sizes
- Test on actual mobile device, not just browser resize
