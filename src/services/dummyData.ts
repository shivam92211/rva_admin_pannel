import type {
  BrokerInfo,
  SubAccount,
  PaginatedResponse,
  TransferDetail,
  DepositRecord,
  DepositDetail,
  WithdrawalDetail,
  GetBrokerInfoRequest,
  GetSubAccountsRequest,
  GetDepositListRequest,
  GetDepositDetailRequest,
  GetWithdrawDetailRequest,
  GetTransferHistoryRequest,
} from '@/types/kucoin'

export class DummyDataService {
  static async getBrokerInfo(params: GetBrokerInfoRequest): Promise<BrokerInfo> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    return {
      level: 3,
      accountSize: 12,
      maxAccountSize: 50
    }
  }

  static async getSubAccounts(params?: GetSubAccountsRequest): Promise<PaginatedResponse<SubAccount>> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const demoSubAccounts: SubAccount[] = [
      {
        uid: "demo_sub_001",
        accountName: "Trading Bot Alpha",
        createdAt: Date.now() - 86400000 * 30, // 30 days ago
        level: 1
      },
      {
        uid: "demo_sub_002",
        accountName: "Portfolio Manager",
        createdAt: Date.now() - 86400000 * 15, // 15 days ago
        level: 1
      },
      {
        uid: "demo_sub_003",
        accountName: "Arbitrage Scanner",
        createdAt: Date.now() - 86400000 * 7, // 7 days ago
        level: 1
      },
      {
        uid: "demo_sub_004",
        accountName: "DCA Strategy",
        createdAt: Date.now() - 86400000 * 5, // 5 days ago
        level: 1
      }
    ]

    return {
      currentPage: params?.currentPage || 1,
      pageSize: params?.pageSize || 50,
      totalNum: demoSubAccounts.length,
      totalPage: 1,
      items: demoSubAccounts
    }
  }

  static async getTransferHistory(params: GetTransferHistoryRequest): Promise<TransferDetail> {
    await new Promise(resolve => setTimeout(resolve, 700))
    
    return {
      orderId: "demo_transfer_001",
      currency: "USDT",
      amount: "1000.00",
      fromUid: "demo_main_account",
      fromAccountType: "MAIN",
      toUid: "demo_sub_001",
      toAccountType: "TRADE",
      status: "SUCCESS",
      createdAt: Date.now() - 3600000 // 1 hour ago
    }
  }

  static async getDepositList(params?: GetDepositListRequest): Promise<DepositRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [
      {
        uid: "demo_sub_001",
        hash: "demo_tx_001",
        address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        amount: "0.5",
        currency: "BTC",
        status: "SUCCESS",
        chain: "BTC",
        createdAt: Date.now() - 86400000, // 1 day ago
        updatedAt: Date.now() - 86400000 + 3600000
      },
      {
        uid: "demo_sub_002",
        hash: "demo_tx_002",
        address: "0x742d35cc6663c0532925a3b8d5c9de3c",
        amount: "5000.00",
        currency: "USDT",
        status: "SUCCESS",
        chain: "TRC20",
        createdAt: Date.now() - 86400000 * 3, // 3 days ago
        updatedAt: Date.now() - 86400000 * 3 + 3600000
      },
      {
        uid: "demo_sub_003",
        hash: "demo_tx_003",
        address: "0x742d35cc6663c0532925a3b8d5c9de3c",
        amount: "2.5",
        currency: "ETH",
        status: "PROCESSING",
        chain: "ERC20",
        createdAt: Date.now() - 7200000, // 2 hours ago
        updatedAt: Date.now() - 7200000 + 1800000
      }
    ]
  }

  static async getDepositDetail(params: GetDepositDetailRequest): Promise<DepositDetail> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    return {
      chain: "TRC20",
      hash: params.hash,
      walletTxId: "demo_tx_detailed",
      uid: "demo_sub_002",
      amount: "5000.00",
      address: "0x742d35cc6663c0532925a3b8d5c9de3c",
      status: "SUCCESS",
      createdAt: Date.now() - 86400000,
      isInner: false
    }
  }

  static async getWithdrawDetail(params: GetWithdrawDetailRequest): Promise<WithdrawalDetail> {
    await new Promise(resolve => setTimeout(resolve, 450))
    
    return {
      id: params.withdrawalId,
      chain: "BTC",
      walletTxId: "demo_withdraw_tx",
      uid: "demo_sub_001",
      amount: "0.1",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      currency: "BTC",
      status: "SUCCESS",
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 3600000 + 1800000
    }
  }

  static async downloadBrokerRebate(): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return "https://demo-download-link.com/rebate-report.csv"
  }

  static async isDemoMode(): Promise<boolean> {
    try {
      // Check if backend has credentials configured
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/kucoin/broker/credentials`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const credentialStatus = await response.json()
        return !credentialStatus.isConfigured
      }
    } catch (error) {
      console.warn('Could not check credential status, assuming demo mode')
    }

    // Default to demo mode if we can't check backend
    return true
  }
}