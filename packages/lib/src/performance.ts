// Performance monitoring utilities
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()
  private measures: Map<string, number> = new Map()

  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  measure(name: string, start: string, end: string): number {
    const startTime = this.marks.get(start)
    const endTime = this.marks.get(end)

    if (startTime === undefined || endTime === undefined) {
      throw new Error(`Marks ${start} or ${end} not found`)
    }

    const duration = endTime - startTime
    this.measures.set(name, duration)
    return duration
  }

  getMeasure(name: string): number | undefined {
    return this.measures.get(name)
  }

  getAllMeasures(): Map<string, number> {
    return new Map(this.measures)
  }

  clear(): void {
    this.marks.clear()
    this.measures.clear()
  }
}

// Performance monitoring singleton
export const perfMonitor = new PerformanceMonitor()

// Performance observer for long tasks
export function setupLongTaskObserver(): void {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Log long tasks (>50ms) which may impact user experience
        if (entry.duration > 50) {
          console.warn('Long task detected:', {
            name: entry.name,
            duration: entry.duration,
            entryType: entry.entryType,
          })
        }
      })
    })

    observer.observe({ entryTypes: ['longtask' as const] })
  }
}

// Web vitals monitoring
export async function reportWebVitals(): Promise<void> {
  try {
    const webVitals = (await import('web-vitals')) as any

    if (webVitals.getCLS) {
      webVitals.getCLS((metric: any) => console.log('CLS:', metric))
    }
    if (webVitals.getFID) {
      webVitals.getFID((metric: any) => console.log('FID:', metric))
    }
    if (webVitals.getFCP) {
      webVitals.getFCP((metric: any) => console.log('FCP:', metric))
    }
    if (webVitals.getLCP) {
      webVitals.getLCP((metric: any) => console.log('LCP:', metric))
    }
    if (webVitals.getTTFB) {
      webVitals.getTTFB((metric: any) => console.log('TTFB:', metric))
    }
  } catch (error) {
    console.warn('Web vitals not available:', error)
  }
}
