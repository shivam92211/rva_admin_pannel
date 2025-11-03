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
  Activity,
  Info,
} from 'lucide-react';
import {
  adminManagementApi,
  type Admin,
  type CreateAdminDto,
  type UpdatePasswordDto,
  type AdminLog,
  type FilteredAdminLogsParams,
  type AdminLogStatistics,
  type AdminActivitySummary,
} from '@/services/admin-management.api';
import RefreshButton from '@/components/common/RefreshButton';
import { useSnackbarMsg } from '@/hooks/snackbar';
import TableHeader from '@/components/common/TableHeader';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const AdminManagementView: React.FC = () => {
  const [, setSnackbarMsg] = useSnackbarMsg();
  const [activeTab, setActiveTab] = useState('admins');

  // Admin list states
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // Activity logs states
  const [activityLogs, setActivityLogs] = useState<AdminLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsCurrentPage, setLogsCurrentPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const logsPageSize = 20;

  // Activity logs filters
  const [logsSearch, setLogsSearch] = useState('');
  const [logsAdminFilter, setLogsAdminFilter] = useState<string>('all');
  const [logsActionFilter, setLogsActionFilter] = useState<string>('all');
  const [logsStartDate, setLogsStartDate] = useState('');
  const [logsEndDate, setLogsEndDate] = useState('');

  // Statistics
  const [statistics, setStatistics] = useState<AdminLogStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  // Activity summary state
  const [activitySummary, setActivitySummary] = useState<AdminActivitySummary | null>(null);
  const [activityDays, setActivityDays] = useState(7);

  // Log details dialog state
  const [logDetailsDialogOpen, setLogDetailsDialogOpen] = useState(false);
  const [selectedLogDetails, setSelectedLogDetails] = useState<any>(null);

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

  const loadActivityLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const params: FilteredAdminLogsParams = {
        page: logsCurrentPage,
        limit: logsPageSize,
        search: logsSearch || undefined,
        adminId: logsAdminFilter !== 'all' ? logsAdminFilter : undefined,
        action: logsActionFilter !== 'all' ? logsActionFilter : undefined,
        startDate: logsStartDate || undefined,
        endDate: logsEndDate || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const response = await adminManagementApi.getFilteredAdminLogs(params);
      setActivityLogs(response.logs);
      setLogsTotal(response.total);
      setLogsTotalPages(response.totalPages);
    } catch (error: any) {
      console.error('Failed to load activity logs:', error);
      setSnackbarMsg({
        msg: `Failed to load activity logs: ${error.message || 'Unknown error'}`,
        type: 'error',
      });
      setActivityLogs([]);
      setLogsTotalPages(1);
      setLogsTotal(0);
    } finally {
      setLogsLoading(false);
    }
  }, [
    logsCurrentPage,
    logsPageSize,
    logsSearch,
    logsAdminFilter,
    logsActionFilter,
    logsStartDate,
    logsEndDate,
    setSnackbarMsg,
  ]);

  const loadStatistics = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = {
        startDate: logsStartDate || undefined,
        endDate: logsEndDate || undefined,
        adminId: logsAdminFilter !== 'all' ? logsAdminFilter : undefined,
      };
      const stats = await adminManagementApi.getAdminLogStatistics(params);
      setStatistics(stats);
    } catch (error: any) {
      console.error('Failed to load statistics:', error);
      setStatistics(null);
    } finally {
      setStatsLoading(false);
    }
  }, [logsStartDate, logsEndDate, logsAdminFilter]);

  useEffect(() => {
    if (activeTab === 'admins') {
      loadAdmins();
    } else if (activeTab === 'activity') {
      loadActivityLogs();
      loadStatistics();
    }
  }, [activeTab, loadAdmins, loadActivityLogs, loadStatistics]);

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

  const clearLogFilters = () => {
    setLogsSearch('');
    setLogsAdminFilter('all');
    setLogsActionFilter('all');
    setLogsStartDate('');
    setLogsEndDate('');
    setLogsCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm !== '' || roleFilter !== 'all' || statusFilter !== 'all';

  const hasActiveLogFilters =
    logsSearch !== '' ||
    logsAdminFilter !== 'all' ||
    logsActionFilter !== 'all' ||
    logsStartDate !== '' ||
    logsEndDate !== '';

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleLogsPageChange = (page: number) => {
    if (page >= 1 && page <= logsTotalPages) {
      setLogsCurrentPage(page);
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

    // Close dialog immediately
    setCreateDialogOpen(false);
    setActionLoading(true);

    try {
      const response = await adminManagementApi.createAdmin(createForm);
      setSnackbarMsg({
        msg: response.message || 'Admin created successfully',
        type: 'success',
      });
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
      // Close dialog immediately
      setPasswordDialogOpen(false);
      setActionLoading(true);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setSnackbarMsg({
        msg: 'Password must be at least 8 characters long',
        type: 'error',
      });
      // Close dialog immediately
      setPasswordDialogOpen(false);
      setActionLoading(true);
      return;
    }

    // Close dialog immediately
    setPasswordDialogOpen(false);
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

    // Close dialog immediately
    setBlockDialogOpen(false);
    setActionLoading(true);

    try {
      const response = await adminManagementApi.blockAdmin(selectedAdmin.id, {
        reason: blockReason,
      });
      setSnackbarMsg({
        msg: response.message || 'Admin blocked successfully',
        type: 'success',
      });
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

    // Close dialog immediately
    setDeleteDialogOpen(false);
    setActionLoading(true);

    try {
      const response = await adminManagementApi.deleteAdmin(selectedAdmin.id, {
        reason: deleteReason,
      });
      setSnackbarMsg({
        msg: response.message || 'Admin deleted successfully',
        type: 'success',
      });
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

  const openActivityDialog = async (admin: Admin) => {
    setSelectedAdmin(admin);
    setActivityDialogOpen(true);
    try {
      const summary = await adminManagementApi.getAdminActivitySummary(admin.id, activityDays);
      setActivitySummary(summary);
    } catch (error: any) {
      console.error('Failed to load activity summary:', error);
      setActivitySummary(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatShortDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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

  // Get unique actions for filter
  const uniqueActions = [...new Set(activityLogs.map((log) => log.action))].sort();

  // Render JSON details in tree format
  const renderJsonTree = (obj: any, depth: number = 0): JSX.Element => {
    if (obj === null || obj === undefined) {
      return <span className="text-gray-500">null</span>;
    }

    if (typeof obj !== 'object') {
      return (
        <span className={`${typeof obj === 'string' ? 'text-green-400' :
          typeof obj === 'number' ? 'text-blue-400' :
            typeof obj === 'boolean' ? 'text-purple-400' :
              'text-gray-300'
          }`}>
          {typeof obj === 'string' ? `"${obj}"` : String(obj)}
        </span>
      );
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return <span className="text-gray-500">[]</span>;
      }
      return (
        <div className="ml-4">
          {obj.map((item, index) => (
            <div key={index} className="my-1">
              <span className="text-gray-500">[{index}]:</span>{' '}
              {renderJsonTree(item, depth + 1)}
            </div>
          ))}
        </div>
      );
    }

    const entries = Object.entries(obj);
    if (entries.length === 0) {
      return <span className="text-gray-500">{'{}'}</span>;
    }

    return (
      <div className={depth > 0 ? 'ml-4' : ''}>
        {entries.map(([key, value]) => (
          <div key={key} className="my-1">
            <Label className="text-yellow-400 font-medium">{key}:</Label>{' '}
            {typeof value === 'object' && value !== null ? (
              <div className="ml-4">{renderJsonTree(value, depth + 1)}</div>
            ) : (
              renderJsonTree(value, depth + 1)
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Admin Management"
        description="Manage admin users, permissions, and view activity logs"
      >
        <div className="flex gap-2 my-0">
          <RefreshButton
            onClick={() => {
              if (activeTab === 'admins') {
                loadAdmins();
              } else {
                loadActivityLogs();
                loadStatistics();
              }
            }}
          />
          {activeTab === 'admins' && (
            <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="p-0" />
              New Admin
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6 space-y-6">
          {/* Tab Navigation */}
          <div className="bg-gray-800 rounded-lg p-1 inline-flex space-x-1">
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'admins'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
            >
              <Shield className="h-4 w-4" />
              Admin Users
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'activity'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
            >
              <Activity className="h-4 w-4" />
              Activity Logs
            </button>
          </div>

          {/* Admins Tab */}
          {activeTab === 'admins' && (
            <div
              style={{ height: "calc(100vh - 180px)" }}
              className="bg-gray-800 rounded-lg p-6 h-full flex flex-col">
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
                      {/* <SelectItem value="MODERATOR">Moderator</SelectItem>
                      <SelectItem value="SUPPORT">Support</SelectItem> */}
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
                              {formatShortDate(admin.lastLoginAt)}
                            </td>
                            <td className="py-3 px-4 text-gray-400 text-sm">
                              {formatShortDate(admin.createdAt)}
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
                                  onClick={() => openActivityDialog(admin)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-white h-8 w-8 p-0"
                                  title="View Activity"
                                >
                                  <Activity className="w-4 h-4" />
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
          )}

          {/* Activity Logs Tab */}
          {activeTab === 'activity' && (
            <div className="bg-gray-800 rounded-lg p-6 flex flex-col"
              style={{ height: "calc(100vh - 180px)" }}>
              {/* Statistics Cards */}
              {statistics && (
                <div className="grid grid-cols-4 gap-4 mb-6 flex-shrink-0">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Total Logs</div>
                    <div className="text-2xl font-bold text-white">{statistics.totalLogs}</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Unique Actions</div>
                    <div className="text-2xl font-bold text-white">{statistics.uniqueActions}</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Most Common Action</div>
                    <div className="text-lg font-semibold text-white">
                      {Object.entries(statistics.actionCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {Object.entries(statistics.actionCounts).sort(([, a], [, b]) => b - a)[0]?.[1] || 0} times
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Action Types</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.keys(statistics.actionCounts).slice(0, 3).map((action) => (
                        <Badge key={action} variant="secondary" className="text-xs">
                          {action}
                        </Badge>
                      ))}
                      {Object.keys(statistics.actionCounts).length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{Object.keys(statistics.actionCounts).length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="flex items-center gap-4 mb-6 flex-shrink-0 flex-wrap">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search logs..."
                    value={logsSearch}
                    onChange={(e) => setLogsSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="w-48">
                  <Select value={logsAdminFilter} onValueChange={setLogsAdminFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Admin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Admins</SelectItem>
                      {admins.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-48">
                  <Select value={logsActionFilter} onValueChange={setLogsActionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {uniqueActions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={logsStartDate}
                    onChange={(e) => setLogsStartDate(e.target.value)}
                    className="w-40 cursor-pointer"
                    placeholder="Start Date"
                  />
                  <Input
                    type="date"
                    value={logsEndDate}
                    onChange={(e) => setLogsEndDate(e.target.value)}
                    className="w-40 cursor-pointer"
                    placeholder="End Date"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={clearLogFilters}
                  disabled={!hasActiveLogFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
                <div className="text-sm text-gray-400">
                  {logsTotal} log{logsTotal !== 1 ? 's' : ''} found
                </div>
              </div>

              {/* Logs Table */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-auto rounded-lg border border-gray-700/50">
                  <table className="w-full">
                    <TableHeader
                      headers={[
                        'Time',
                        'Admin',
                        'Action',
                        'Resource',
                        'IP Address',
                        'Details',
                      ]}
                    />

                    <tbody>
                      {logsLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8">
                            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-gray-400" />
                            <div className="text-gray-400">Loading logs...</div>
                          </td>
                        </tr>
                      ) : activityLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-400">
                            No activity logs found
                          </td>
                        </tr>
                      ) : (
                        activityLogs.map((log) => (
                          <tr
                            key={log.id}
                            className="border-b border-gray-700/50 hover:bg-gray-700/20"
                          >
                            <td className="py-3 px-4 text-gray-300 text-sm">
                              {formatDate(log.createdAt)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-white">{log.admin.name}</div>
                              <div className="text-xs text-gray-400">{log.admin.email}</div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary">{log.action}</Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-300 text-sm">
                              {log.resource || 'N/A'}
                              {log.resourceId && (
                                <div className="text-xs text-gray-500 font-mono">
                                  {log.resourceId.substring(0, 8)}...
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-300 font-mono text-sm">
                              {log.ipAddress}
                            </td>
                            <td className="py-3 px-4 text-gray-400 text-xs">
                              {log.details ? (
                                <button
                                  onClick={() => {
                                    setSelectedLogDetails(log.details);
                                    setLogDetailsDialogOpen(true);
                                  }}
                                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                                  title="View details"
                                >
                                  <Info className="h-4 w-4" />
                                  <span className="max-w-xs truncate">
                                    {JSON.stringify(log.details).substring(0, 50)}...
                                  </span>
                                </button>
                              ) : (
                                'N/A'
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Logs Pagination */}
              {logsTotalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4 flex-shrink-0">
                  <div className="text-sm text-gray-400">
                    Page {logsCurrentPage} of {logsTotalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLogsPageChange(logsCurrentPage - 1)}
                      disabled={logsCurrentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    {Array.from({ length: logsTotalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (page === 1 || page === logsTotalPages) return true;
                        if (Math.abs(page - logsCurrentPage) <= 1) return true;
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
                              variant={logsCurrentPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleLogsPageChange(page)}
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        );
                      })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLogsPageChange(logsCurrentPage + 1)}
                      disabled={logsCurrentPage >= logsTotalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
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
                    {/* <SelectItem value="SUPPORT">Support</SelectItem>
                    <SelectItem value="MODERATOR">Moderator</SelectItem> */}
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

      {/* Activity Summary Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Summary - {selectedAdmin?.name}
            </DialogTitle>
            <DialogDescription>
              Detailed activity summary for the selected period
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2 items-center">
              <Label>Period:</Label>
              <Select
                value={activityDays.toString()}
                onValueChange={async (value) => {
                  const days = parseInt(value);
                  setActivityDays(days);
                  if (selectedAdmin) {
                    try {
                      const summary = await adminManagementApi.getAdminActivitySummary(
                        selectedAdmin.id,
                        days
                      );
                      setActivitySummary(summary);
                    } catch (error) {
                      console.error('Failed to load activity summary:', error);
                    }
                  }
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activitySummary ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Total Actions</div>
                    <div className="text-2xl font-bold text-white">
                      {activitySummary.totalActions}
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Unique IPs</div>
                    <div className="text-2xl font-bold text-white">
                      {activitySummary.uniqueIPAddresses}
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Most Active Day</div>
                    <div className="text-lg font-semibold text-white">
                      {activitySummary.mostActiveDay
                        ? formatShortDate(activitySummary.mostActiveDay[0])
                        : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {activitySummary.mostActiveDay
                        ? `${activitySummary.mostActiveDay[1]} actions`
                        : ''}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400 mb-2 block">Action Breakdown</Label>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                    {Object.entries(activitySummary.actionCounts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([action, count]) => (
                        <div key={action} className="flex justify-between items-center">
                          <span className="text-white">{action}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${(count / activitySummary.totalActions) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-gray-300 w-12 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400 mb-2 block">Daily Activity</Label>
                  <div className="bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-1">
                      {Object.entries(activitySummary.dailyActivity)
                        .sort(([a], [b]) => b.localeCompare(a))
                        .map(([date, count]) => (
                          <div
                            key={date}
                            className="flex justify-between text-sm py-1 border-b border-gray-600 last:border-0"
                          >
                            <span className="text-gray-300">{formatShortDate(date)}</span>
                            <span className="text-white font-medium">{count} actions</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <div>Loading activity summary...</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActivityDialogOpen(false);
                setActivitySummary(null);
                setSelectedAdmin(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Details Dialog */}
      <Dialog open={logDetailsDialogOpen} onOpenChange={setLogDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Activity Log Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this activity log entry
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 overflow-y-auto max-h-[60vh]">
            {selectedLogDetails ? (
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                {renderJsonTree(selectedLogDetails)}
              </div>
            ) : (
              <div className="text-center text-gray-400">No details available</div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setLogDetailsDialogOpen(false);
                setSelectedLogDetails(null);
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
