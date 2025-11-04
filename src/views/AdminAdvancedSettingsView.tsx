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
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Globe,
  Activity,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  adminFeesApi,
  type PlatformFeeTier,
  type CreateFeeTierDto,
  type UpdateFeeTierDto,
  FeeType,
} from '@/services/admin-fees-api.service';
import {
  adminGeoFencingApi,
  type GeoFencingRule,
  type CreateGeoFencingRuleDto,
  type UpdateGeoFencingRuleDto,
  type GeoFencingLog,
  type GeoFencingStatsResponse,
  type GetLogsParams,
} from '@/services/admin-geo-fencing-api.service';
import RefreshButton from '@/components/common/RefreshButton';
import { useSnackbarMsg } from '@/hooks/snackbar';
import TableHeader from '@/components/common/TableHeader';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const AdminAdvancedSettingsView: React.FC = () => {
  const [, setSnackbarMsg] = useSnackbarMsg();
  const [activeTab, setActiveTab] = useState('fees');

  // ==================== Platform Fees States ====================
  const [fees, setFees] = useState<PlatformFeeTier[]>([]);
  const [feesLoading, setFeesLoading] = useState(false);
  const [feesSearchTerm, setFeesSearchTerm] = useState('');
  const [feeTypeFilter, setFeeTypeFilter] = useState<string>('all');
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [feeDetailsDialogOpen, setFeeDetailsDialogOpen] = useState(false);
  const [feeDeleteDialogOpen, setFeeDeleteDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<PlatformFeeTier | null>(null);
  const [feeForm, setFeeForm] = useState<CreateFeeTierDto & { id?: string }>({
    feeType: FeeType.SPOT_TRADE,
    name: '',
    description: '',
    minVolume: 0,
    maxVolume: undefined,
    feeRate: 0,
    currency: '',
    minFeeAmount: undefined,
    maxFeeAmount: undefined,
    flatFeeAmount: undefined,
    tierOrder: 0,
  });
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [feesCurrentPage, setFeesCurrentPage] = useState(1);
  const [feesTotalPages, setFeesTotalPages] = useState(1);
  const [feesTotal, setFeesTotal] = useState(0);
  const feesPageSize = 10;

  // ==================== Geo-Fencing Rules States ====================
  const [geoRules, setGeoRules] = useState<GeoFencingRule[]>([]);
  const [geoRulesLoading, setGeoRulesLoading] = useState(false);
  const [geoRulesSearchTerm, setGeoRulesSearchTerm] = useState('');
  const [geoRulesAllowedFilter, setGeoRulesAllowedFilter] = useState<string>('all');
  const [geoRuleDialogOpen, setGeoRuleDialogOpen] = useState(false);
  const [geoRuleDetailsDialogOpen, setGeoRuleDetailsDialogOpen] = useState(false);
  const [geoRuleDeleteDialogOpen, setGeoRuleDeleteDialogOpen] = useState(false);
  const [selectedGeoRule, setSelectedGeoRule] = useState<GeoFencingRule | null>(null);
  const [geoRuleForm, setGeoRuleForm] = useState<CreateGeoFencingRuleDto & { id?: string }>({
    countryCode: '',
    countryName: '',
    isAllowed: true,
    blockReason: '',
    priority: 0,
    exemptedIps: [],
    exemptedUserIds: [],
  });
  const [isEditingGeoRule, setIsEditingGeoRule] = useState(false);
  const [geoRulesCurrentPage, setGeoRulesCurrentPage] = useState(1);
  const [geoRulesTotalPages, setGeoRulesTotalPages] = useState(1);
  const [geoRulesTotal, setGeoRulesTotal] = useState(0);
  const geoRulesPageSize = 10;

  // ==================== Geo-Fencing Logs States ====================
  const [geoLogs, setGeoLogs] = useState<GeoFencingLog[]>([]);
  const [geoLogsLoading, setGeoLogsLoading] = useState(false);
  const [geoLogsPage, setGeoLogsPage] = useState(1);
  const [geoLogsTotalPages, setGeoLogsTotalPages] = useState(1);
  const [geoLogsTotal, setGeoLogsTotal] = useState(0);
  const [geoLogsCountryFilter, setGeoLogsCountryFilter] = useState<string>('all');
  const [geoLogsAllowedFilter, setGeoLogsAllowedFilter] = useState<string>('all');
  const [geoStats, setGeoStats] = useState<GeoFencingStatsResponse | null>(null);
  const [geoStatsLoading, setGeoStatsLoading] = useState(false);
  const geoLogsPageSize = 10;

  const [actionLoading, setActionLoading] = useState(false);

  // ==================== Platform Fees Functions ====================
  const loadFees = useCallback(async () => {
    setFeesLoading(true);
    try {
      const response = await adminFeesApi.getAllFeeTiers(
        feeTypeFilter !== 'all' ? { feeType: feeTypeFilter as FeeType } : undefined
      );
      let filteredFees = response.data;

      if (feesSearchTerm) {
        filteredFees = filteredFees.filter(
          (fee) =>
            fee.name.toLowerCase().includes(feesSearchTerm.toLowerCase()) ||
            fee.description?.toLowerCase().includes(feesSearchTerm.toLowerCase())
        );
      }

      // Set total for pagination
      const totalCount = filteredFees.length;
      setFeesTotal(totalCount);
      setFeesTotalPages(Math.ceil(totalCount / feesPageSize));

      // Apply pagination
      const startIndex = (feesCurrentPage - 1) * feesPageSize;
      const endIndex = startIndex + feesPageSize;
      const paginatedFees = filteredFees.slice(startIndex, endIndex);

      setFees(paginatedFees);
    } catch (error: any) {
      console.error('Failed to load fees:', error);
      setSnackbarMsg({
        msg: `Failed to load fees: ${error.message || 'Unknown error'}`,
        type: 'error',
      });
      setFees([]);
      setFeesTotal(0);
      setFeesTotalPages(1);
    } finally {
      setFeesLoading(false);
    }
  }, [feesSearchTerm, feeTypeFilter, feesCurrentPage, feesPageSize, setSnackbarMsg]);

  const handleFeesSearch = (value: string) => {
    setFeesSearchTerm(value);
    setFeesCurrentPage(1); // Reset to first page when searching
  };

  const handleFeeTypeFilter = (value: string) => {
    setFeeTypeFilter(value);
    setFeesCurrentPage(1); // Reset to first page when filtering
  };

  const handleCreateOrUpdateFee = async () => {
    if (!feeForm.name || feeForm.feeRate === undefined || feeForm.minVolume === undefined) {
      setSnackbarMsg({
        msg: 'Please fill in all required fields',
        type: 'error',
      });
      return;
    }

    const errors = adminFeesApi.validateFeeTierData(feeForm);
    if (errors.length > 0) {
      setSnackbarMsg({
        msg: errors.join(', '),
        type: 'error',
      });
      return;
    }

    setFeeDialogOpen(false);
    setActionLoading(true);

    try {
      if (isEditingFee && feeForm.id) {
        const updateData: UpdateFeeTierDto = {
          name: feeForm.name,
          description: feeForm.description,
          minVolume: feeForm.minVolume,
          maxVolume: feeForm.maxVolume,
          feeRate: feeForm.feeRate,
          currency: feeForm.currency,
          minFeeAmount: feeForm.minFeeAmount,
          maxFeeAmount: feeForm.maxFeeAmount,
          flatFeeAmount: feeForm.flatFeeAmount,
          tierOrder: feeForm.tierOrder,
        };
        const response = await adminFeesApi.updateFeeTier(feeForm.id, updateData);
        setSnackbarMsg({
          msg: response.message || 'Fee tier updated successfully',
          type: 'success',
        });
      } else {
        const response = await adminFeesApi.createFeeTier(feeForm);
        setSnackbarMsg({
          msg: response.message || 'Fee tier created successfully',
          type: 'success',
        });
      }
      setFeeForm({
        feeType: FeeType.SPOT_TRADE,
        name: '',
        description: '',
        minVolume: 0,
        maxVolume: undefined,
        feeRate: 0,
        currency: '',
        minFeeAmount: undefined,
        maxFeeAmount: undefined,
        flatFeeAmount: undefined,
        tierOrder: 0,
      });
      setIsEditingFee(false);
      await loadFees();
    } catch (error: any) {
      console.error('Failed to save fee tier:', error);
      setSnackbarMsg({
        msg: `Failed to save fee tier: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFee = async () => {
    if (!selectedFee) return;

    setFeeDeleteDialogOpen(false);
    setActionLoading(true);

    try {
      const response = await adminFeesApi.deleteFeeTier(selectedFee.id);
      setSnackbarMsg({
        msg: response.message || 'Fee tier deleted successfully',
        type: 'success',
      });
      setSelectedFee(null);
      await loadFees();
    } catch (error: any) {
      console.error('Failed to delete fee tier:', error);
      setSnackbarMsg({
        msg: `Failed to delete fee tier: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeeActive = async (fee: PlatformFeeTier) => {
    setActionLoading(true);
    try {
      const response = await adminFeesApi.updateFeeTier(fee.id, {
        isActive: !fee.isActive,
      });
      setSnackbarMsg({
        msg: response.message || 'Fee tier status updated successfully',
        type: 'success',
      });
      await loadFees();
    } catch (error: any) {
      console.error('Failed to toggle fee tier status:', error);
      setSnackbarMsg({
        msg: `Failed to toggle fee tier status: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openFeeEditDialog = (fee: PlatformFeeTier) => {
    setFeeForm({
      id: fee.id,
      feeType: fee.feeType,
      name: fee.name,
      description: fee.description || '',
      minVolume: parseFloat(fee.minVolume),
      maxVolume: fee.maxVolume ? parseFloat(fee.maxVolume) : undefined,
      feeRate: parseFloat(fee.feeRate),
      currency: fee.currency || '',
      minFeeAmount: fee.minFeeAmount ? parseFloat(fee.minFeeAmount) : undefined,
      maxFeeAmount: fee.maxFeeAmount ? parseFloat(fee.maxFeeAmount) : undefined,
      flatFeeAmount: fee.flatFeeAmount ? parseFloat(fee.flatFeeAmount) : undefined,
      tierOrder: fee.tierOrder,
    });
    setIsEditingFee(true);
    setFeeDialogOpen(true);
  };

  const openFeeCreateDialog = () => {
    setFeeForm({
      feeType: FeeType.SPOT_TRADE,
      name: '',
      description: '',
      minVolume: 0,
      maxVolume: undefined,
      feeRate: 0,
      currency: '',
      minFeeAmount: undefined,
      maxFeeAmount: undefined,
      flatFeeAmount: undefined,
      tierOrder: 0,
    });
    setIsEditingFee(false);
    setFeeDialogOpen(true);
  };

  // ==================== Geo-Fencing Rules Functions ====================
  const loadGeoRules = useCallback(async () => {
    setGeoRulesLoading(true);
    try {
      const response = await adminGeoFencingApi.getAllRules();
      let filteredRules = response.data;

      if (geoRulesSearchTerm) {
        filteredRules = filteredRules.filter(
          (rule) =>
            rule.countryName.toLowerCase().includes(geoRulesSearchTerm.toLowerCase()) ||
            rule.countryCode.toLowerCase().includes(geoRulesSearchTerm.toLowerCase())
        );
      }

      if (geoRulesAllowedFilter !== 'all') {
        filteredRules = filteredRules.filter(
          (rule) => rule.isAllowed === (geoRulesAllowedFilter === 'allowed')
        );
      }

      // Set total for pagination
      const totalCount = filteredRules.length;
      setGeoRulesTotal(totalCount);
      setGeoRulesTotalPages(Math.ceil(totalCount / geoRulesPageSize));

      // Apply pagination
      const startIndex = (geoRulesCurrentPage - 1) * geoRulesPageSize;
      const endIndex = startIndex + geoRulesPageSize;
      const paginatedRules = filteredRules.slice(startIndex, endIndex);

      setGeoRules(paginatedRules);
    } catch (error: any) {
      console.error('Failed to load geo-fencing rules:', error);
      setSnackbarMsg({
        msg: `Failed to load geo-fencing rules: ${error.message || 'Unknown error'}`,
        type: 'error',
      });
      setGeoRules([]);
      setGeoRulesTotal(0);
      setGeoRulesTotalPages(1);
    } finally {
      setGeoRulesLoading(false);
    }
  }, [geoRulesSearchTerm, geoRulesAllowedFilter, geoRulesCurrentPage, geoRulesPageSize, setSnackbarMsg]);

  const handleGeoRulesSearch = (value: string) => {
    setGeoRulesSearchTerm(value);
    setGeoRulesCurrentPage(1); // Reset to first page when searching
  };

  const handleGeoRulesAllowedFilter = (value: string) => {
    setGeoRulesAllowedFilter(value);
    setGeoRulesCurrentPage(1); // Reset to first page when filtering
  };

  const handleCreateOrUpdateGeoRule = async () => {
    if (!geoRuleForm.countryCode || !geoRuleForm.countryName) {
      setSnackbarMsg({
        msg: 'Please fill in all required fields',
        type: 'error',
      });
      return;
    }

    if (!adminGeoFencingApi.validateCountryCode(geoRuleForm.countryCode.toUpperCase())) {
      setSnackbarMsg({
        msg: 'Country code must be a valid 2-letter ISO code (e.g., US, IN)',
        type: 'error',
      });
      return;
    }

    setGeoRuleDialogOpen(false);
    setActionLoading(true);

    try {
      if (isEditingGeoRule && geoRuleForm.id) {
        const updateData: UpdateGeoFencingRuleDto = {
          countryName: geoRuleForm.countryName,
          isAllowed: geoRuleForm.isAllowed,
          blockReason: geoRuleForm.blockReason,
          priority: geoRuleForm.priority,
          exemptedIps: geoRuleForm.exemptedIps,
          exemptedUserIds: geoRuleForm.exemptedUserIds,
        };
        const response = await adminGeoFencingApi.updateRule(geoRuleForm.id, updateData);
        setSnackbarMsg({
          msg: response.message || 'Geo-fencing rule updated successfully',
          type: 'success',
        });
      } else {
        const response = await adminGeoFencingApi.createRule({
          ...geoRuleForm,
          countryCode: geoRuleForm.countryCode.toUpperCase(),
        });
        setSnackbarMsg({
          msg: response.message || 'Geo-fencing rule created successfully',
          type: 'success',
        });
      }
      setGeoRuleForm({
        countryCode: '',
        countryName: '',
        isAllowed: true,
        blockReason: '',
        priority: 0,
        exemptedIps: [],
        exemptedUserIds: [],
      });
      setIsEditingGeoRule(false);
      await loadGeoRules();
    } catch (error: any) {
      console.error('Failed to save geo-fencing rule:', error);
      setSnackbarMsg({
        msg: `Failed to save geo-fencing rule: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGeoRule = async () => {
    if (!selectedGeoRule) return;

    setGeoRuleDeleteDialogOpen(false);
    setActionLoading(true);

    try {
      const response = await adminGeoFencingApi.deleteRule(selectedGeoRule.id);
      setSnackbarMsg({
        msg: response.message || 'Geo-fencing rule deleted successfully',
        type: 'success',
      });
      setSelectedGeoRule(null);
      await loadGeoRules();
    } catch (error: any) {
      console.error('Failed to delete geo-fencing rule:', error);
      setSnackbarMsg({
        msg: `Failed to delete geo-fencing rule: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleGeoRuleActive = async (rule: GeoFencingRule) => {
    setActionLoading(true);
    try {
      const response = await adminGeoFencingApi.updateRule(rule.id, {
        isActive: !rule.isActive,
      });
      setSnackbarMsg({
        msg: response.message || 'Geo-fencing rule status updated successfully',
        type: 'success',
      });
      await loadGeoRules();
    } catch (error: any) {
      console.error('Failed to toggle geo-fencing rule status:', error);
      setSnackbarMsg({
        msg: `Failed to toggle geo-fencing rule status: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openGeoRuleEditDialog = (rule: GeoFencingRule) => {
    setGeoRuleForm({
      id: rule.id,
      countryCode: rule.countryCode,
      countryName: rule.countryName,
      isAllowed: rule.isAllowed,
      blockReason: rule.blockReason || '',
      priority: rule.priority,
      exemptedIps: rule.exemptedIps || [],
      exemptedUserIds: rule.exemptedUserIds || [],
    });
    setIsEditingGeoRule(true);
    setGeoRuleDialogOpen(true);
  };

  const openGeoRuleCreateDialog = () => {
    setGeoRuleForm({
      countryCode: '',
      countryName: '',
      isAllowed: true,
      blockReason: '',
      priority: 0,
      exemptedIps: [],
      exemptedUserIds: [],
    });
    setIsEditingGeoRule(false);
    setGeoRuleDialogOpen(true);
  };

  // ==================== Geo-Fencing Logs Functions ====================
  const loadGeoLogs = useCallback(async () => {
    setGeoLogsLoading(true);
    try {
      const params: GetLogsParams = {
        page: geoLogsPage,
        limit: geoLogsPageSize,
        countryCode: geoLogsCountryFilter !== 'all' ? geoLogsCountryFilter : undefined,
        isAllowed: geoLogsAllowedFilter !== 'all' ? geoLogsAllowedFilter === 'allowed' : undefined,
      };

      const response = await adminGeoFencingApi.getLogs(params);
      setGeoLogs(response.data);
      setGeoLogsTotal(response.pagination.totalCount);
      setGeoLogsTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      console.error('Failed to load geo-fencing logs:', error);
      setSnackbarMsg({
        msg: `Failed to load geo-fencing logs: ${error.message || 'Unknown error'}`,
        type: 'error',
      });
      setGeoLogs([]);
      setGeoLogsTotalPages(1);
      setGeoLogsTotal(0);
    } finally {
      setGeoLogsLoading(false);
    }
  }, [geoLogsPage, geoLogsPageSize, geoLogsCountryFilter, geoLogsAllowedFilter, setSnackbarMsg]);

  const loadGeoStats = useCallback(async () => {
    setGeoStatsLoading(true);
    try {
      const stats = await adminGeoFencingApi.getLastNDaysStats(7);
      setGeoStats(stats);
    } catch (error: any) {
      console.error('Failed to load geo-fencing statistics:', error);
      setGeoStats(null);
    } finally {
      setGeoStatsLoading(false);
    }
  }, []);

  // ==================== Load Data on Tab Change ====================
  useEffect(() => {
    if (activeTab === 'fees') {
      loadFees();
    } else if (activeTab === 'geo-rules') {
      loadGeoRules();
    } else if (activeTab === 'geo-logs') {
      loadGeoLogs();
      loadGeoStats();
    }
  }, [activeTab, loadFees, loadGeoRules, loadGeoLogs, loadGeoStats]);

  // ==================== Utility Functions ====================
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatShortDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatFeeDisplay = (fee: PlatformFeeTier) => {
    return adminFeesApi.formatFeeTierDisplay(fee);
  };

  const uniqueCountries = [...new Set(geoLogs.map((log) => log.countryCode).filter(Boolean))].sort();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Advanced Settings"
        description="Manage platform fee tiers with volume-based pricing and geo-fencing rules"
      >
        <div className="flex gap-2 my-0">
          <RefreshButton
            onClick={() => {
              if (activeTab === 'fees') loadFees();
              else if (activeTab === 'geo-rules') loadGeoRules();
              else if (activeTab === 'geo-logs') {
                loadGeoLogs();
                loadGeoStats();
              }
            }}
          />
          {activeTab === 'fees' && (
            <Button size="sm" onClick={openFeeCreateDialog}>
              <Plus className="p-0" />
              New Fee Tier
            </Button>
          )}
          {activeTab === 'geo-rules' && (
            <Button size="sm" onClick={openGeoRuleCreateDialog}>
              <Plus className="p-0" />
              New Rule
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6 space-y-6">
          {/* Tab Navigation */}
          <div className="bg-gray-800 rounded-lg p-1 inline-flex space-x-1">
            <button
              onClick={() => setActiveTab('fees')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'fees'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Fee Tiers
            </button>
            <button
              onClick={() => setActiveTab('geo-rules')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'geo-rules'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Globe className="h-4 w-4" />
              Geo-Fencing Rules
            </button>
            <button
              onClick={() => setActiveTab('geo-logs')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'geo-logs'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Activity className="h-4 w-4" />
              Access Logs
            </button>
          </div>

          {/* Platform Fees Tab */}
          {activeTab === 'fees' && (
            <div
              style={{ height: 'calc(100vh - 180px)' }}
              className="bg-gray-800 rounded-lg p-6 flex flex-col"
            >
              {/* Filters */}
              <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search fees..."
                    value={feesSearchTerm}
                    onChange={(e) => handleFeesSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="w-40">
                  <Select value={feeTypeFilter} onValueChange={handleFeeTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Fee Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value={FeeType.SPOT_TRADE}>Spot Trade</SelectItem>
                      <SelectItem value={FeeType.PERPS_TRADE}>Perps Trade</SelectItem>
                      <SelectItem value={FeeType.WITHDRAWAL}>Withdrawal</SelectItem>
                      <SelectItem value={FeeType.DEPOSIT}>Deposit</SelectItem>
                      <SelectItem value={FeeType.TRANSFER}>Transfer</SelectItem>
                      <SelectItem value={FeeType.OTHER}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-400">
                  {fees.length} fee{fees.length !== 1 ? 's' : ''} found
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-auto rounded-lg border border-gray-700/50">
                  <table className="w-full">
                    <TableHeader
                      headers={[
                        'Name',
                        'Type',
                        'Volume Range',
                        'Fee Amount',
                        'Tier Order',
                        'Status',
                        'Actions',
                      ]}
                    />
                    <tbody>
                      {feesLoading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8">
                            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-gray-400" />
                            <div className="text-gray-400">Loading fees...</div>
                          </td>
                        </tr>
                      ) : fees.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-400">
                            No fees found
                          </td>
                        </tr>
                      ) : (
                        fees.map((fee) => (
                          <tr
                            key={fee.id}
                            className="border-b border-gray-700/50 hover:bg-gray-700/20"
                          >
                            <td className="py-3 px-4 font-medium text-white">{fee.name}</td>
                            <td className="py-3 px-4 text-gray-300">
                              {fee.feeType.replace('_', ' ')}
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              {adminFeesApi.formatVolumeRange(fee)}
                            </td>
                            <td className="py-3 px-4 text-gray-300">{formatFeeDisplay(fee)}</td>
                            <td className="py-3 px-4 text-gray-300">{fee.tierOrder}</td>
                            <td className="py-3 px-4">
                              {fee.isActive ? (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => {
                                    setSelectedFee(fee);
                                    setFeeDetailsDialogOpen(true);
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-white h-8 w-8 p-0"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => openFeeEditDialog(fee)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleToggleFeeActive(fee)}
                                  variant="outline"
                                  size="sm"
                                  disabled={actionLoading}
                                  className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200"
                                  title={fee.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  {fee.isActive ? (
                                    <ToggleRight className="h-4 w-4" />
                                  ) : (
                                    <ToggleLeft className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedFee(fee);
                                    setFeeDeleteDialogOpen(true);
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                  title="Delete"
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
              {feesTotalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4 flex-shrink-0">
                  <div className="text-sm text-gray-400">
                    Page {feesCurrentPage} of {feesTotalPages} (Total: {feesTotal} fee{feesTotal !== 1 ? 's' : ''})
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFeesCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={feesCurrentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFeesCurrentPage((p) => Math.min(feesTotalPages, p + 1))}
                      disabled={feesCurrentPage >= feesTotalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Geo-Fencing Rules Tab */}
          {activeTab === 'geo-rules' && (
            <div
              style={{ height: 'calc(100vh - 180px)' }}
              className="bg-gray-800 rounded-lg p-6 flex flex-col"
            >
              {/* Filters */}
              <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search countries..."
                    value={geoRulesSearchTerm}
                    onChange={(e) => handleGeoRulesSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="w-40">
                  <Select value={geoRulesAllowedFilter} onValueChange={handleGeoRulesAllowedFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Access Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="allowed">Allowed</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-400">
                  {geoRules.length} rule{geoRules.length !== 1 ? 's' : ''} found
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-auto rounded-lg border border-gray-700/50">
                  <table className="w-full">
                    <TableHeader
                      headers={[
                        'Country',
                        'Code',
                        'Access',
                        'Priority',
                        'Status',
                        'Exempted IPs',
                        'Actions',
                      ]}
                    />
                    <tbody>
                      {geoRulesLoading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8">
                            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-gray-400" />
                            <div className="text-gray-400">Loading rules...</div>
                          </td>
                        </tr>
                      ) : geoRules.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-400">
                            No rules found
                          </td>
                        </tr>
                      ) : (
                        geoRules.map((rule) => (
                          <tr
                            key={rule.id}
                            className="border-b border-gray-700/50 hover:bg-gray-700/20"
                          >
                            <td className="py-3 px-4 font-medium text-white">
                              {rule.countryName}
                            </td>
                            <td className="py-3 px-4 text-gray-300 font-mono">
                              {rule.countryCode}
                            </td>
                            <td className="py-3 px-4">
                              {rule.isAllowed ? (
                                <Badge className="bg-green-100 text-green-800">Allowed</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">Blocked</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-300">{rule.priority}</td>
                            <td className="py-3 px-4">
                              {rule.isActive ? (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              {rule.exemptedIps?.length || 0}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => {
                                    setSelectedGeoRule(rule);
                                    setGeoRuleDetailsDialogOpen(true);
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-white h-8 w-8 p-0"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => openGeoRuleEditDialog(rule)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleToggleGeoRuleActive(rule)}
                                  variant="outline"
                                  size="sm"
                                  disabled={actionLoading}
                                  className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200"
                                  title={rule.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  {rule.isActive ? (
                                    <ToggleRight className="h-4 w-4" />
                                  ) : (
                                    <ToggleLeft className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedGeoRule(rule);
                                    setGeoRuleDeleteDialogOpen(true);
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                  title="Delete"
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
              {geoRulesTotalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4 flex-shrink-0">
                  <div className="text-sm text-gray-400">
                    Page {geoRulesCurrentPage} of {geoRulesTotalPages} (Total: {geoRulesTotal} rule{geoRulesTotal !== 1 ? 's' : ''})
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGeoRulesCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={geoRulesCurrentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGeoRulesCurrentPage((p) => Math.min(geoRulesTotalPages, p + 1))}
                      disabled={geoRulesCurrentPage >= geoRulesTotalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Geo-Fencing Logs Tab */}
          {activeTab === 'geo-logs' && (
            <div
              style={{ height: 'calc(100vh - 180px)' }}
              className="bg-gray-800 rounded-lg p-6 flex flex-col"
            >
              {/* Statistics Cards */}
              {geoStats && !geoStatsLoading && (
                <div className="grid grid-cols-4 gap-4 mb-6 flex-shrink-0">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Total Requests</div>
                    <div className="text-2xl font-bold text-white">{geoStats.totalRequests}</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Allowed</div>
                    <div className="text-2xl font-bold text-green-400">
                      {geoStats.allowedRequests}
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Blocked</div>
                    <div className="text-2xl font-bold text-red-400">
                      {geoStats.blockedRequests}
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Block Rate</div>
                    <div className="text-2xl font-bold text-white">{geoStats.blockRate}</div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                <div className="w-40">
                  <Select value={geoLogsCountryFilter} onValueChange={setGeoLogsCountryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {uniqueCountries.map((country) => (
                        <SelectItem key={country} value={country as string}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-40">
                  <Select value={geoLogsAllowedFilter} onValueChange={setGeoLogsAllowedFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Access Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="allowed">Allowed</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-400">
                  {geoLogsTotal} log{geoLogsTotal !== 1 ? 's' : ''} found
                </div>
              </div>

              {/* Logs Table */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-auto rounded-lg border border-gray-700/50">
                  <table className="w-full">
                    <TableHeader
                      headers={[
                        'Time',
                        'IP Address',
                        'Country',
                        'City',
                        'Status',
                        'Request',
                        'Block Reason',
                      ]}
                    />
                    <tbody>
                      {geoLogsLoading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8">
                            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-gray-400" />
                            <div className="text-gray-400">Loading logs...</div>
                          </td>
                        </tr>
                      ) : geoLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-400">
                            No logs found
                          </td>
                        </tr>
                      ) : (
                        geoLogs.map((log) => (
                          <tr
                            key={log.id}
                            className="border-b border-gray-700/50 hover:bg-gray-700/20"
                          >
                            <td className="py-3 px-4 text-gray-300 text-sm">
                              {formatDate(log.createdAt)}
                            </td>
                            <td className="py-3 px-4 text-gray-300 font-mono text-sm">
                              {log.ipAddress}
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              <div>{log.countryName || 'Unknown'}</div>
                              <div className="text-xs text-gray-500 font-mono">
                                {log.countryCode || 'N/A'}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-400 text-sm">
                              {log.city || 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              {log.isAllowed ? (
                                <Badge className="bg-green-100 text-green-800">Allowed</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">Blocked</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-400 text-sm">
                              <div className="font-mono text-xs">
                                {log.requestMethod} {log.requestPath}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-400 text-sm">
                              {log.blockReason || 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {geoLogsTotalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4 flex-shrink-0">
                  <div className="text-sm text-gray-400">
                    Page {geoLogsPage} of {geoLogsTotalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGeoLogsPage((p) => Math.max(1, p - 1))}
                      disabled={geoLogsPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGeoLogsPage((p) => Math.min(geoLogsTotalPages, p + 1))}
                      disabled={geoLogsPage >= geoLogsTotalPages}
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

      {/* Fee Create/Edit Dialog */}
      <Dialog open={feeDialogOpen} onOpenChange={setFeeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {isEditingFee ? 'Edit Fee Tier' : 'Create Fee Tier'}
            </DialogTitle>
            <DialogDescription>
              {isEditingFee ? 'Update the fee tier configuration' : 'Create a new fee tier with volume-based pricing'}
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
                  value={feeForm.name}
                  onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })}
                  placeholder="e.g., Standard Trading Fee"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="feeType">
                  Fee Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={feeForm.feeType}
                  onValueChange={(value: FeeType) => setFeeForm({ ...feeForm, feeType: value })}
                  disabled={isEditingFee}
                >
                  <SelectTrigger id="feeType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FeeType.SPOT_TRADE}>Spot Trade</SelectItem>
                    <SelectItem value={FeeType.PERPS_TRADE}>Perps Trade</SelectItem>
                    <SelectItem value={FeeType.WITHDRAWAL}>Withdrawal</SelectItem>
                    <SelectItem value={FeeType.DEPOSIT}>Deposit</SelectItem>
                    <SelectItem value={FeeType.TRANSFER}>Transfer</SelectItem>
                    <SelectItem value={FeeType.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={feeForm.description}
                onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                placeholder="Enter fee description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="minVolume">
                  Min Volume <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="minVolume"
                  type="number"
                  step="0.01"
                  value={feeForm.minVolume}
                  onChange={(e) =>
                    setFeeForm({ ...feeForm, minVolume: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
                <p className="text-xs text-gray-400">Minimum transaction volume for this tier</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxVolume">Max Volume</Label>
                <Input
                  id="maxVolume"
                  type="number"
                  step="0.01"
                  value={feeForm.maxVolume || ''}
                  onChange={(e) =>
                    setFeeForm({
                      ...feeForm,
                      maxVolume: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="Leave empty for unlimited"
                />
                <p className="text-xs text-gray-400">Maximum volume (empty = unlimited)</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="feeRate">
                  Fee Rate <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="feeRate"
                  type="number"
                  step="0.0001"
                  value={feeForm.feeRate}
                  onChange={(e) =>
                    setFeeForm({ ...feeForm, feeRate: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.002"
                />
                <p className="text-xs text-gray-400">
                  {adminFeesApi.feeRateToPercentage(feeForm.feeRate).toFixed(2)}%
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={feeForm.currency}
                  onChange={(e) => setFeeForm({ ...feeForm, currency: e.target.value })}
                  placeholder="e.g., BTC, ETH"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tierOrder">Tier Order</Label>
                <Input
                  id="tierOrder"
                  type="number"
                  value={feeForm.tierOrder}
                  onChange={(e) =>
                    setFeeForm({ ...feeForm, tierOrder: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
                <p className="text-xs text-gray-400">Display order</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="minFeeAmount">Min Fee Amount</Label>
                <Input
                  id="minFeeAmount"
                  type="number"
                  step="0.00000001"
                  value={feeForm.minFeeAmount || ''}
                  onChange={(e) =>
                    setFeeForm({
                      ...feeForm,
                      minFeeAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="Optional"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxFeeAmount">Max Fee Amount</Label>
                <Input
                  id="maxFeeAmount"
                  type="number"
                  step="0.00000001"
                  value={feeForm.maxFeeAmount || ''}
                  onChange={(e) =>
                    setFeeForm({
                      ...feeForm,
                      maxFeeAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="Optional"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="flatFeeAmount">Flat Fee Amount</Label>
                <Input
                  id="flatFeeAmount"
                  type="number"
                  step="0.00000001"
                  value={feeForm.flatFeeAmount || ''}
                  onChange={(e) =>
                    setFeeForm({
                      ...feeForm,
                      flatFeeAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFeeDialogOpen(false);
                setFeeForm({
                  feeType: FeeType.SPOT_TRADE,
                  name: '',
                  description: '',
                  minVolume: 0,
                  maxVolume: undefined,
                  feeRate: 0,
                  currency: '',
                  minFeeAmount: undefined,
                  maxFeeAmount: undefined,
                  flatFeeAmount: undefined,
                  tierOrder: 0,
                });
                setIsEditingFee(false);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdateFee} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {isEditingFee ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditingFee ? (
                'Update Tier'
              ) : (
                'Create Tier'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fee Details Dialog */}
      <Dialog open={feeDetailsDialogOpen} onOpenChange={setFeeDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fee Tier Details
            </DialogTitle>
          </DialogHeader>
          {selectedFee && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Name</Label>
                  <p className="text-white mt-1">{selectedFee.name}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Type</Label>
                  <p className="text-white mt-1">{selectedFee.feeType.replace('_', ' ')}</p>
                </div>
              </div>
              {selectedFee.description && (
                <div>
                  <Label className="text-gray-400">Description</Label>
                  <p className="text-white mt-1">{selectedFee.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Volume Range</Label>
                  <p className="text-white mt-1">{adminFeesApi.formatVolumeRange(selectedFee)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Fee Rate</Label>
                  <p className="text-white mt-1">
                    {selectedFee.feeRate} ({adminFeesApi.feeRateToPercentage(parseFloat(selectedFee.feeRate)).toFixed(2)}%)
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-400">Currency</Label>
                  <p className="text-white mt-1">{selectedFee.currency || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Tier Order</Label>
                  <p className="text-white mt-1">{selectedFee.tierOrder}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Fee Display</Label>
                  <p className="text-white mt-1">{formatFeeDisplay(selectedFee)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-400">Min Fee</Label>
                  <p className="text-white mt-1">{selectedFee.minFeeAmount || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Max Fee</Label>
                  <p className="text-white mt-1">{selectedFee.maxFeeAmount || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Flat Fee</Label>
                  <p className="text-white mt-1">{selectedFee.flatFeeAmount || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-gray-400">Status</Label>
                  <div className="mt-1">
                    {selectedFee.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Created</Label>
                  <p className="text-white mt-1 text-sm">{formatDate(selectedFee.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Updated</Label>
                  <p className="text-white mt-1 text-sm">{formatDate(selectedFee.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFeeDetailsDialogOpen(false);
                setSelectedFee(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fee Delete Dialog */}
      <Dialog open={feeDeleteDialogOpen} onOpenChange={setFeeDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Fee Tier
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the fee tier "<span className="font-semibold">{selectedFee?.name}</span>"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFeeDeleteDialogOpen(false);
                setSelectedFee(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFee} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Geo-Fencing Rule Create/Edit Dialog */}
      <Dialog open={geoRuleDialogOpen} onOpenChange={setGeoRuleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {isEditingGeoRule ? 'Edit Geo-Fencing Rule' : 'Create Geo-Fencing Rule'}
            </DialogTitle>
            <DialogDescription>
              {isEditingGeoRule ? 'Update the geo-fencing rule' : 'Create a new geo-fencing rule'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="countryCode">
                  Country Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="countryCode"
                  value={geoRuleForm.countryCode}
                  onChange={(e) =>
                    setGeoRuleForm({ ...geoRuleForm, countryCode: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., US, IN"
                  maxLength={2}
                  disabled={isEditingGeoRule}
                />
                <p className="text-xs text-gray-400">2-letter ISO code</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="countryName">
                  Country Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="countryName"
                  value={geoRuleForm.countryName}
                  onChange={(e) => setGeoRuleForm({ ...geoRuleForm, countryName: e.target.value })}
                  placeholder="e.g., United States"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="isAllowed">Access Type</Label>
                <Select
                  value={geoRuleForm.isAllowed ? 'allowed' : 'blocked'}
                  onValueChange={(value) =>
                    setGeoRuleForm({ ...geoRuleForm, isAllowed: value === 'allowed' })
                  }
                >
                  <SelectTrigger id="isAllowed">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allowed">Allowed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={geoRuleForm.priority}
                  onChange={(e) =>
                    setGeoRuleForm({ ...geoRuleForm, priority: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
              </div>
            </div>
            {!geoRuleForm.isAllowed && (
              <div className="grid gap-2">
                <Label htmlFor="blockReason">Block Reason</Label>
                <Textarea
                  id="blockReason"
                  value={geoRuleForm.blockReason}
                  onChange={(e) => setGeoRuleForm({ ...geoRuleForm, blockReason: e.target.value })}
                  placeholder="Enter reason for blocking this country..."
                  rows={3}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="exemptedIps">Exempted IPs (one per line)</Label>
              <Textarea
                id="exemptedIps"
                value={(geoRuleForm.exemptedIps || []).join('\n')}
                onChange={(e) =>
                  setGeoRuleForm({
                    ...geoRuleForm,
                    exemptedIps: e.target.value.split('\n').filter((ip) => ip.trim()),
                  })
                }
                placeholder="192.168.1.1&#10;10.0.0.1"
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="exemptedUserIds">Exempted User IDs (one per line)</Label>
              <Textarea
                id="exemptedUserIds"
                value={(geoRuleForm.exemptedUserIds || []).join('\n')}
                onChange={(e) =>
                  setGeoRuleForm({
                    ...geoRuleForm,
                    exemptedUserIds: e.target.value.split('\n').filter((id) => id.trim()),
                  })
                }
                placeholder="user-id-1&#10;user-id-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setGeoRuleDialogOpen(false);
                setGeoRuleForm({
                  countryCode: '',
                  countryName: '',
                  isAllowed: true,
                  blockReason: '',
                  priority: 0,
                  exemptedIps: [],
                  exemptedUserIds: [],
                });
                setIsEditingGeoRule(false);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdateGeoRule} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {isEditingGeoRule ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditingGeoRule ? (
                'Update Rule'
              ) : (
                'Create Rule'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Geo-Fencing Rule Details Dialog */}
      <Dialog open={geoRuleDetailsDialogOpen} onOpenChange={setGeoRuleDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Geo-Fencing Rule Details
            </DialogTitle>
          </DialogHeader>
          {selectedGeoRule && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Country</Label>
                  <p className="text-white mt-1">{selectedGeoRule.countryName}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Country Code</Label>
                  <p className="text-white mt-1 font-mono">{selectedGeoRule.countryCode}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-400">Access Type</Label>
                  <div className="mt-1">
                    {selectedGeoRule.isAllowed ? (
                      <Badge className="bg-green-100 text-green-800">Allowed</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Blocked</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400">Status</Label>
                  <div className="mt-1">
                    {selectedGeoRule.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400">Priority</Label>
                  <p className="text-white mt-1">{selectedGeoRule.priority}</p>
                </div>
              </div>
              {selectedGeoRule.blockReason && (
                <div>
                  <Label className="text-gray-400">Block Reason</Label>
                  <p className="text-white mt-1">{selectedGeoRule.blockReason}</p>
                </div>
              )}
              {selectedGeoRule.exemptedIps && selectedGeoRule.exemptedIps.length > 0 && (
                <div>
                  <Label className="text-gray-400">
                    Exempted IPs ({selectedGeoRule.exemptedIps.length})
                  </Label>
                  <div className="mt-2 bg-gray-900 rounded-lg p-4 max-h-32 overflow-y-auto">
                    {selectedGeoRule.exemptedIps.map((ip, idx) => (
                      <div key={idx} className="text-white font-mono text-sm">
                        {ip}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedGeoRule.exemptedUserIds && selectedGeoRule.exemptedUserIds.length > 0 && (
                <div>
                  <Label className="text-gray-400">
                    Exempted Users ({selectedGeoRule.exemptedUserIds.length})
                  </Label>
                  <div className="mt-2 bg-gray-900 rounded-lg p-4 max-h-32 overflow-y-auto">
                    {selectedGeoRule.exemptedUserIds.map((userId, idx) => (
                      <div key={idx} className="text-white font-mono text-sm">
                        {userId}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Created</Label>
                  <p className="text-white mt-1 text-sm">{formatDate(selectedGeoRule.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Updated</Label>
                  <p className="text-white mt-1 text-sm">{formatDate(selectedGeoRule.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setGeoRuleDetailsDialogOpen(false);
                setSelectedGeoRule(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Geo-Fencing Rule Delete Dialog */}
      <Dialog open={geoRuleDeleteDialogOpen} onOpenChange={setGeoRuleDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Geo-Fencing Rule
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the rule for "
              <span className="font-semibold">{selectedGeoRule?.countryName}</span>"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setGeoRuleDeleteDialogOpen(false);
                setSelectedGeoRule(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGeoRule} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAdvancedSettingsView;
