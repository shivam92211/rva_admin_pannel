import React, { useState, useEffect, useCallback } from 'react';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Key,
  UserX,
  UserCheck,
  Trash2,
  Eye,
  X,
  Shield,
} from 'lucide-react';
import {
  adminManagementApi,
  type Admin,
  type CreateAdminDto,
  type UpdatePasswordDto,
} from '@/services/admin-management.api';
import RefreshButton from '@/components/common/RefreshButton';
import { useSnackbarMsg } from '@/hooks/snackbar';
import TableHeader from '@/components/common/TableHeader';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const AdminManagementView: React.FC = () => {
  const [, setSnackbarMsg] = useSnackbarMsg();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateAdminDto>({
    name: '',
    email: '',
    password: '',
    role: 'READONLY',
    permissions: [],
    phone: '',
    department: '',
  });

  const [passwordForm, setPasswordForm] = useState<UpdatePasswordDto>({
    newPassword: '',
  });

  const [blockReason, setBlockReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminManagementApi.getAllAdmins({
        page: currentPage,
        limit: pageSize,
        includeDeleted: statusFilter === 'deleted',
      });

      let filteredAdmins = response.admins;

      // Apply client-side filtering
      if (searchTerm) {
        filteredAdmins = filteredAdmins.filter(
          (admin) =>
            admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.department?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (roleFilter !== 'all') {
        filteredAdmins = filteredAdmins.filter((admin) => admin.role === roleFilter);
      }

      if (statusFilter === 'active') {
        filteredAdmins = filteredAdmins.filter((admin) => admin.isActive && !admin.deletedAt);
      } else if (statusFilter === 'blocked') {
        filteredAdmins = filteredAdmins.filter((admin) => !admin.isActive);
      } else if (statusFilter === 'deleted') {
        filteredAdmins = filteredAdmins.filter((admin) => admin.deletedAt !== null);
      }

      setAdmins(filteredAdmins);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error('Failed to load admins:', error);
      setSnackbarMsg({
        msg: `Failed to load admins: ${error.message || 'Unknown error'}`,
        type: 'error',
      });
      setAdmins([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, roleFilter, statusFilter, setSnackbarMsg]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm !== '' || roleFilter !== 'all' || statusFilter !== 'all';

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCreateAdmin = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      setSnackbarMsg({
        msg: 'Please fill in all required fields',
        type: 'error',
      });
      return;
    }

    setActionLoading(true);
    try {
      const response = await adminManagementApi.createAdmin(createForm);
      setSnackbarMsg({
        msg: response.message || 'Admin created successfully',
        type: 'success',
      });
      setCreateDialogOpen(false);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        role: 'READONLY',
        permissions: [],
        phone: '',
        department: '',
      });
      await loadAdmins();
    } catch (error: any) {
      console.error('Failed to create admin:', error);
      setSnackbarMsg({
        msg: `Failed to create admin: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!selectedAdmin || !passwordForm.newPassword) {
      setSnackbarMsg({
        msg: 'Please enter a new password',
        type: 'error',
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setSnackbarMsg({
        msg: 'Password must be at least 8 characters long',
        type: 'error',
      });
      return;
    }

    setActionLoading(true);
    try {
      const response = await adminManagementApi.updatePassword(
        selectedAdmin.id,
        passwordForm
      );
      setSnackbarMsg({
        msg: response.message || 'Password updated successfully',
        type: 'success',
      });
      setPasswordDialogOpen(false);
      setPasswordForm({ newPassword: '' });
      setSelectedAdmin(null);
    } catch (error: any) {
      console.error('Failed to update password:', error);
      setSnackbarMsg({
        msg: `Failed to update password: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockAdmin = async () => {
    if (!selectedAdmin) return;

    setActionLoading(true);
    try {
      const response = await adminManagementApi.blockAdmin(selectedAdmin.id, {
        reason: blockReason,
      });
      setSnackbarMsg({
        msg: response.message || 'Admin blocked successfully',
        type: 'success',
      });
      setBlockDialogOpen(false);
      setBlockReason('');
      setSelectedAdmin(null);
      await loadAdmins();
    } catch (error: any) {
      console.error('Failed to block admin:', error);
      setSnackbarMsg({
        msg: `Failed to block admin: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockAdmin = async (admin: Admin) => {
    setActionLoading(true);
    try {
      const response = await adminManagementApi.unblockAdmin(admin.id);
      setSnackbarMsg({
        msg: response.message || 'Admin unblocked successfully',
        type: 'success',
      });
      await loadAdmins();
    } catch (error: any) {
      console.error('Failed to unblock admin:', error);
      setSnackbarMsg({
        msg: `Failed to unblock admin: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    setActionLoading(true);
    try {
      const response = await adminManagementApi.deleteAdmin(selectedAdmin.id, {
        reason: deleteReason,
      });
      setSnackbarMsg({
        msg: response.message || 'Admin deleted successfully',
        type: 'success',
      });
      setDeleteDialogOpen(false);
      setDeleteReason('');
      setSelectedAdmin(null);
      await loadAdmins();
    } catch (error: any) {
      console.error('Failed to delete admin:', error);
      setSnackbarMsg({
        msg: `Failed to delete admin: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openPasswordDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setPasswordDialogOpen(true);
  };

  const openBlockDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setBlockDialogOpen(true);
  };

  const openDeleteDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setDeleteDialogOpen(true);
  };

  const openDetailsDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setDetailsDialogOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-blue-100 text-blue-800',
      MODERATOR: 'bg-green-100 text-green-800',
      SUPPORT: 'bg-yellow-100 text-yellow-800',
      READONLY: 'bg-gray-100 text-gray-800',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'
          }`}
      >
        {role.replace('_', ' ')}
      </span>
    );
  };

  const getStatusBadge = (admin: Admin) => {
    if (admin.deletedAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          DELETED
        </span>
      );
    }
    if (!admin.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          BLOCKED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ACTIVE
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Admin Management"
        description="Manage admin users and their permissions"
      >
        <div className="flex gap-2 my-0">
          <RefreshButton onClick={loadAdmins} />
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="p-0" />
            New Admin
          </Button>
        </div>
      </PageHeader>

      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-gray-800 rounded-lg p-6 h-full flex flex-col">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6 flex-shrink-0">
            <div className="relative flex-1 max-w-sm">
              {loading && searchTerm ? (
                <RefreshCw className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              )}
              <Input
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-40">
              <Select value={roleFilter} onValueChange={handleRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MODERATOR">Moderator</SelectItem>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                  <SelectItem value="READONLY">Read Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
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
              {total} admin{total !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto rounded-lg border border-gray-700/50">
              <table className="w-full">
                <TableHeader
                  headers={[
                    'Name',
                    'Email',
                    'Role',
                    'Department',
                    'Status',
                    'Last Login',
                    'Created',
                    'Actions',
                  ]}
                />

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8">
                        <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-gray-400" />
                        <div className="text-gray-400">Loading admins...</div>
                      </td>
                    </tr>
                  ) : admins.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-400">
                        No admins found
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr
                        key={admin.id}
                        className="border-b border-gray-700/50 hover:bg-gray-700/20"
                      >
                        <td className="py-3 px-4 font-medium text-white">
                          {admin.name}
                        </td>
                        <td className="py-3 px-4 text-gray-300">{admin.email}</td>
                        <td className="py-3 px-4">{getRoleBadge(admin.role)}</td>
                        <td className="py-3 px-4 text-gray-300">
                          {admin.department || 'N/A'}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(admin)}</td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {formatDate(admin.lastLoginAt)}
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {formatDate(admin.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button
                              onClick={() => openDetailsDialog(admin)}
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white h-8 w-8 p-0"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => openPasswordDialog(admin)}
                              variant="outline"
                              size="sm"
                              disabled={!!admin.deletedAt}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                              title="Update Password"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            {admin.isActive && !admin.deletedAt ? (
                              <Button
                                onClick={() => openBlockDialog(admin)}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                                title="Block Admin"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            ) : !admin.deletedAt ? (
                              <Button
                                onClick={() => handleUnblockAdmin(admin)}
                                variant="outline"
                                size="sm"
                                disabled={actionLoading}
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                                title="Unblock Admin"
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            ) : null}
                            <Button
                              onClick={() => openDeleteDialog(admin)}
                              variant="outline"
                              size="sm"
                              disabled={!!admin.deletedAt}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                              title="Delete Admin"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
                  .filter((page) => {
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, pages) => {
                    const showEllipsis = index > 0 && page - pages[index - 1] > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-3 py-1 text-sm text-gray-400">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? 'default' : 'outline'}
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

      {/* Create Admin Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Create New Admin
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new admin user
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={createForm.role}
                  onValueChange={(value: any) =>
                    setCreateForm({ ...createForm, role: value })
                  }
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="READONLY">Read Only</SelectItem>
                    <SelectItem value="SUPPORT">Support</SelectItem>
                    <SelectItem value="MODERATOR">Moderator</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={createForm.phone}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, phone: e.target.value })
                  }
                  placeholder="+1234567890"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={createForm.department}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, department: e.target.value })
                  }
                  placeholder="e.g., Operations, Support"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateAdmin} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Admin'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Update Password
            </DialogTitle>
            <DialogDescription>
              Update password for{' '}
              <span className="font-semibold">{selectedAdmin?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">
                New Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ newPassword: e.target.value })
                }
                placeholder="Minimum 8 characters"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPasswordDialogOpen(false);
                setPasswordForm({ newPassword: '' });
                setSelectedAdmin(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePassword} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Admin Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5" />
              Block Admin
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to block{' '}
              <span className="font-semibold">{selectedAdmin?.name}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="blockReason">Reason (Optional)</Label>
              <Textarea
                id="blockReason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking this admin..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBlockDialogOpen(false);
                setBlockReason('');
                setSelectedAdmin(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBlockAdmin}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Blocking...
                </>
              ) : (
                'Block Admin'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Admin
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">{selectedAdmin?.name}</span>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="deleteReason">Reason (Optional)</Label>
              <Textarea
                id="deleteReason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason for deleting this admin..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteReason('');
                setSelectedAdmin(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAdmin}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Admin'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Details
            </DialogTitle>
          </DialogHeader>
          {selectedAdmin && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Name</Label>
                  <p className="text-white mt-1">{selectedAdmin.name}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Email</Label>
                  <p className="text-white mt-1">{selectedAdmin.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Role</Label>
                  <div className="mt-1">{getRoleBadge(selectedAdmin.role)}</div>
                </div>
                <div>
                  <Label className="text-gray-400">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedAdmin)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Phone</Label>
                  <p className="text-white mt-1">{selectedAdmin.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Department</Label>
                  <p className="text-white mt-1">
                    {selectedAdmin.department || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">2FA Enabled</Label>
                  <p className="text-white mt-1">
                    {selectedAdmin.isGoogle2FAEnabled ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400">Failed Login Attempts</Label>
                  <p className="text-white mt-1">{selectedAdmin.failedAttempts}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Last Login</Label>
                  <p className="text-white mt-1 text-sm">
                    {formatDate(selectedAdmin.lastLoginAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400">Locked Until</Label>
                  <p className="text-white mt-1 text-sm">
                    {formatDate(selectedAdmin.lockedUntil)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Created At</Label>
                  <p className="text-white mt-1 text-sm">
                    {formatDate(selectedAdmin.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400">Updated At</Label>
                  <p className="text-white mt-1 text-sm">
                    {formatDate(selectedAdmin.updatedAt)}
                  </p>
                </div>
              </div>
              {selectedAdmin.creator && (
                <div>
                  <Label className="text-gray-400">Created By</Label>
                  <p className="text-white mt-1">
                    {selectedAdmin.creator.name} ({selectedAdmin.creator.email})
                  </p>
                </div>
              )}
              {selectedAdmin.permissions && selectedAdmin.permissions.length > 0 && (
                <div>
                  <Label className="text-gray-400">Permissions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedAdmin.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDetailsDialogOpen(false);
                setSelectedAdmin(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagementView;
