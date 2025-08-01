# Image Lazy Loading Implementation Guide

## Overview

This document describes the image lazy loading implementation in the YesLocker UniApp project. The implementation improves performance by loading images only when they enter the viewport, reducing initial page load time and bandwidth usage.

## Architecture

### Core Components

1. **LazyImage Component** (`/src/components/atoms/LazyImage.vue`)
   - Drop-in replacement for UniApp's `<image>` component
   - Supports all standard image props plus lazy loading options
   - Cross-platform compatible (H5 and WeChat Mini Program)

2. **Lazy Load Utility** (`/src/utils/lazyload.js`)
   - Core lazy loading logic with IntersectionObserver support
   - Platform-specific implementations for H5 and Mini Program
   - Configurable thresholds and loading states

3. **Placeholder Images**
   - `/static/image-loading.svg` - Animated loading placeholder
   - `/static/image-error.svg` - Error state placeholder

## Usage

### Basic Usage

Replace standard `<image>` components with `<lazy-image>`:

```vue
<!-- Before -->
<image 
  src="/path/to/image.jpg" 
  mode="aspectFill"
  class="my-image"
/>

<!-- After -->
<lazy-image 
  src="/path/to/image.jpg" 
  mode="aspectFill"
  custom-class="my-image"
/>
```

### Advanced Options

```vue
<lazy-image 
  :src="imageUrl"
  mode="aspectFill"
  custom-class="product-image"
  :width="200"
  :height="200"
  :threshold="0.1"
  :root-margin="50px"
  :show-loading="true"
  :show-error="true"
  :force-load="false"
  placeholder="/custom/loading.png"
  error-image="/custom/error.png"
  @load="handleLoad"
  @error="handleError"
  @click="handleClick"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | String | required | Image source URL |
| placeholder | String | `/static/image-loading.svg` | Loading placeholder |
| errorImage | String | `/static/image-error.svg` | Error placeholder |
| mode | String | `aspectFill` | UniApp image mode |
| customClass | String | `''` | CSS class names |
| width | Number/String | `100%` | Image width |
| height | Number/String | `auto` | Image height |
| showLoading | Boolean | `true` | Show loading indicator |
| showError | Boolean | `true` | Show error state |
| forceLoad | Boolean | `false` | Skip lazy loading |
| threshold | Number | `0.1` | Visibility threshold (0-1) |
| rootMargin | String | `50px` | Pre-load margin |

## Implementation Details

### Platform Detection

The utility automatically detects the platform and uses the appropriate observer:

- **H5**: Uses native `IntersectionObserver` API
- **WeChat Mini Program**: Uses `uni.createIntersectionObserver`

### Performance Optimizations

1. **Automatic Observer Cleanup**: Observers are disconnected after image loads
2. **Single Load Protection**: Images are only loaded once
3. **Configurable Thresholds**: Control when images start loading
4. **Placeholder Support**: Lightweight SVG placeholders reduce initial payload

### Global Registration

The component is registered globally in `main.js`:

```javascript
import LazyImage from '@/components/atoms/LazyImage.vue'
Vue.component('lazy-image', LazyImage)
```

## Best Practices

1. **Use Appropriate Placeholders**: Keep placeholder images small (< 5KB)
2. **Set Dimensions**: Always specify width/height to prevent layout shifts
3. **Force Load Critical Images**: Use `force-load` for above-the-fold images
4. **Optimize Root Margin**: Adjust based on scroll behavior (50-200px recommended)

## Migration Guide

To migrate existing images to lazy loading:

1. Replace `<image>` with `<lazy-image>`
2. Change `class` to `custom-class`
3. Add width/height if not specified
4. Test loading behavior in different scenarios

## Troubleshooting

### Images Not Loading

1. Check if component is properly imported
2. Verify image URLs are correct
3. Check console for error messages
4. Ensure viewport intersection is occurring

### Performance Issues

1. Reduce root margin for less aggressive pre-loading
2. Use smaller placeholder images
3. Consider force-loading critical images

## Future Enhancements

1. Add blur-up effect for smoother transitions
2. Implement progressive image loading
3. Add network-aware loading strategies
4. Support for responsive images with srcset

## Related Files

- Component: `/src/components/atoms/LazyImage.vue`
- Utility: `/src/utils/lazyload.js`
- Placeholders: `/src/static/image-loading.svg`, `/src/static/image-error.svg`
- Global Registration: `/src/main.js`