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
  X,
  FileText,
  HelpCircle,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  adminBasicApi,
  type TermsAndConditions,
  type CreateTermsDto,
  type UpdateTermsDto,
  type FaqItem,
  type CreateFaqDto,
  type UpdateFaqDto,
  type ContactUsSubmission,
  type UpdateContactUsDto,
  type GetContactUsParams,
} from '@/services/admin-basic.api';
import RefreshButton from '@/components/common/RefreshButton';
import { useSnackbarMsg } from '@/hooks/snackbar';
import TableHeader from '@/components/common/TableHeader';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const AdminCommunicationView: React.FC = () => {
  const [, setSnackbarMsg] = useSnackbarMsg();
  const [activeTab, setActiveTab] = useState('contact-us');

  // ==================== Terms & Conditions States ====================
  const [terms, setTerms] = useState<TermsAndConditions[]>([]);
  const [termsLoading, setTermsLoading] = useState(false);
  const [termsSearchTerm, setTermsSearchTerm] = useState('');
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [termsDetailsDialogOpen, setTermsDetailsDialogOpen] = useState(false);
  const [termsDeleteDialogOpen, setTermsDeleteDialogOpen] = useState(false);
  const [selectedTerms, setSelectedTerms] = useState<TermsAndConditions | null>(null);
  const [termsForm, setTermsForm] = useState<CreateTermsDto & { id?: string; }>({
    title: '',
    content: '',
    version: '',
  });
  const [isEditingTerms, setIsEditingTerms] = useState(false);

  // ==================== FAQs States ====================
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(false);
  const [faqsSearchTerm, setFaqsSearchTerm] = useState('');
  const [faqsCategoryFilter, setFaqsCategoryFilter] = useState<string>('all');
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [faqDetailsDialogOpen, setFaqDetailsDialogOpen] = useState(false);
  const [faqDeleteDialogOpen, setFaqDeleteDialogOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
  const [faqForm, setFaqForm] = useState<CreateFaqDto & { id?: string; }>({
    question: '',
    answer: '',
    category: '',
    order: 0,
  });
  const [isEditingFaq, setIsEditingFaq] = useState(false);

  // ==================== Contact Us States ====================
  const [contactUsSubmissions, setContactUsSubmissions] = useState<ContactUsSubmission[]>([]);
  const [contactUsLoading, setContactUsLoading] = useState(false);
  const [contactUsPage, setContactUsPage] = useState(1);
  const [contactUsTotalPages, setContactUsTotalPages] = useState(1);
  const [contactUsTotal, setContactUsTotal] = useState(0);
  const [contactUsSearchTerm, setContactUsSearchTerm] = useState('');
  const [contactUsStatusFilter, setContactUsStatusFilter] = useState<string>('all');
  const [contactUsDetailsDialogOpen, setContactUsDetailsDialogOpen] = useState(false);
  const [contactUsUpdateDialogOpen, setContactUsUpdateDialogOpen] = useState(false);
  const [contactUsDeleteDialogOpen, setContactUsDeleteDialogOpen] = useState(false);
  const [selectedContactUs, setSelectedContactUs] = useState<ContactUsSubmission | null>(null);
  const [contactUsUpdateForm, setContactUsUpdateForm] = useState<UpdateContactUsDto>({
    status: undefined,
    response: '',
  });
  const contactUsPageSize = 10;

  const [actionLoading, setActionLoading] = useState(false);

  // ==================== Terms & Conditions Functions ====================
  const loadTerms = useCallback(async () => {
    setTermsLoading(true);
    try {
      const response = await adminBasicApi.getAllTerms();
      let filteredTerms = response.data;

      if (termsSearchTerm) {
        filteredTerms = filteredTerms.filter(
          (term) =>
            term.title.toLowerCase().includes(termsSearchTerm.toLowerCase()) ||
            term.version.toLowerCase().includes(termsSearchTerm.toLowerCase())
        );
      }

      setTerms(filteredTerms);
    } catch (error: any) {
      console.error('Failed to load terms:', error);
      setSnackbarMsg({
        msg: `Failed to load terms: ${error.message || 'Unknown error'}`,
        type: 'error',
      });
      setTerms([]);
    } finally {
      setTermsLoading(false);
    }
  }, [termsSearchTerm, setSnackbarMsg]);

  const handleCreateOrUpdateTerms = async () => {
    if (!termsForm.title || !termsForm.content) {
      setSnackbarMsg({
        msg: 'Please fill in all required fields',
        type: 'error',
      });
      return;
    }

    setTermsDialogOpen(false);
    setActionLoading(true);

    try {
      if (isEditingTerms && termsForm.id) {
        const updateData: UpdateTermsDto = {
          title: termsForm.title,
          content: termsForm.content,
          version: termsForm.version,
        };
        const response = await adminBasicApi.updateTerms(termsForm.id, updateData);
        setSnackbarMsg({
          msg: response.message || 'Terms updated successfully',
          type: 'success',
        });
      } else {
        const response = await adminBasicApi.createTerms(termsForm);
        setSnackbarMsg({
          msg: response.message || 'Terms created successfully',
          type: 'success',
        });
      }
      setTermsForm({ title: '', content: '', version: '' });
      setIsEditingTerms(false);
      await loadTerms();
    } catch (error: any) {
      console.error('Failed to save terms:', error);
      setSnackbarMsg({
        msg: `Failed to save terms: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTerms = async () => {
    if (!selectedTerms) return;

    setTermsDeleteDialogOpen(false);
    setActionLoading(true);

    try {
      const response = await adminBasicApi.deleteTerms(selectedTerms.id);
      setSnackbarMsg({
        msg: response.message || 'Terms deleted successfully',
        type: 'success',
      });
      setSelectedTerms(null);
      await loadTerms();
    } catch (error: any) {
      console.error('Failed to delete terms:', error);
      setSnackbarMsg({
        msg: `Failed to delete terms: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTermsActive = async (termsItem: TermsAndConditions) => {
    setActionLoading(true);
    try {
      const response = await adminBasicApi.updateTerms(termsItem.id, {
        isActive: !termsItem.isActive,
      });
      setSnackbarMsg({
        msg: response.message || 'Terms status updated successfully',
        type: 'success',
      });
      await loadTerms();
    } catch (error: any) {
      console.error('Failed to toggle terms status:', error);
      setSnackbarMsg({
        msg: `Failed to toggle terms status: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openTermsEditDialog = (termsItem: TermsAndConditions) => {
    setTermsForm({
      id: termsItem.id,
      title: termsItem.title,
      content: termsItem.content,
      version: termsItem.version,
    });
    setIsEditingTerms(true);
    setTermsDialogOpen(true);
  };

  const openTermsCreateDialog = () => {
    setTermsForm({ title: '', content: '', version: '' });
    setIsEditingTerms(false);
    setTermsDialogOpen(true);
  };

  // ==================== FAQs Functions ====================
  const loadFaqs = useCallback(async () => {
    setFaqsLoading(true);
    try {
      const response = await adminBasicApi.getAllFaqs();
      let filteredFaqs = response.data;

      if (faqsSearchTerm) {
        filteredFaqs = filteredFaqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(faqsSearchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(faqsSearchTerm.toLowerCase())
        );
      }

      if (faqsCategoryFilter !== 'all') {
        filteredFaqs = filteredFaqs.filter((faq) => faq.category === faqsCategoryFilter);
      }

      setFaqs(filteredFaqs);
    } catch (error: any) {
      console.error('Failed to load FAQs:', error);
      setSnackbarMsg({
        msg: `Failed to load FAQs: ${error.message || 'Unknown error'}`,
        type: 'error',
      });
      setFaqs([]);
    } finally {
      setFaqsLoading(false);
    }
  }, [faqsSearchTerm, faqsCategoryFilter, setSnackbarMsg]);

  const handleCreateOrUpdateFaq = async () => {
    if (!faqForm.question || !faqForm.answer) {
      setSnackbarMsg({
        msg: 'Please fill in all required fields',
        type: 'error',
      });
      return;
    }

    setFaqDialogOpen(false);
    setActionLoading(true);

    try {
      if (isEditingFaq && faqForm.id) {
        const updateData: UpdateFaqDto = {
          question: faqForm.question,
          answer: faqForm.answer,
          category: faqForm.category,
          order: faqForm.order,
        };
        const response = await adminBasicApi.updateFaq(faqForm.id, updateData);
        setSnackbarMsg({
          msg: response.message || 'FAQ updated successfully',
          type: 'success',
        });
      } else {
        const response = await adminBasicApi.createFaq(faqForm);
        setSnackbarMsg({
          msg: response.message || 'FAQ created successfully',
          type: 'success',
        });
      }
      setFaqForm({ question: '', answer: '', category: '', order: 0 });
      setIsEditingFaq(false);
      await loadFaqs();
    } catch (error: any) {
      console.error('Failed to save FAQ:', error);
      setSnackbarMsg({
        msg: `Failed to save FAQ: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFaq = async () => {
    if (!selectedFaq) return;

    setFaqDeleteDialogOpen(false);
    setActionLoading(true);

    try {
      const response = await adminBasicApi.deleteFaq(selectedFaq.id);
      setSnackbarMsg({
        msg: response.message || 'FAQ deleted successfully',
        type: 'success',
      });
      setSelectedFaq(null);
      await loadFaqs();
    } catch (error: any) {
      console.error('Failed to delete FAQ:', error);
      setSnackbarMsg({
        msg: `Failed to delete FAQ: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFaqActive = async (faqItem: FaqItem) => {
    setActionLoading(true);
    try {
      const response = await adminBasicApi.updateFaq(faqItem.id, {
        isActive: !faqItem.isActive,
      });
      setSnackbarMsg({
        msg: response.message || 'FAQ status updated successfully',
        type: 'success',
      });
      await loadFaqs();
    } catch (error: any) {
      console.error('Failed to toggle FAQ status:', error);
      setSnackbarMsg({
        msg: `Failed to toggle FAQ status: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openFaqEditDialog = (faqItem: FaqItem) => {
    setFaqForm({
      id: faqItem.id,
      question: faqItem.question,
      answer: faqItem.answer,
      category: faqItem.category || '',
      order: faqItem.order,
    });
    setIsEditingFaq(true);
    setFaqDialogOpen(true);
  };

  const openFaqCreateDialog = () => {
    setFaqForm({ question: '', answer: '', category: '', order: 0 });
    setIsEditingFaq(false);
    setFaqDialogOpen(true);
  };

  // ==================== Contact Us Functions ====================
  const loadContactUsSubmissions = useCallback(async () => {
    setContactUsLoading(true);
    try {
      const params: GetContactUsParams = {
        page: contactUsPage,
        limit: contactUsPageSize,
        status: contactUsStatusFilter !== 'all' ? contactUsStatusFilter as any : undefined,
      };

      const response = await adminBasicApi.getContactUsSubmissions(params);

      let filteredSubmissions = response.data;
      if (contactUsSearchTerm) {
        filteredSubmissions = filteredSubmissions.filter(
          (submission) =>
            submission.name.toLowerCase().includes(contactUsSearchTerm.toLowerCase()) ||
            submission.email.toLowerCase().includes(contactUsSearchTerm.toLowerCase()) ||
            submission.subject.toLowerCase().includes(contactUsSearchTerm.toLowerCase())
        );
      }

      setContactUsSubmissions(filteredSubmissions);
      setContactUsTotal(response.pagination.totalCount);
      setContactUsTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      console.error('Failed to load contact us submissions:', error);
      setSnackbarMsg({
        msg: `Failed to load contact us submissions: ${error.message || 'Unknown error'}`,
        type: 'error',
      });
      setContactUsSubmissions([]);
      setContactUsTotalPages(1);
      setContactUsTotal(0);
    } finally {
      setContactUsLoading(false);
    }
  }, [contactUsPage, contactUsPageSize, contactUsStatusFilter, contactUsSearchTerm, setSnackbarMsg]);

  const handleUpdateContactUs = async () => {
    if (!selectedContactUs) return;

    setContactUsUpdateDialogOpen(false);
    setActionLoading(true);

    try {
      const response = await adminBasicApi.updateContactUsSubmission(
        selectedContactUs.id,
        contactUsUpdateForm
      );
      setSnackbarMsg({
        msg: response.message || 'Submission updated successfully',
        type: 'success',
      });
      setContactUsUpdateForm({ status: undefined, response: '' });
      setSelectedContactUs(null);
      await loadContactUsSubmissions();
    } catch (error: any) {
      console.error('Failed to update submission:', error);
      setSnackbarMsg({
        msg: `Failed to update submission: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteContactUs = async () => {
    if (!selectedContactUs) return;

    setContactUsDeleteDialogOpen(false);
    setActionLoading(true);

    try {
      const response = await adminBasicApi.deleteContactUsSubmission(selectedContactUs.id);
      setSnackbarMsg({
        msg: response.message || 'Submission deleted successfully',
        type: 'success',
      });
      setSelectedContactUs(null);
      await loadContactUsSubmissions();
    } catch (error: any) {
      console.error('Failed to delete submission:', error);
      setSnackbarMsg({
        msg: `Failed to delete submission: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openContactUsUpdateDialog = (submission: ContactUsSubmission) => {
    setSelectedContactUs(submission);
    setContactUsUpdateForm({
      status: submission.status,
      response: submission.response || '',
    });
    setContactUsUpdateDialogOpen(true);
  };

  // ==================== Load Data on Tab Change ====================
  useEffect(() => {
    if (activeTab === 'terms') {
      loadTerms();
    } else if (activeTab === 'faqs') {
      loadFaqs();
    } else if (activeTab === 'contact-us') {
      loadContactUsSubmissions();
    }
  }, [activeTab, loadTerms, loadFaqs, loadContactUsSubmissions]);

  // ==================== Utility Functions ====================
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatShortDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge
        className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}
      >
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const uniqueCategories = [...new Set(faqs.map((faq) => faq.category).filter(Boolean))].sort();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Communication"
        description="Manage terms & conditions, FAQs, and contact us submissions"
      >
        <div className="flex gap-2 my-0">
          <RefreshButton
            onClick={() => {
              if (activeTab === 'terms') loadTerms();
              else if (activeTab === 'faqs') loadFaqs();
              else if (activeTab === 'contact-us') loadContactUsSubmissions();
            }}
          />
          {activeTab === 'terms' && (
            <Button size="sm" onClick={openTermsCreateDialog}>
              <Plus className="p-0" />
              New Terms
            </Button>
          )}
          {activeTab === 'faqs' && (
            <Button size="sm" onClick={openFaqCreateDialog}>
              <Plus className="p-0" />
              New FAQ
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="flex-1 overflow-hidden">
        <div className=" h-full overflow-y-auto p-6 space-y-6">
          {/* Tab Navigation */}
          <div className="bg-gray-800 rounded-lg p-1 inline-flex space-x-1">
            <button
              onClick={() => setActiveTab('contact-us')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'contact-us'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
            >
              <MessageSquare className="h-4 w-4" />
              Contact Us Submissions
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'faqs'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
            >
              <HelpCircle className="h-4 w-4" />
              FAQs
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'terms'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
            >
              <FileText className="h-4 w-4" />
              Terms & Conditions
            </button>
          </div>

          {/* Contact Us Tab */}
          {activeTab === 'contact-us' && (
            <div style={{ height: "calc(100vh - 180px)" }} className="bg-gray-800 rounded-lg p-6 h-full flex flex-col">
              {/* Filters */}
              <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search submissions..."
                    value={contactUsSearchTerm}
                    onChange={(e) => setContactUsSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="w-40">
                  <Select value={contactUsStatusFilter} onValueChange={setContactUsStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-400">
                  {contactUsTotal} submission{contactUsTotal !== 1 ? 's' : ''} found
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-auto rounded-lg border border-gray-700/50">
                  <table className="w-full">
                    <TableHeader
                      headers={['Name', 'Email', 'Subject', 'Status', 'Created', 'Actions']}
                    />
                    <tbody>
                      {contactUsLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8">
                            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-gray-400" />
                            <div className="text-gray-400">Loading submissions...</div>
                          </td>
                        </tr>
                      ) : contactUsSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-400">
                            No submissions found
                          </td>
                        </tr>
                      ) : (
                        contactUsSubmissions.map((submission) => (
                          <tr
                            key={submission.id}
                            className="border-b border-gray-700/50 hover:bg-gray-700/20"
                          >
                            <td className="py-3 px-4 font-medium text-white">
                              {submission.name}
                            </td>
                            <td className="py-3 px-4 text-gray-300">{submission.email}</td>
                            <td className="py-3 px-4 text-gray-300 max-w-xs truncate">
                              {submission.subject}
                            </td>
                            <td className="py-3 px-4">{getStatusBadge(submission.status)}</td>
                            <td className="py-3 px-4 text-gray-400 text-sm">
                              {formatShortDate(submission.createdAt)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => {
                                    setSelectedContactUs(submission);
                                    setContactUsDetailsDialogOpen(true);
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-white h-8 w-8 p-0"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => openContactUsUpdateDialog(submission)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                  title="Update"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedContactUs(submission);
                                    setContactUsDeleteDialogOpen(true);
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
            </div>
          )}


          {/* FAQs Tab */}
          {activeTab === 'faqs' && (
            <div style={{ height: "calc(100vh - 180px)" }} className="bg-gray-800 rounded-lg p-6 h-full flex flex-col">
              {/* Filters */}
              <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search FAQs..."
                    value={faqsSearchTerm}
                    onChange={(e) => setFaqsSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="w-40">
                  <Select value={faqsCategoryFilter} onValueChange={setFaqsCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {uniqueCategories.map((category) => (
                        <SelectItem key={category} value={category as string}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-400">
                  {faqs.length} FAQ{faqs.length !== 1 ? 's' : ''} found
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-auto rounded-lg border border-gray-700/50">
                  <table className="w-full">
                    <TableHeader
                      headers={['Question', 'Category', 'Order', 'Status', 'Created', 'Actions']}
                    />
                    <tbody>
                      {faqsLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8">
                            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-gray-400" />
                            <div className="text-gray-400">Loading FAQs...</div>
                          </td>
                        </tr>
                      ) : faqs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-400">
                            No FAQs found
                          </td>
                        </tr>
                      ) : (
                        faqs.map((faq) => (
                          <tr
                            key={faq.id}
                            className="border-b border-gray-700/50 hover:bg-gray-700/20"
                          >
                            <td className="py-3 px-4 font-medium text-white max-w-md truncate">
                              {faq.question}
                            </td>
                            <td className="py-3 px-4 text-gray-300">{faq.category || 'N/A'}</td>
                            <td className="py-3 px-4 text-gray-300">{faq.order}</td>
                            <td className="py-3 px-4">
                              {faq.isActive ? (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-400 text-sm">
                              {formatShortDate(faq.createdAt)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => {
                                    setSelectedFaq(faq);
                                    setFaqDetailsDialogOpen(true);
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-white h-8 w-8 p-0"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => openFaqEditDialog(faq)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleToggleFaqActive(faq)}
                                  variant="outline"
                                  size="sm"
                                  disabled={actionLoading}
                                  className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200"
                                  title={faq.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  {faq.isActive ? (
                                    <ToggleRight className="h-4 w-4" />
                                  ) : (
                                    <ToggleLeft className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedFaq(faq);
                                    setFaqDeleteDialogOpen(true);
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
            </div>
          )}


          {/* Terms & Conditions Tab */}
          {activeTab === 'terms' && (
            <div
              style={{ height: "calc(100vh - 180px)" }}
              className="bg-gray-800 rounded-lg p-6 h-full flex flex-col">
              {/* Search */}
              <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search terms..."
                    value={termsSearchTerm}
                    onChange={(e) => setTermsSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="text-sm text-gray-400">
                  {terms.length} term{terms.length !== 1 ? 's' : ''} found
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-auto rounded-lg border border-gray-700/50">
                  <table className="w-full">
                    <TableHeader
                      headers={['Title', 'Version', 'Status', 'Created', 'Actions']}
                    />
                    <tbody>
                      {termsLoading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8">
                            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-gray-400" />
                            <div className="text-gray-400">Loading terms...</div>
                          </td>
                        </tr>
                      ) : terms.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-400">
                            No terms found
                          </td>
                        </tr>
                      ) : (
                        terms.map((term) => (
                          <tr
                            key={term.id}
                            className="border-b border-gray-700/50 hover:bg-gray-700/20"
                          >
                            <td className="py-3 px-4 font-medium text-white">{term.title}</td>
                            <td className="py-3 px-4 text-gray-300">{term.version}</td>
                            <td className="py-3 px-4">
                              {term.isActive ? (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-400 text-sm">
                              {formatShortDate(term.createdAt)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => {
                                    setSelectedTerms(term);
                                    setTermsDetailsDialogOpen(true);
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-white h-8 w-8 p-0"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => openTermsEditDialog(term)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleToggleTermsActive(term)}
                                  variant="outline"
                                  size="sm"
                                  disabled={actionLoading}
                                  className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200"
                                  title={term.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  {term.isActive ? (
                                    <ToggleRight className="h-4 w-4" />
                                  ) : (
                                    <ToggleLeft className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedTerms(term);
                                    setTermsDeleteDialogOpen(true);
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
            </div>
          )}


        </div>
      </div>

      {/* Terms Create/Edit Dialog */}
      <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isEditingTerms ? 'Edit Terms & Conditions' : 'Create Terms & Conditions'}
            </DialogTitle>
            <DialogDescription>
              {isEditingTerms
                ? 'Update the terms and conditions'
                : 'Create new terms and conditions'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={termsForm.title}
                onChange={(e) => setTermsForm({ ...termsForm, title: e.target.value })}
                placeholder="e.g., Terms of Service"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={termsForm.version}
                onChange={(e) => setTermsForm({ ...termsForm, version: e.target.value })}
                placeholder="e.g., 1.0.0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">
                Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                value={termsForm.content}
                onChange={(e) => setTermsForm({ ...termsForm, content: e.target.value })}
                placeholder="Enter the full terms and conditions content..."
                rows={15}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTermsDialogOpen(false);
                setTermsForm({ title: '', content: '', version: '' });
                setIsEditingTerms(false);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdateTerms} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {isEditingTerms ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditingTerms ? (
                'Update Terms'
              ) : (
                'Create Terms'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terms Details Dialog */}
      <Dialog open={termsDetailsDialogOpen} onOpenChange={setTermsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Terms & Conditions Details
            </DialogTitle>
          </DialogHeader>
          {selectedTerms && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Title</Label>
                  <p className="text-white mt-1">{selectedTerms.title}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Version</Label>
                  <p className="text-white mt-1">{selectedTerms.version}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Status</Label>
                  <div className="mt-1">
                    {selectedTerms.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400">Created</Label>
                  <p className="text-white mt-1 text-sm">{formatDate(selectedTerms.createdAt)}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-400">Content</Label>
                <div className="mt-2 bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <p className="text-white whitespace-pre-wrap text-sm">{selectedTerms.content}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTermsDetailsDialogOpen(false);
                setSelectedTerms(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terms Delete Dialog */}
      <Dialog open={termsDeleteDialogOpen} onOpenChange={setTermsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Terms & Conditions
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "
              <span className="font-semibold">{selectedTerms?.title}</span>"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTermsDeleteDialogOpen(false);
                setSelectedTerms(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTerms} disabled={actionLoading}>
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

      {/* FAQ Create/Edit Dialog */}
      <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {isEditingFaq ? 'Edit FAQ' : 'Create FAQ'}
            </DialogTitle>
            <DialogDescription>
              {isEditingFaq ? 'Update the FAQ item' : 'Create a new FAQ item'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question">
                Question <span className="text-red-500">*</span>
              </Label>
              <Input
                id="question"
                value={faqForm.question}
                onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                placeholder="e.g., How do I reset my password?"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="answer">
                Answer <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="answer"
                value={faqForm.answer}
                onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                placeholder="Enter the answer to this question..."
                rows={8}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={faqForm.category}
                  onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                  placeholder="e.g., Account, Trading"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={faqForm.order}
                  onChange={(e) =>
                    setFaqForm({ ...faqForm, order: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFaqDialogOpen(false);
                setFaqForm({ question: '', answer: '', category: '', order: 0 });
                setIsEditingFaq(false);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdateFaq} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {isEditingFaq ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditingFaq ? (
                'Update FAQ'
              ) : (
                'Create FAQ'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ Details Dialog */}
      <Dialog open={faqDetailsDialogOpen} onOpenChange={setFaqDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              FAQ Details
            </DialogTitle>
          </DialogHeader>
          {selectedFaq && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-gray-400">Question</Label>
                <p className="text-white mt-1 font-medium">{selectedFaq.question}</p>
              </div>
              <div>
                <Label className="text-gray-400">Answer</Label>
                <p className="text-white mt-1 whitespace-pre-wrap">{selectedFaq.answer}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-400">Category</Label>
                  <p className="text-white mt-1">{selectedFaq.category || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Order</Label>
                  <p className="text-white mt-1">{selectedFaq.order}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Status</Label>
                  <div className="mt-1">
                    {selectedFaq.isActive ? (
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
                  <p className="text-white mt-1 text-sm">{formatDate(selectedFaq.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Updated</Label>
                  <p className="text-white mt-1 text-sm">{formatDate(selectedFaq.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFaqDetailsDialogOpen(false);
                setSelectedFaq(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ Delete Dialog */}
      <Dialog open={faqDeleteDialogOpen} onOpenChange={setFaqDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete FAQ
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFaqDeleteDialogOpen(false);
                setSelectedFaq(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFaq} disabled={actionLoading}>
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

      {/* Contact Us Details Dialog */}
      <Dialog open={contactUsDetailsDialogOpen} onOpenChange={setContactUsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contact Us Submission Details
            </DialogTitle>
          </DialogHeader>
          {selectedContactUs && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Name</Label>
                  <p className="text-white mt-1">{selectedContactUs.name}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Email</Label>
                  <p className="text-white mt-1">{selectedContactUs.email}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-400">Subject</Label>
                <p className="text-white mt-1">{selectedContactUs.subject}</p>
              </div>
              <div>
                <Label className="text-gray-400">Message</Label>
                <div className="mt-2 bg-gray-900 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <p className="text-white whitespace-pre-wrap">{selectedContactUs.message}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedContactUs.status)}</div>
                </div>
                <div>
                  <Label className="text-gray-400">IP Address</Label>
                  <p className="text-white mt-1 font-mono">
                    {selectedContactUs.ipAddress || 'N/A'}
                  </p>
                </div>
              </div>
              {selectedContactUs.response && (
                <div>
                  <Label className="text-gray-400">Admin Response</Label>
                  <div className="mt-2 bg-gray-900 rounded-lg p-4">
                    <p className="text-white whitespace-pre-wrap">{selectedContactUs.response}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Created</Label>
                  <p className="text-white mt-1 text-sm">
                    {formatDate(selectedContactUs.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400">Updated</Label>
                  <p className="text-white mt-1 text-sm">
                    {formatDate(selectedContactUs.updatedAt)}
                  </p>
                </div>
              </div>
              {selectedContactUs.respondedAt && (
                <div>
                  <Label className="text-gray-400">Responded At</Label>
                  <p className="text-white mt-1 text-sm">
                    {formatDate(selectedContactUs.respondedAt)}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setContactUsDetailsDialogOpen(false);
                setSelectedContactUs(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Us Update Dialog */}
      <Dialog open={contactUsUpdateDialogOpen} onOpenChange={setContactUsUpdateDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Update Submission
            </DialogTitle>
            <DialogDescription>
              Update the status and add a response to this submission
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={contactUsUpdateForm.status}
                onValueChange={(value: any) =>
                  setContactUsUpdateForm({ ...contactUsUpdateForm, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* <div className="grid gap-2">
              <Label htmlFor="response">Response</Label>
              <Textarea
                id="response"
                value={contactUsUpdateForm.response}
                onChange={(e) =>
                  setContactUsUpdateForm({ ...contactUsUpdateForm, response: e.target.value })
                }
                placeholder="Enter your response to the user..."
                rows={8}
              />
            </div> */}

          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setContactUsUpdateDialogOpen(false);
                setContactUsUpdateForm({ status: undefined, response: '' });
                setSelectedContactUs(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateContactUs} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Submission'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Us Delete Dialog */}
      <Dialog open={contactUsDeleteDialogOpen} onOpenChange={setContactUsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Submission
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this submission? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setContactUsDeleteDialogOpen(false);
                setSelectedContactUs(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteContactUs} disabled={actionLoading}>
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

export default AdminCommunicationView;
