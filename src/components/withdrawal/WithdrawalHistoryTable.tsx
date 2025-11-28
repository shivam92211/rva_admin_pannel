import React, { useState } from 'react';
import { useWithdrawalStore } from '@/store/withdrawal';
import { WithdrawalStatusBadge } from './WithdrawalStatusBadge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, RefreshCw, Eye, EyeOff, ExternalLink, Play, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import RefreshButton from '../common/RefreshButton';
import CopyButton from '../common/CopyButton';
import { cipherEmail, obfuscateText, maskString } from '@/utils/security';
import { DialogDescription } from '@radix-ui/react-dialog';
import TableHeader from '../common/TableHeader';
import { withdrawalApi } from '@/services/withdrawalApi';
import { useSnackbarMsg } from '@/hooks/snackbar';
import { ChainId, getSupportedChain } from '@/utils/chains';

export const WithdrawalHistoryTable: React.FC = () => {
  const {
    withdrawals,
    selectedWithdrawal,
    isLoading,
    fetchWithdrawals,
    fetchWithdrawalDetail,
    clearSelectedWithdrawal
  } = useWithdrawalStore();

  const [, setSnackbarMsg] = useSnackbarMsg();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Trigger withdrawal confirmation state
  const [triggerConfirmOpen, setTriggerConfirmOpen] = useState(false);
  const [selectedWithdrawalForTrigger, setSelectedWithdrawalForTrigger] = useState<typeof withdrawals[0] | null>(null);
  const [isTriggeringWithdrawal, setIsTriggeringWithdrawal] = useState(false);

  // Reject withdrawal confirmation state
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [selectedWithdrawalForReject, setSelectedWithdrawalForReject] = useState<typeof withdrawals[0] | null>(null);
  const [isRejectingWithdrawal, setIsRejectingWithdrawal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Display helper functions for GDPR compliance
  const displayEmail = (email: string | undefined | null) => {
    return showSensitiveData ? (email || 'N/A') : cipherEmail(email || undefined);
  };

  const displayAddress = (address: string | undefined | null) => {
    return showSensitiveData ? (address || 'N/A') : maskString(address || undefined, 6, 6);
  };

  const displayTxId = (txId: string | undefined | null) => {
    return showSensitiveData ? (txId || 'N/A') : maskString(txId || undefined, 6, 6);
  };

  const displayText = (text: string | undefined | null) => {
    return showSensitiveData ? (text || 'N/A') : obfuscateText(text || undefined);
  };

  // Check if withdrawal can be triggered (pending statuses)
  const canTriggerWithdrawal = (status: string) => {
    const upperStatus = status?.toUpperCase();
    return ['PENDING', 'PROCESSING', 'CONFIRMING'].includes(upperStatus);
  };

  // Check if withdrawal can be rejected (pending statuses)
  const canRejectWithdrawal = (status: string) => {
    const upperStatus = status?.toUpperCase();
    return ['PENDING', 'PROCESSING', 'CONFIRMING'].includes(upperStatus);
  };

  // Check if withdrawal is eligible for auto-approval (under $20)
  const isAutoApprovalEligible = (amount: string) => {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount < 20;
  };

  // Filter withdrawals based on search and filters
  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = searchTerm === '' ||
      withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.toAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (withdrawal.txHash && withdrawal.txHash.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (withdrawal.user?.email && withdrawal.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (withdrawal.user?.username && withdrawal.user.username.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    fetchWithdrawals();
  };

  const handleViewDetails = (id: string) => {
    fetchWithdrawalDetail(id);
  };

  const handleTriggerWithdrawalClick = (withdrawal: typeof withdrawals[0]) => {
    setSelectedWithdrawalForTrigger(withdrawal);
    setTriggerConfirmOpen(true);
  };

  const handleTriggerWithdrawal = async () => {
    if (!selectedWithdrawalForTrigger) return;

    try {
      setIsTriggeringWithdrawal(true);
      const result = await withdrawalApi.triggerWithdrawalForId(selectedWithdrawalForTrigger.id);

      setSnackbarMsg({
        msg: result.message || 'Withdrawal triggered successfully',
        type: 'success'
      });

      // Refresh the withdrawals data
      fetchWithdrawals();

    } catch (error: any) {
      console.error('Failed to trigger withdrawal:', error);
      setSnackbarMsg({
        msg: `Failed to trigger withdrawal: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsTriggeringWithdrawal(false);
      setTriggerConfirmOpen(false);
      setSelectedWithdrawalForTrigger(null);
    }
  };

  const handleRejectWithdrawalClick = (withdrawal: typeof withdrawals[0]) => {
    setSelectedWithdrawalForReject(withdrawal);
    setRejectionReason('');
    setRejectConfirmOpen(true);
  };

  const handleRejectWithdrawal = async () => {
    if (!selectedWithdrawalForReject) return;

    // Validate rejection reason
    if (!rejectionReason.trim()) {
      setSnackbarMsg({
        msg: 'Please provide a reason for rejecting this withdrawal',
        type: 'error'
      });
      return;
    }

    try {
      setIsRejectingWithdrawal(true);
      const result = await withdrawalApi.rejectWithdrawalForId(selectedWithdrawalForReject.id, rejectionReason.trim());

      setSnackbarMsg({
        msg: result.message || 'Withdrawal rejected successfully',
        type: 'success'
      });

      // Refresh the withdrawals data
      fetchWithdrawals();

    } catch (error: any) {
      console.error('Failed to reject withdrawal:', error);
      setSnackbarMsg({
        msg: `Failed to reject withdrawal: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsRejectingWithdrawal(false);
      setRejectConfirmOpen(false);
      setSelectedWithdrawalForReject(null);
      setRejectionReason('');
    }
  };

  const truncateId = (id: string) => {
    if (!id) return 'N/A';
    return `${id.slice(0, 8)}...${id.slice(-4)}`;
  };

  const truncateAddress = (address: string) => {
    if (!address) return 'N/A';
    if (address.length <= 20) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const getBlockExplorerUrl = (withdrawal: typeof withdrawals[0]) => {
    if (!withdrawal.txHash) return '#';
    const supportedChain = getSupportedChain(withdrawal.beneficiary?.chain as ChainId);
    if (!supportedChain) return '#';
    return supportedChain.hashExplorer.replace('<hash>', withdrawal.txHash);
  };

  const getAddressExplorerUrl = (withdrawal: typeof withdrawals[0]) => {
    if (!withdrawal.toAddress) return '#';
    const supportedChain = getSupportedChain(withdrawal.beneficiary?.chain as ChainId);
    if (!supportedChain) return '#';
    return supportedChain.addressExplorer.replace('<address>', withdrawal.toAddress);
  };

  if (isLoading && withdrawals.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-400">Loading withdrawal history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Withdrawal History</h2>
        <RefreshButton onClick={handleRefresh} />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by ID, address, hash, user email... (sensitive data hidden in table)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 text-sm text-gray-400">
        Showing {filteredWithdrawals.length} of {withdrawals.length} withdrawals
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
        {filteredWithdrawals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {withdrawals.length === 0
                ? 'No withdrawals found. Withdrawals will appear here when processed.'
                : 'No withdrawals match your current filters.'}
            </p>
          </div>
        ) : (
          <div className="h-full overflow-auto rounded-lg border border-gray-700/50">

            <table className="w-full">
              <TableHeader headers={[
                'Withdrawal ID',
                'User',
                'Amount',
                'Fee',
                'To Address',
                'Status',
                'Created',
                'Actions'
              ]} />


              <tbody>
                {filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm text-blue-300 bg-gray-700/50 px-2 py-1 rounded">
                          {truncateId(withdrawal.id)}
                        </code>
                        {/* {withdrawal.txHash && (
                          <a
                            href={getBlockExplorerUrl(withdrawal)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )} */}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="text-white font-medium">
                          {displayEmail(withdrawal.user?.email)}
                        </div>
                        {withdrawal.user?.username && (
                          <div className="text-xs text-gray-400">
                            @{displayText(withdrawal.user.username)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-mono text-red-300">
                          {withdrawal.amount && !isNaN(parseFloat(withdrawal.amount))
                            ? `-${parseFloat(withdrawal.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`
                            : 'N/A'}
                        </span>
                        {isAutoApprovalEligible(withdrawal.amount) &&
                          withdrawal.status.toUpperCase() === 'PENDING'
                          && (
                            <span className="text-xs text-green-400 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Set for auto-approval
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-300">
                        {withdrawal.fee && !isNaN(parseFloat(withdrawal.fee))
                          ? parseFloat(withdrawal.fee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })
                          : '0.00'}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <code className="text-xs text-gray-300">
                        {truncateAddress(withdrawal.toAddress)}
                      </code>
                      {withdrawal.toAddress && (
                        <a
                          href={getAddressExplorerUrl(withdrawal)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <WithdrawalStatusBadge status={withdrawal.status} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-400">
                        {format(new Date(withdrawal.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewDetails(withdrawal.id)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {canTriggerWithdrawal(withdrawal.status) && (
                          <Button
                            onClick={() => handleTriggerWithdrawalClick(withdrawal)}
                            variant="outline"
                            size="sm"
                            className="text-green-400 border-green-600 hover:bg-green-600 hover:text-white"
                            title="Trigger Withdrawal Instantly"
                            disabled={isTriggeringWithdrawal || isRejectingWithdrawal}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        {canRejectWithdrawal(withdrawal.status) && (
                          <Button
                            onClick={() => handleRejectWithdrawalClick(withdrawal)}
                            variant="outline"
                            size="sm"
                            className="text-red-400 border-red-600 hover:bg-red-600 hover:text-white"
                            title="Reject Withdrawal"
                            disabled={isTriggeringWithdrawal || isRejectingWithdrawal}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Detail Modal */}
      <Dialog open={!!selectedWithdrawal} onOpenChange={() => clearSelectedWithdrawal()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Withdrawal Details</DialogTitle>
            </div>

            <DialogDescription className=' flex justify-between align-text-bottom'>
              <div className="">
                {!showSensitiveData && (
                  <span className="block text-xs text-amber-600 mt-1">
                    🔒 Sensitive data is hidden for privacy. Click "Show Data" to view full details.
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSensitiveData(!showSensitiveData)}
                className="flex items-center gap-2 text-sm"
                title={showSensitiveData ? "Hide sensitive data (GDPR)" : "Show sensitive data"}
              >
                {showSensitiveData ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide Data
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show Data
                  </>
                )}
              </Button>
            </DialogDescription>

          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Withdrawal ID</label>
                  <p className="font-mono text-sm break-all">{displayText(selectedWithdrawal.id)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">User Email</label>
                  <p className="text-sm">{displayEmail(selectedWithdrawal.user?.email)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Amount</label>
                  <p className="text-sm font-mono text-red-300">
                    {selectedWithdrawal.amount && !isNaN(parseFloat(selectedWithdrawal.amount))
                      ? `-${parseFloat(selectedWithdrawal.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Fee</label>
                  <p className="text-sm font-mono">
                    {selectedWithdrawal.fee && !isNaN(parseFloat(selectedWithdrawal.fee))
                      ? parseFloat(selectedWithdrawal.fee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })
                      : '0.00'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Total Amount</label>
                  <p className="text-sm font-mono text-red-300">
                    {selectedWithdrawal.totalAmount && !isNaN(parseFloat(selectedWithdrawal.totalAmount))
                      ? `-${parseFloat(selectedWithdrawal.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Status</label>
                  <div className="mt-1">
                    <WithdrawalStatusBadge status={selectedWithdrawal.status} />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-400">Notes</label>
                  <p className="font-mono text-sm break-all">{displayText(selectedWithdrawal.note!)}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-400">Destination Address</label>
                  <p className="font-mono text-sm break-all">{displayAddress(selectedWithdrawal.toAddress)}
                    <CopyButton text={selectedWithdrawal.toAddress || ''} />
                  </p>
                </div>
                {selectedWithdrawal.memo && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-400">Memo</label>
                    <p className="font-mono text-sm">{displayText(selectedWithdrawal.memo)}</p>
                  </div>
                )}
                {selectedWithdrawal.txHash && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-400">Transaction Hash</label>
                    <p className="font-mono text-sm break-all">{displayTxId(selectedWithdrawal.txHash)}
                      <CopyButton text={selectedWithdrawal.txHash || ''} />
                    </p>
                  </div>
                )}
                {/* <div>
                  <label className="text-sm font-medium text-gray-400">Email Verified</label>
                  <p className="text-sm">{selectedWithdrawal.emailVerified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">2FA Verified</label>
                  <p className="text-sm">{selectedWithdrawal.google2FAVerified ? 'Yes' : 'No'}</p>
                </div> */}
                <div>
                  <label className="text-sm font-medium text-gray-400">Created At</label>
                  <p className="text-sm">{format(new Date(selectedWithdrawal.createdAt), 'MMM dd, yyyy HH:mm:ss')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Updated At</label>
                  <p className="text-sm">{format(new Date(selectedWithdrawal.updatedAt), 'MMM dd, yyyy HH:mm:ss')}</p>
                </div>
              </div>
              {/* {selectedWithdrawal.txHash && (
                <div className="flex justify-between pt-4 border-t">
                  <a
                    href={getBlockExplorerUrl(selectedWithdrawal)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View on Block Explorer</span>
                  </a>
                </div>
              )} */}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Trigger Withdrawal Confirmation Dialog */}
      <Dialog open={triggerConfirmOpen} onOpenChange={setTriggerConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trigger Withdrawal</DialogTitle>
            <DialogDescription>
              Are you sure you want to trigger the withdrawal for this transaction?
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawalForTrigger && (
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Withdrawal ID:</span>
                    <div className="font-mono text-xs break-all">{selectedWithdrawalForTrigger.id}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">User:</span>
                    <div>{cipherEmail(selectedWithdrawalForTrigger.user?.email)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <div className="font-mono text-red-600">
                      -{parseFloat(selectedWithdrawalForTrigger.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8
                      })} ETH
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <div>
                      <WithdrawalStatusBadge status={selectedWithdrawalForTrigger.status} />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                ⚠️ This action will process the withdrawal and cannot be undone. Make sure all details are correct before proceeding.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setTriggerConfirmOpen(false)}
              disabled={isTriggeringWithdrawal}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleTriggerWithdrawal}
              disabled={isTriggeringWithdrawal}
              className="bg-green-600 hover:bg-green-700"
            >
              {isTriggeringWithdrawal ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Trigger Withdrawal
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Withdrawal Confirmation Dialog */}
      <Dialog open={rejectConfirmOpen} onOpenChange={setRejectConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this withdrawal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawalForReject && (
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Withdrawal ID:</span>
                    <div className="font-mono text-xs break-all">{selectedWithdrawalForReject.id}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">User:</span>
                    <div>{cipherEmail(selectedWithdrawalForReject.user?.email)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <div className="font-mono text-red-600">
                      -{parseFloat(selectedWithdrawalForReject.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8
                      })} ETH
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <div>
                      <WithdrawalStatusBadge status={selectedWithdrawalForReject.status} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Please provide a detailed reason for rejecting this withdrawal..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px] resize-none"
                  disabled={isRejectingWithdrawal}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This reason will be logged and may be communicated to the user.
                </p>
              </div>

              <p className="text-sm text-red-600 dark:text-red-400">
                ⚠️ Warning: Rejecting this withdrawal will permanently deny the transaction. The user will need to submit a new withdrawal request.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setRejectConfirmOpen(false)}
              disabled={isRejectingWithdrawal}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleRejectWithdrawal}
              disabled={isRejectingWithdrawal}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRejectingWithdrawal ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Reject Withdrawal
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
