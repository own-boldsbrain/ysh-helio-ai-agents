# Performance Optimization Guide

## Bundle Analysis

To analyze bundle sizes:

```bash
# Install bundle analyzer
pnpm add -D webpack-bundle-analyzer

# Run analysis
ANALYZE=true pnpm --filter @repo/web build

# View reports
open apps/web/.next/analyze/client.html
open apps/web/.next/analyze/server.html
```

## Performance Best Practices

### 1. Code Splitting

- Use dynamic imports for heavy components
- Lazy load routes and modals
- Split vendor bundles effectively

### 2. Image Optimization

- Use Next.js Image component
- Enable AVIF/WebP formats
- Implement lazy loading

### 3. Font Optimization

- Use next/font for automatic font optimization
- Subset fonts to required characters
- Preload critical fonts

### 4. Tree Shaking

- Import only what you need from libraries
- Use named imports instead of default imports
- Configure webpack to eliminate dead code

### 5. Caching Strategy

- Implement proper cache headers
- Use React Query for server state
- Enable SWC minification

### 6. Bundle Size Targets

- First Load JS: < 200 KB (gzipped)
- Total Bundle: < 500 KB (gzipped)
- Individual chunks: < 50 KB (gzipped)

## Monitoring

### Core Web Vitals Targets

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### Tools

- Lighthouse CI
- Web Vitals library
- Vercel Analytics
- @vercel/analytics (already integrated)

## Optimization Checklist

- [ ] Enable SWC minification
- [ ] Configure tree shaking
- [ ] Implement code splitting
- [ ] Optimize images with next/image
- [ ] Use font optimization
- [ ] Enable gzip/brotli compression
- [ ] Implement proper caching
- [ ] Minimize third-party scripts
- [ ] Use React.memo for expensive components
- [ ] Implement virtual scrolling for long lists
- [ ] Lazy load off-screen components
- [ ] Optimize CSS (remove unused styles)
- [ ] Use CSS modules or Tailwind JIT
- [ ] Minimize JavaScript execution time
- [ ] Reduce main thread blocking
