import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, RefreshCw, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { kycSubmissionApi, type KycSubmission, type PaginatedKycSubmissionsResponse } from '@/services/kycSubmissionApi'
import { KycDetailsDialog } from '@/components/KycDetailsDialog'
import RefreshButton from '@/components/common/RefreshButton';

const KycSubmissionsView: React.FC = () => {
  const [kycSubmissions, setKycSubmissions] = useState<KycSubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  // KYC details dialog state
  const [selectedKycSubmission, setSelectedKycSubmission] = useState<KycSubmission | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadKycSubmissions = React.useCallback(async () => {
    setLoading(true)
    try {
      const response: PaginatedKycSubmissionsResponse = await kycSubmissionApi.getKycSubmissions({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        level: levelFilter === 'all' ? undefined : levelFilter
      })

      setKycSubmissions(response.kycSubmissions)
      setTotalPages(response.pagination.totalPages)
      setTotal(response.pagination.totalCount)
    } catch (error: any) {
      console.error('Failed to load KYC submissions:', error)
      setKycSubmissions([])
      setTotalPages(1)
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, levelFilter])

  useEffect(() => {
    loadKycSubmissions()
  }, [loadKycSubmissions])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleLevelFilter = (value: string) => {
    setLevelFilter(value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleUpdateStatus = async (submissionId: string, newStatus: string, rejectionReason?: string) => {
    try {
      setLoading(true)
      const result = await kycSubmissionApi.updateKycSubmissionStatus(submissionId, {
        status: newStatus,
        reviewedBy: 'admin',
        rejectionReason: newStatus === 'REJECTED' ? rejectionReason : undefined
      })

      // Update the submission in the local state
      setKycSubmissions(prevSubmissions =>
        prevSubmissions.map(submission =>
          submission.id === submissionId
            ? { ...submission, status: result.status, reviewedAt: new Date().toISOString(), reviewedBy: 'admin' }
            : submission
        )
      )

      // Optionally show a success message or toast
      console.log(result.message)
    } catch (error: any) {
      console.error('Failed to update KYC submission status:', error)
      // Optionally show error message
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleKycRowClick = async (kycSubmission: KycSubmission) => {
    try {
      setDialogOpen(true)

      // Fetch detailed KYC data
      const detailedKycSubmission = await kycSubmissionApi.getKycSubmissionById(kycSubmission.id)
      setSelectedKycSubmission(detailedKycSubmission)
    } catch (error: any) {
      console.error('Failed to load KYC submission details:', error)
      // Show basic KYC data if detailed fetch fails
      setSelectedKycSubmission(kycSubmission)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      PROCESSING: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    )
  }

  const getLevelBadge = (level: number) => {
    const levelColors = {
      1: 'bg-gray-100 text-gray-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-purple-100 text-purple-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelColors[level as keyof typeof levelColors] || levelColors[1]}`}>
        Level {level}
      </span>
    )
  }

  const getActionButtons = (submission: KycSubmission) => {
    if (submission.status === 'PENDING' || submission.status === 'PROCESSING') {
      return (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateStatus(submission.id, 'APPROVED')}
            disabled={loading}
            className="hover:bg-green-50 hover:text-green-600 hover:border-green-200"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateStatus(submission.id, 'REJECTED', 'Manual review required')}
            disabled={loading}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      )
    }

    return (
      <span className="text-sm text-muted-foreground">
        {submission.reviewedAt ? `Reviewed ${formatDate(submission.reviewedAt)}` : 'No actions available'}
      </span>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="KYC Submissions"
        description="Manage and review KYC submission requests"
      >
        <div className="flex gap-2">
          <RefreshButton onClick={loadKycSubmissions} />
        </div>
      </PageHeader>

      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-card rounded-lg p-6 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-6 flex-shrink-0">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={levelFilter} onValueChange={handleLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Level</SelectItem>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {total} submission{total !== 1 ? 's' : ''} found
            </div>
          </div>

          <div className="flex-1 overflow-hidden rounded-md border">
            <div className="h-full overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>ID Type</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                        Loading KYC submissions...
                      </TableCell>
                    </TableRow>
                  ) : kycSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No KYC submissions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    kycSubmissions.map((submission) => (
                      <TableRow
                        key={submission.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleKycRowClick(submission)}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{submission.user.username}</span>
                            <span className="text-sm text-muted-foreground">{submission.user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getLevelBadge(submission.level)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(submission.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{submission.firstName} {submission.lastName}</span>
                            <span className="text-sm text-muted-foreground">{submission.idNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {submission.nationality}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {submission.idType.toUpperCase()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(submission.submittedAt)}
                        </TableCell>
                        <TableCell>
                          <div onClick={(e) => e.stopPropagation()}>
                            {getActionButtons(submission)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4 flex-shrink-0">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current
                    if (page === 1 || page === totalPages) return true
                    if (Math.abs(page - currentPage) <= 1) return true
                    return false
                  })
                  .map((page, index, pages) => {
                    // Add ellipsis if there's a gap
                    const showEllipsis = index > 0 && page - pages[index - 1] > 1

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-3 py-1 text-sm text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    )
                  })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KYC Details Dialog */}
      <KycDetailsDialog
        kycSubmission={selectedKycSubmission}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}

export default KycSubmissionsView