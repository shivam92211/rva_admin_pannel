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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Power, PowerOff, Shield, ShieldCheck, X, Eye } from 'lucide-react';
import { userApi, type User, type PaginatedUsersResponse } from '@/services/userApi';
import { UserDetailsDialog } from '@/components/UserDetailsDialog';
import RefreshButton from '@/components/common/RefreshButton';
import { cipherEmail, maskString } from '@/utils/security';
import { useSnackbarMsg } from '@/hooks/snackbar';
import TableHeader from '@/components/common/TableHeader';

const UsersView: React.FC = () => {
  const [, setSnackbarMsg] = useSnackbarMsg();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [whitelistFilter, setWhitelistFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // User details dialog state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // User action confirmation states
  const [userActionConfirmOpen, setUserActionConfirmOpen] = useState(false);
  const [userAction, setUserAction] = useState<{ type: 'activate' | 'deactivate' | 'whitelist' | 'removeWhitelist', user: User; } | null>(null);


  const loadUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const response: PaginatedUsersResponse = await userApi.getUsers({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        whitelist: whitelistFilter === 'all' ? undefined : whitelistFilter
      });

      setUsers(response.users);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.totalCount);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      setUsers([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, whitelistFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleWhitelistFilter = (value: string) => {
    setWhitelistFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setWhitelistFilter('all');
    setCurrentPage(1);
    setSnackbarMsg({
      msg: 'All filters cleared',
      type: 'success'
    });
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || whitelistFilter !== 'all';

  const handleToggleUserStatus = async (userId: string) => {
    try {
      setLoading(true);
      const result = await userApi.toggleUserStatus(userId);

      // Update the user in the local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, isActive: result.isActive }
            : user
        )
      );

      const user = users.find(u => u.id === userId);
      setSnackbarMsg({
        msg: `User ${user?.username || 'user'} ${result.isActive ? 'activated' : 'deactivated'} successfully`,
        type: 'success'
      });
    } catch (error: any) {
      console.error('Failed to toggle user status:', error);
      setSnackbarMsg({
        msg: `Failed to toggle user status: ${error.message || 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWithdrawalWhitelist = async (userId: string) => {
    try {
      setLoading(true);
      const result = await userApi.toggleWithdrawalWhitelist(userId);

      // Update the user in the local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, withdrawalWhitelist: result.withdrawalWhitelist }
            : user
        )
      );

      const user = users.find(u => u.id === userId);
      setSnackbarMsg({
        msg: `User ${user?.username || 'user'} ${result.withdrawalWhitelist ? 'added to' : 'removed from'} withdrawal whitelist successfully`,
        type: 'success'
      });
    } catch (error: any) {
      console.error('Failed to toggle withdrawal whitelist:', error);
      setSnackbarMsg({
        msg: `Failed to toggle withdrawal whitelist: ${error.message || 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserActionClick = (type: 'activate' | 'deactivate' | 'whitelist' | 'removeWhitelist', user: User) => {
    setUserAction({ type, user });
    setUserActionConfirmOpen(true);
  };

  const confirmUserAction = async () => {
    if (!userAction) return;

    const { type, user } = userAction;

    try {
      switch (type) {
        case 'activate':
        case 'deactivate':
          await handleToggleUserStatus(user.id);
          break;
        case 'whitelist':
        case 'removeWhitelist':
          await handleToggleWithdrawalWhitelist(user.id);
          break;
      }
    } finally {
      setUserActionConfirmOpen(false);
      setUserAction(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleUserRowClick = async (user: User) => {
    try {
      setDialogOpen(true);

      // Fetch detailed user data
      const detailedUser = await userApi.getUserById(user.id);
      setSelectedUser(detailedUser);
    } catch (error: any) {
      console.error('Failed to load user details:', error);
      // Show basic user data if detailed fetch fails
      setSelectedUser(user);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getWhitelistBadge = (isWhitelisted: boolean | undefined) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isWhitelisted ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
        }`}>
        {isWhitelisted ? 'Whitelisted' : 'Not Whitelisted'}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Users"
        description="Manage system users and their information"
      >
        <div className="flex gap-2">
          <RefreshButton onClick={() => {
            loadUsers().then(() => {
              setSnackbarMsg({
                msg: 'Users refreshed successfully',
                type: 'success'
              });
            }).catch(() => {
              setSnackbarMsg({
                msg: 'Failed to refresh users',
                type: 'error'
              });
            });
          }} />
        </div>
      </PageHeader>

      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-gray-800 rounded-lg p-6 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-6 flex-shrink-0">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users..."
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
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={whitelistFilter} onValueChange={handleWhitelistFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by whitelist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Whitelist</SelectItem>
                  <SelectItem value="whitelisted">Whitelisted Only</SelectItem>
                  <SelectItem value="not_whitelisted">Not Whitelisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={clearAllFilters}
              disabled={!hasActiveFilters}
              className="flex items-center gap-2 shrink-0"
              title="Clear all filters"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
            <div className="text-sm text-gray-400">
              {total} user{total !== 1 ? 's' : ''} found
            </div>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
                <span className="ml-2 text-gray-400">Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="h-full overflow-auto rounded-lg border border-gray-700/50">
                <table className="w-full">
                  <TableHeader headers={[
                    'Username',
                    'Email',
                    'Name',
                    'Phone',
                    'Status',
                    'Whitelist',
                    'Created',
                    'Actions'
                  ]} />

                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                        <td className="py-3 px-4 font-medium text-white">{user.username}</td>
                        <td className="py-3 px-4 text-gray-300">{cipherEmail(user.email)}</td>
                        <td className="py-3 px-4 text-gray-300">
                          {maskString(user.firstName || user.lastName
                            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                            : '—')
                          }
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {user.phoneNumber || user.phone || '—'}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(user.isActive)}
                        </td>
                        <td className="py-3 px-4">
                          {getWhitelistBadge(user.withdrawalWhitelist)}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleUserRowClick(user)}
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserActionClick(
                                user.isActive ? 'deactivate' : 'activate',
                                user
                              )}
                              disabled={loading}
                              className={`flex items-center gap-2 ${user.isActive
                                ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                                : 'hover:bg-green-50 hover:text-green-600 hover:border-green-200'
                                }`}
                            >
                              {user.isActive ? (
                                <>
                                  <PowerOff className="h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserActionClick(
                                user.withdrawalWhitelist ? 'removeWhitelist' : 'whitelist',
                                user
                              )}
                              disabled={loading}
                              className={`flex items-center gap-2 ${user.withdrawalWhitelist
                                ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                                : 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                                }`}
                            >
                              {user.withdrawalWhitelist ? (
                                <>
                                  <Shield className="h-4 w-4" />
                                  Remove
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="h-4 w-4" />
                                  Whitelist
                                </>
                              )}
                            </Button>
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

      {/* User Details Dialog */}
      <UserDetailsDialog
        user={selectedUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {/* User Action Confirmation Dialog */}
      <Dialog open={userActionConfirmOpen} onOpenChange={setUserActionConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userAction?.type === 'activate' && 'Activate User'}
              {userAction?.type === 'deactivate' && 'Deactivate User'}
              {userAction?.type === 'whitelist' && 'Add to Withdrawal Whitelist'}
              {userAction?.type === 'removeWhitelist' && 'Remove from Withdrawal Whitelist'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{' '}
              <span className="font-semibold">
                {userAction?.type === 'activate' && 'activate'}
                {userAction?.type === 'deactivate' && 'deactivate'}
                {userAction?.type === 'whitelist' && 'add to withdrawal whitelist'}
                {userAction?.type === 'removeWhitelist' && 'remove from withdrawal whitelist'}
              </span>{' '}
              user{' '}
              <span className="font-mono font-bold">{userAction?.user.username}</span>?
              <br /><br />
              <span className="text-sm text-muted-foreground">
                {userAction?.type === 'activate' && 'This will allow the user to access their account and perform operations.'}
                {userAction?.type === 'deactivate' && 'This will prevent the user from accessing their account.'}
                {userAction?.type === 'whitelist' && 'This will allow the user to withdraw funds without additional verification.'}
                {userAction?.type === 'removeWhitelist' && 'This will require additional verification for withdrawals.'}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUserActionConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={userAction?.type === 'activate' || userAction?.type === 'whitelist' ? 'default' : 'destructive'}
              onClick={confirmUserAction}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {userAction?.type === 'activate' && 'Activating...'}
                  {userAction?.type === 'deactivate' && 'Deactivating...'}
                  {userAction?.type === 'whitelist' && 'Adding...'}
                  {userAction?.type === 'removeWhitelist' && 'Removing...'}
                </>
              ) : (
                <>
                  {userAction?.type === 'activate' && 'Activate User'}
                  {userAction?.type === 'deactivate' && 'Deactivate User'}
                  {userAction?.type === 'whitelist' && 'Add to Whitelist'}
                  {userAction?.type === 'removeWhitelist' && 'Remove from Whitelist'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersView;