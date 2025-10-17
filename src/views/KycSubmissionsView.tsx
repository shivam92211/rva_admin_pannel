import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Search, RefreshCw, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, AlertCircle, X, Eye } from 'lucide-react';
import { kycSubmissionApi, type KycSubmission, type PaginatedKycSubmissionsResponse } from '@/services/kycSubmissionApi';
import { KycDetailsDialog } from '@/components/KycDetailsDialog';
import RefreshButton from '@/components/common/RefreshButton';
import { cipherEmail, obfuscateName, obfuscateText } from '@/utils/security';
import TableHeader from '@/components/common/TableHeader';

const KycSubmissionsView: React.FC = () => {
  const [kycSubmissions, setKycSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // For the input field
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // KYC details dialog state
  const [selectedKycSubmission, setSelectedKycSubmission] = useState<KycSubmission | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1); // Reset to first page when searching
    }, 500); // 500ms delay

    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  const loadKycSubmissions = React.useCallback(async () => {
    setLoading(true);
    try {
      const response: PaginatedKycSubmissionsResponse = await kycSubmissionApi.getKycSubmissions({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter
      });

      setKycSubmissions(response.kycSubmissions);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.totalCount);
    } catch (error: any) {
      console.error('Failed to load KYC submissions:', error);
      setKycSubmissions([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter]);

  useEffect(() => {
    loadKycSubmissions();
  }, [loadKycSubmissions]);

  const handleSearch = (value: string) => {
    setSearchInput(value); // Update input immediately for responsive UI
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchInput !== '' || statusFilter !== 'all';

  const handleUpdateStatus = async (submissionId: string, newStatus: string, rejectionReason?: string) => {
    try {
      setLoading(true);
      const result = await kycSubmissionApi.updateKycSubmissionStatus(submissionId, {
        status: newStatus,
        reviewedBy: 'admin',
        rejectionReason: newStatus === 'REJECTED' ? rejectionReason : undefined
      });

      // Update the submission in the local state
      setKycSubmissions(prevSubmissions =>
        prevSubmissions.map(submission =>
          submission.id === submissionId
            ? { ...submission, status: result.status, reviewedAt: new Date().toISOString(), reviewedBy: 'admin' }
            : submission
        )
      );

      // Optionally show a success message or toast
      console.log(result.message);
    } catch (error: any) {
      console.error('Failed to update KYC submission status:', error);
      // Optionally show error message
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleKycRowClick = async (kycSubmission: KycSubmission) => {
    try {
      setDialogOpen(true);

      // Fetch detailed KYC data
      const detailedKycSubmission = await kycSubmissionApi.getKycSubmissionById(kycSubmission.id);
      setSelectedKycSubmission(detailedKycSubmission);
    } catch (error: any) {
      console.error('Failed to load KYC submission details:', error);
      // Show basic KYC data if detailed fetch fails
      setSelectedKycSubmission(kycSubmission);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      PROCESSING: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  const getLevelBadge = (level: number) => {
    const levelColors = {
      1: 'bg-gray-100 text-gray-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelColors[level as keyof typeof levelColors] || levelColors[1]}`}>
        Level {level}
      </span>
    );
  };

  const getActionButtons = (submission: KycSubmission) => {
    if (submission.status === 'PENDING' || submission.status === 'PROCESSING') {
      return (
        <>
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
        </>
      );
    }

    return (
      <span className="text-sm text-gray-400">
        {submission.reviewedAt ? `Reviewed ${formatDate(submission.reviewedAt)}` : 'No actions available'}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="KYC Submissions"
        description="Manage and review KYC submission requests. Sensitive data is hidden for privacy - click on any row to view full details."
      >
        <div className="flex gap-2">
          <RefreshButton onClick={loadKycSubmissions} />
        </div>
      </PageHeader>

      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-gray-800 rounded-lg p-6 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-6 flex-shrink-0">
            <div className="relative flex-1 max-w-sm">
              {loading && searchTerm ? (
                <RefreshCw className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              )}
              <Input
                placeholder="Search by name, email, ID number..."
                value={searchInput}
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
            <Button
              variant="outline"
              // size="sm"
              onClick={clearAllFilters}
              disabled={!hasActiveFilters}
              className="flex items-center gap-2 shrink-0"
              title="Clear all filters"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
            <div className="text-sm text-gray-400">
              {total} submission{total !== 1 ? 's' : ''} found
            </div>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
                <span className="ml-2 text-gray-400">Loading KYC submissions...</span>
              </div>
            ) : kycSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No KYC submissions found</p>
              </div>
            ) : (
              <div className="h-full overflow-auto rounded-lg border border-gray-700/50">

                <table className="w-full">
                  <TableHeader headers={[
                    'User',
                    'Level',
                    'Status',
                    'Personal Info',
                    'Country',
                    'ID Type',
                    'Submitted',
                    'Actions'
                  ]} />

                  <tbody>
                    {kycSubmissions.map((submission) => (
                      <tr key={submission.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{submission.user.username}</span>
                            <span className="text-sm text-gray-400">{cipherEmail(submission.user.email)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getLevelBadge(submission.level)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(submission.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-300">{obfuscateName(`${submission.firstName} ${submission.lastName}`)}</span>
                            <span className="text-sm text-gray-400">{obfuscateText(submission.idNumber)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {obfuscateText(submission.nationality)}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {submission.idType.toUpperCase()}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {formatDate(submission.submittedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleKycRowClick(submission)}
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {getActionButtons(submission)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4 flex-shrink-0">
              <div className="text-sm text-gray-400">
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
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, pages) => {
                    // Add ellipsis if there's a gap
                    const showEllipsis = index > 0 && page - pages[index - 1] > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-3 py-1 text-sm text-gray-400">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    );
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
  );
};

export default KycSubmissionsView;