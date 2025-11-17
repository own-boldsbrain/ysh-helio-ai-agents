/**
 * Graceful shutdown handler for Node.js applications
 * Ensures all connections are closed properly before process exit
 */

const shutdownSignals = ['SIGTERM', 'SIGINT']
let isShuttingDown = false

export function setupGracefulShutdown() {
  shutdownSignals.forEach((signal) => {
    process.on(signal, async () => {
      if (isShuttingDown) return

      isShuttingDown = true
      console.error(`Received ${signal}, starting graceful shutdown`)

      // Set timeout for hard shutdown (30 seconds)
      const hardShutdownTimeout = setTimeout(() => {
        console.error('Graceful shutdown timeout - forcing exit')
        process.exit(1)
      }, 30000)

      try {
        // Close server and database connections
        console.error('Closing server connections')
        // Add your custom cleanup here
        // e.g., await db.close()
        // e.g., await server.close()

        clearTimeout(hardShutdownTimeout)
        console.error('Graceful shutdown completed')
        process.exit(0)
      } catch (error) {
        console.error('Error during graceful shutdown:', error)
        process.exit(1)
      }
    })
  })

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
    process.exit(1)
  })

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    process.exit(1)
  })
}

export function isGracefulShutdownActive(): boolean {
  return isShuttingDown
}
