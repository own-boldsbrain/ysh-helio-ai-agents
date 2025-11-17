import { env } from './env'

interface LogContext {
  [key: string]: unknown
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class StructuredLogger {
  private level: LogLevel
  private isProduction: boolean

  constructor() {
    this.isProduction = env.NODE_ENV === 'production'
    this.level = this.parseLogLevel(process.env.LOG_LEVEL || 'info')
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug':
        return 'debug'
      case 'warn':
        return 'warn'
      case 'error':
        return 'error'
      default:
        return 'info'
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.level)
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) {
      return
    }

    const logObject = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
      environment: env.NODE_ENV,
    }

    if (this.isProduction) {
      // In production, output JSON
      console.log(JSON.stringify(logObject))
    } else {
      // In development, output formatted text for readability
      const formatted = `[${logObject.timestamp}] ${level.toUpperCase()}: ${message}`
      if (context && Object.keys(context).length > 0) {
        console.log(formatted, context)
      } else {
        console.log(formatted)
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context)
  }
}

// Create and export the singleton logger instance
export const logger = new StructuredLogger()
export type { LogContext, LogLevel }