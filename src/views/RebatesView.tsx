import React from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { TrendingUp, Download, Calendar } from 'lucide-react'

const RebatesView: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Rebates" 
        description="Track your broker rebates and commission earnings"
      >
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </PageHeader>
      <div className="flex-1 p-6">
        <div className="bg-card rounded-lg p-6">
          <div className="flex items-center justify-center flex-col space-y-4">
            <TrendingUp className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Rebate tracking coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RebatesView