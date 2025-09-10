import React from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { ArrowLeftRight, Plus } from 'lucide-react'

const TransfersView: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Transfers" 
        description="Manage fund transfers between accounts"
      >
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </PageHeader>
      <div className="flex-1 p-6">
        <div className="bg-card rounded-lg p-6">
          <div className="flex items-center justify-center flex-col space-y-4">
            <ArrowLeftRight className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Transfer management coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransfersView