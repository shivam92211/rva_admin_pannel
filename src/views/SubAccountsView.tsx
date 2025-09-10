import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Edit, Trash2, Key, RefreshCw } from 'lucide-react'
import { kucoinApi } from '@/services/kucoinApi'
import type { SubAccount, ApiKeyInfo, CreateSubAccountRequest, CreateApiKeyRequest, ModifyApiKeyRequest } from '@/types/kucoin'

interface SubAccountWithApiKeys extends SubAccount {
  apiKeys: ApiKeyInfo[]
}

const SubAccountsView: React.FC = () => {
  const [subAccounts, setSubAccounts] = useState<SubAccountWithApiKeys[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSubAccount, setSelectedSubAccount] = useState<SubAccountWithApiKeys | null>(null)
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKeyInfo | null>(null)
  
  const [newAccountName, setNewAccountName] = useState('')
  const [apiKeyForm, setApiKeyForm] = useState({
    passphrase: '',
    label: '',
    permissions: ['general'] as ('general' | 'spot' | 'futures')[],
    ipWhitelist: [''],
  })
  
  const [currentPage] = useState(1)
  const pageSize = 10
  
  const isApiConfigured = kucoinApi.isBrokerConfigured()
  
  // Dummy data for when API is not configured
  const dummyData: SubAccountWithApiKeys[] = [
    {
      uid: 'dummy-uid-1',
      accountName: 'Demo Sub Account 1',
      createdAt: Date.now() - 86400000,
      level: 1,
      apiKeys: [
        {
          uid: 'dummy-uid-1',
          label: 'Trading API',
          apiKey: 'dummy-api-key-1',
          apiVersion: 2,
          permissions: ['general', 'spot'],
          ipWhitelist: ['192.168.1.1'],
          createdAt: Date.now() - 3600000,
        }
      ]
    },
    {
      uid: 'dummy-uid-2', 
      accountName: 'Demo Sub Account 2',
      createdAt: Date.now() - 172800000,
      level: 2,
      apiKeys: [
        {
          uid: 'dummy-uid-2',
          label: 'Market Data API',
          apiKey: 'dummy-api-key-2', 
          apiVersion: 2,
          permissions: ['general'],
          ipWhitelist: ['*'],
          createdAt: Date.now() - 7200000,
        }
      ]
    },
    {
      uid: 'dummy-uid-3',
      accountName: 'Demo Sub Account 3', 
      createdAt: Date.now() - 259200000,
      level: 1,
      apiKeys: []
    }
  ]
  
  const loadSubAccounts = React.useCallback(async () => {
    if (!isApiConfigured) {
      setSubAccounts(dummyData)
      return
    }
    
    setLoading(true)
    try {
      const response = await kucoinApi.getSubAccounts({
        currentPage,
        pageSize
      })
      
      // Load API keys for each sub account
      const accountsWithKeys = await Promise.all(
        response.items.map(async (account) => {
          try {
            const apiKeys = await kucoinApi.getApiKeys({ uid: account.uid })
            return { ...account, apiKeys }
          } catch (error) {
            console.error(`Failed to load API keys for ${account.uid}:`, error)
            return { ...account, apiKeys: [] }
          }
        })
      )
      
      setSubAccounts(accountsWithKeys)
    } catch (error) {
      console.error('Failed to load sub accounts:', error)
      setSubAccounts(dummyData) // Fallback to dummy data on error
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, isApiConfigured])
  
  useEffect(() => {
    loadSubAccounts()
  }, [loadSubAccounts])
  
  const createSubAccount = async () => {
    if (!newAccountName.trim()) return
    
    if (!isApiConfigured) {
      // Demo mode - add to dummy data
      const newAccount: SubAccountWithApiKeys = {
        uid: `dummy-uid-${Date.now()}`,
        accountName: newAccountName,
        createdAt: Date.now(),
        level: 1,
        apiKeys: []
      }
      setSubAccounts(prev => [newAccount, ...prev])
      setNewAccountName('')
      setCreateDialogOpen(false)
      return
    }
    
    try {
      const request: CreateSubAccountRequest = { accountName: newAccountName }
      const newAccount = await kucoinApi.createSubAccount(request)
      setSubAccounts(prev => [{ ...newAccount, apiKeys: [] }, ...prev])
      setNewAccountName('')
      setCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create sub account:', error)
    }
  }
  
  const createApiKey = async () => {
    if (!selectedSubAccount || !apiKeyForm.passphrase || !apiKeyForm.label) return
    
    if (!isApiConfigured) {
      // Demo mode
      const newApiKey: ApiKeyInfo = {
        uid: selectedSubAccount.uid,
        label: apiKeyForm.label,
        apiKey: `demo-key-${Date.now()}`,
        apiVersion: 2,
        permissions: apiKeyForm.permissions,
        ipWhitelist: apiKeyForm.ipWhitelist.filter(ip => ip.trim()),
        createdAt: Date.now()
      }
      
      setSubAccounts(prev => prev.map(account => 
        account.uid === selectedSubAccount.uid 
          ? { ...account, apiKeys: [...account.apiKeys, newApiKey] }
          : account
      ))
      
      resetApiKeyForm()
      setApiKeyDialogOpen(false)
      return
    }
    
    try {
      const request: CreateApiKeyRequest = {
        uid: selectedSubAccount.uid,
        passphrase: apiKeyForm.passphrase,
        label: apiKeyForm.label,
        permissions: apiKeyForm.permissions,
        ipWhitelist: apiKeyForm.ipWhitelist.filter(ip => ip.trim())
      }
      
      const newApiKey = await kucoinApi.createApiKey(request)
      
      setSubAccounts(prev => prev.map(account => 
        account.uid === selectedSubAccount.uid 
          ? { ...account, apiKeys: [...account.apiKeys, newApiKey] }
          : account
      ))
      
      resetApiKeyForm()
      setApiKeyDialogOpen(false)
    } catch (error) {
      console.error('Failed to create API key:', error)
    }
  }
  
  const updateApiKey = async () => {
    if (!selectedApiKey || !selectedSubAccount) return
    
    if (!isApiConfigured) {
      // Demo mode
      setSubAccounts(prev => prev.map(account => 
        account.uid === selectedSubAccount.uid 
          ? {
              ...account, 
              apiKeys: account.apiKeys.map(key => 
                key.apiKey === selectedApiKey.apiKey 
                  ? { ...key, label: apiKeyForm.label, permissions: apiKeyForm.permissions, ipWhitelist: apiKeyForm.ipWhitelist.filter(ip => ip.trim()) }
                  : key
              )
            }
          : account
      ))
      
      resetApiKeyForm()
      setEditDialogOpen(false)
      return
    }
    
    try {
      const request: ModifyApiKeyRequest = {
        uid: selectedSubAccount.uid,
        apiKey: selectedApiKey.apiKey,
        label: apiKeyForm.label,
        permissions: apiKeyForm.permissions,
        ipWhitelist: apiKeyForm.ipWhitelist.filter(ip => ip.trim())
      }
      
      const updatedApiKey = await kucoinApi.modifyApiKey(request)
      
      setSubAccounts(prev => prev.map(account => 
        account.uid === selectedSubAccount.uid 
          ? {
              ...account, 
              apiKeys: account.apiKeys.map(key => 
                key.apiKey === selectedApiKey.apiKey ? updatedApiKey : key
              )
            }
          : account
      ))
      
      resetApiKeyForm()
      setEditDialogOpen(false)
    } catch (error) {
      console.error('Failed to update API key:', error)
    }
  }
  
  const deleteApiKey = async () => {
    if (!selectedApiKey || !selectedSubAccount) return
    
    if (!isApiConfigured) {
      // Demo mode
      setSubAccounts(prev => prev.map(account => 
        account.uid === selectedSubAccount.uid 
          ? { ...account, apiKeys: account.apiKeys.filter(key => key.apiKey !== selectedApiKey.apiKey) }
          : account
      ))
      
      setDeleteDialogOpen(false)
      setSelectedApiKey(null)
      return
    }
    
    try {
      await kucoinApi.deleteApiKey(selectedSubAccount.uid, selectedApiKey.apiKey)
      
      setSubAccounts(prev => prev.map(account => 
        account.uid === selectedSubAccount.uid 
          ? { ...account, apiKeys: account.apiKeys.filter(key => key.apiKey !== selectedApiKey.apiKey) }
          : account
      ))
      
      setDeleteDialogOpen(false)
      setSelectedApiKey(null)
    } catch (error) {
      console.error('Failed to delete API key:', error)
    }
  }
  
  const resetApiKeyForm = () => {
    setApiKeyForm({
      passphrase: '',
      label: '',
      permissions: ['general'],
      ipWhitelist: ['']
    })
  }
  
  const filteredSubAccounts = subAccounts.filter(account => 
    account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.uid.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const handleEditApiKey = (apiKey: ApiKeyInfo, subAccount: SubAccountWithApiKeys) => {
    setSelectedApiKey(apiKey)
    setSelectedSubAccount(subAccount)
    setApiKeyForm({
      passphrase: '',
      label: apiKey.label,
      permissions: apiKey.permissions,
      ipWhitelist: apiKey.ipWhitelist.length > 0 ? apiKey.ipWhitelist : ['']
    })
    setEditDialogOpen(true)
  }
  
  const handleCreateApiKey = (subAccount: SubAccountWithApiKeys) => {
    setSelectedSubAccount(subAccount)
    resetApiKeyForm()
    setApiKeyDialogOpen(true)
  }
  
  const handleDeleteApiKey = (apiKey: ApiKeyInfo, subAccount: SubAccountWithApiKeys) => {
    setSelectedApiKey(apiKey)
    setSelectedSubAccount(subAccount)
    setDeleteDialogOpen(true)
  }
  
  const addIpWhitelistField = () => {
    setApiKeyForm(prev => ({
      ...prev,
      ipWhitelist: [...prev.ipWhitelist, '']
    }))
  }
  
  const updateIpWhitelist = (index: number, value: string) => {
    setApiKeyForm(prev => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.map((ip, i) => i === index ? value : ip)
    }))
  }
  
  const removeIpWhitelistField = (index: number) => {
    setApiKeyForm(prev => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.filter((_, i) => i !== index)
    }))
  }
  
  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Sub Accounts" 
        description="Manage your broker sub-accounts and their API keys"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSubAccounts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Sub Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Sub Account</DialogTitle>
                <DialogDescription>
                  Create a new sub-account for your broker.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="Enter account name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createSubAccount} disabled={!newAccountName.trim()}>
                  Create Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>
      
      <div className="flex-1 p-6">
        {!isApiConfigured && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-amber-800 text-sm">
              <strong>Demo Mode:</strong> API credentials not configured. Showing dummy data. 
              Configure your broker API credentials to access real data.
            </p>
          </div>
        )}
        
        <div className="bg-card rounded-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search sub accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Name</TableHead>
                <TableHead>UID</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>API Keys</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                    Loading sub accounts...
                  </TableCell>
                </TableRow>
              ) : filteredSubAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No sub accounts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubAccounts.map((account) => (
                  <React.Fragment key={account.uid}>
                    <TableRow>
                      <TableCell className="font-medium">{account.accountName}</TableCell>
                      <TableCell className="font-mono text-sm">{account.uid}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          account.level === 1 ? 'bg-green-100 text-green-800' : 
                          account.level === 2 ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          Level {account.level}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{account.apiKeys.length} key{account.apiKeys.length !== 1 ? 's' : ''}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCreateApiKey(account)}
                          >
                            <Key className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(account.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {account.apiKeys.map((apiKey) => (
                      <TableRow key={apiKey.apiKey} className="bg-muted/30">
                        <TableCell className="pl-8 text-sm text-muted-foreground">
                          <Key className="h-3 w-3 inline mr-2" />
                          {apiKey.label}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{apiKey.apiKey}</TableCell>
                        <TableCell className="text-sm">
                          v{apiKey.apiVersion}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-wrap gap-1">
                            {apiKey.permissions.map((perm) => (
                              <span key={perm} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                {perm}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(apiKey.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleEditApiKey(apiKey, account)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteApiKey(apiKey, account)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Create API Key Dialog */}
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for {selectedSubAccount?.accountName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="passphrase">Passphrase</Label>
              <Input
                id="passphrase"
                type="password"
                value={apiKeyForm.passphrase}
                onChange={(e) => setApiKeyForm(prev => ({ ...prev, passphrase: e.target.value }))}
                placeholder="Enter passphrase"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={apiKeyForm.label}
                onChange={(e) => setApiKeyForm(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Enter label"
              />
            </div>
            <div className="grid gap-2">
              <Label>Permissions</Label>
              <div className="flex flex-wrap gap-2">
                {['general', 'spot', 'futures'].map((perm) => (
                  <label key={perm} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={apiKeyForm.permissions.includes(perm as 'general' | 'spot' | 'futures')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setApiKeyForm(prev => ({
                            ...prev,
                            permissions: [...prev.permissions, perm as 'general' | 'spot' | 'futures']
                          }))
                        } else {
                          setApiKeyForm(prev => ({
                            ...prev,
                            permissions: prev.permissions.filter(p => p !== perm)
                          }))
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{perm}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>IP Whitelist</Label>
              {apiKeyForm.ipWhitelist.map((ip, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={ip}
                    onChange={(e) => updateIpWhitelist(index, e.target.value)}
                    placeholder="Enter IP address or * for all"
                  />
                  {apiKeyForm.ipWhitelist.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeIpWhitelistField(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIpWhitelistField}
              >
                Add IP Address
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApiKeyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={createApiKey} 
              disabled={!apiKeyForm.passphrase || !apiKeyForm.label}
            >
              Create API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit API Key Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
            <DialogDescription>
              Update API key settings for {selectedApiKey?.label}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editLabel">Label</Label>
              <Input
                id="editLabel"
                value={apiKeyForm.label}
                onChange={(e) => setApiKeyForm(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Enter label"
              />
            </div>
            <div className="grid gap-2">
              <Label>Permissions</Label>
              <div className="flex flex-wrap gap-2">
                {['general', 'spot', 'futures'].map((perm) => (
                  <label key={perm} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={apiKeyForm.permissions.includes(perm as 'general' | 'spot' | 'futures')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setApiKeyForm(prev => ({
                            ...prev,
                            permissions: [...prev.permissions, perm as 'general' | 'spot' | 'futures']
                          }))
                        } else {
                          setApiKeyForm(prev => ({
                            ...prev,
                            permissions: prev.permissions.filter(p => p !== perm)
                          }))
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{perm}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>IP Whitelist</Label>
              {apiKeyForm.ipWhitelist.map((ip, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={ip}
                    onChange={(e) => updateIpWhitelist(index, e.target.value)}
                    placeholder="Enter IP address or * for all"
                  />
                  {apiKeyForm.ipWhitelist.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeIpWhitelistField(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIpWhitelistField}
              >
                Add IP Address
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateApiKey} disabled={!apiKeyForm.label}>
              Update API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the API key "{selectedApiKey?.label}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteApiKey}>
              Delete API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SubAccountsView