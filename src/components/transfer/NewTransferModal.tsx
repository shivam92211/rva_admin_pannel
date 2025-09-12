import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TransferForm } from './TransferForm'

interface NewTransferModalProps {
  open: boolean
  onClose: () => void
}

export const NewTransferModal: React.FC<NewTransferModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Transfer</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <TransferForm onSuccess={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  )
}