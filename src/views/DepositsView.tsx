import React from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Wallet, Download } from 'lucide-react'

const DepositsView: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Deposits" 
        description="Monitor deposit activities and transactions"
      >
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </PageHeader>
      <div className="flex-1 p-6">
        <div className="bg-card rounded-lg p-6">
          <div className="flex items-center justify-center flex-col space-y-4">
            <Wallet className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Deposit monitoring coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepositsView