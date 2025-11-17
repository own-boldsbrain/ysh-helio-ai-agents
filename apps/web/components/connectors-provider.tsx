'use client'

import { createContext, useContext, ReactNode } from 'react'

interface Connector {
  type: string
  connected: boolean
  name: string
  description: string
}

interface ConnectorsContextType {
  connectors: Connector[]
  connectConnector: (type: string) => void
  disconnectConnector: (type: string) => void
  isConnected: (type: string) => boolean
}

const ConnectorsContext = createContext<ConnectorsContextType | undefined>(undefined)

export function ConnectorsProvider({ children }: { children: ReactNode }) {
  // Mock implementation - in real app this would manage actual connector states
  const connectors: Connector[] = [
    {
      type: 'github',
      connected: true,
      name: 'GitHub',
      description: 'Connect your GitHub account',
    },
    {
      type: 'vercel',
      connected: false,
      name: 'Vercel',
      description: 'Connect your Vercel account',
    },
  ]

  const connectConnector = (type: string) => {
    console.log(`Connecting to ${type}`)
  }

  const disconnectConnector = (type: string) => {
    console.log(`Disconnecting from ${type}`)
  }

  const isConnected = (type: string) => {
    return connectors.some((c) => c.type === type && c.connected)
  }

  return (
    <ConnectorsContext.Provider
      value={{
        connectors,
        connectConnector,
        disconnectConnector,
        isConnected,
      }}
    >
      {children}
    </ConnectorsContext.Provider>
  )
}

export function useConnectors() {
  const context = useContext(ConnectorsContext)
  if (!context) {
    throw new Error('useConnectors must be used within a ConnectorsProvider')
  }
  return context
}
