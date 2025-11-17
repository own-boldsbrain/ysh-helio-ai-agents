'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useConnectors } from '@/components/connectors-provider'
import { CheckCircle2, XCircle } from 'lucide-react'

interface ConnectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  connectorType: string
}

export function ConnectorDialog({ open, onOpenChange, connectorType }: ConnectorDialogProps) {
  const { connectors, connectConnector, disconnectConnector } = useConnectors()

  const connector = connectors.find((c) => c.type === connectorType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage {connectorType} Connection</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {connector ? (
            <div className="flex items-center gap-2">
              {connector.connected ? (
                <>
                  <CheckCircle2 className="text-green-500" />
                  <span>Connected to {connectorType}</span>
                </>
              ) : (
                <>
                  <XCircle className="text-red-500" />
                  <span>Not connected to {connectorType}</span>
                </>
              )}
            </div>
          ) : (
            <p>Connector not found</p>
          )}
        </div>

        <DialogFooter>
          {connector?.connected ? (
            <Button variant="outline" onClick={() => disconnectConnector(connectorType)}>
              Disconnect
            </Button>
          ) : (
            <Button onClick={() => connectConnector(connectorType)}>Connect</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
