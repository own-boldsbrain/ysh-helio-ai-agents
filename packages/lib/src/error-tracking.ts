/**
 * Error tracking integration for Sentry or similar services
 * Provides centralized error reporting and monitoring
 */

export interface ErrorContext {
  userId?: string
  taskId?: string
  action?: string
  metadata?: Record<string, unknown>
}

export interface ErrorReport {
  message: string
  level: 'fatal' | 'error' | 'warning' | 'info'
  context?: ErrorContext
  error?: Error
  timestamp: string
}

class ErrorTracker {
  private isInitialized = false
  private queue: ErrorReport[] = []

  initialize(dsn?: string, environment?: string) {
    if (this.isInitialized) return

    // Only initialize in production or if explicitly configured
    if (!dsn || !environment) {
      console.error('Error tracking not configured - using console logging only')
      this.isInitialized = true
      return
    }

    // Initialize with your preferred error tracking service
    // Example: Sentry
    // Sentry.init({
    //   dsn,
    //   environment,
    //   tracesSampleRate: 1.0,
    // })

    this.isInitialized = true

    // Flush queued errors
    this.flushQueue()
  }

  captureError(error: Error, level: ErrorReport['level'] = 'error', context?: ErrorContext): void {
    const report: ErrorReport = {
      message: error.message,
      level,
      context,
      error,
      timestamp: new Date().toISOString(),
    }

    if (!this.isInitialized) {
      this.queue.push(report)
      return
    }

    this.reportError(report)
  }

  captureMessage(message: string, level: ErrorReport['level'] = 'info', context?: ErrorContext): void {
    const report: ErrorReport = {
      message,
      level,
      context,
      timestamp: new Date().toISOString(),
    }

    if (!this.isInitialized) {
      this.queue.push(report)
      return
    }

    this.reportError(report)
  }

  private reportError(report: ErrorReport): void {
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      const logLevel = report.level === 'fatal' ? 'error' : report.level
      console[logLevel as 'error' | 'warn' | 'info']('Error Report:', report)
      return
    }

    // Send to error tracking service in production
    // Example: Sentry.captureException(report.error, { level: report.level, extra: report.context })

    // Fallback: log to stderr
    console.error('Error Report:', report)
  }

  private flushQueue(): void {
    while (this.queue.length > 0) {
      const report = this.queue.shift()
      if (report) {
        this.reportError(report)
      }
    }
  }

  isReady(): boolean {
    return this.isInitialized
  }
}

export const errorTracker = new ErrorTracker()

// Initialize on module load
if (typeof globalThis !== 'undefined') {
  // Check if we're in Node.js (not browser)
  const isNode =
    typeof process !== 'undefined' &&
    process.versions &&
    typeof (process.versions as Record<string, unknown>).node !== 'undefined'
  if (isNode) {
    errorTracker.initialize(process.env.ERROR_TRACKING_DSN, process.env.NODE_ENV)
  }
}
