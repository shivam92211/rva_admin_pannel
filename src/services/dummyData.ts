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
      maxAccountSize: 50,
      maxSpotApiCount: 10,
      maxFuturesApiCount: 5,
      maxMarginApiCount: 3,
      totalCommission: "2,847.50",
      totalRebate: "1,423.75",
      todayCommission: "156.30",
      yesterdayCommission: "203.45",
      uid: "demo_broker_123456"
    }
  }

  static async getSubAccounts(params?: GetSubAccountsRequest): Promise<PaginatedResponse<SubAccount>> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const demoSubAccounts: SubAccount[] = [
      {
        uid: "demo_sub_001",
        subName: "Trading Bot Alpha",
        status: "normal",
        type: 1,
        createdAt: Date.now() - 86400000 * 30, // 30 days ago
        remarks: "Automated trading system for spot markets"
      },
      {
        uid: "demo_sub_002", 
        subName: "Portfolio Manager",
        status: "normal",
        type: 1,
        createdAt: Date.now() - 86400000 * 15, // 15 days ago
        remarks: "Long-term investment portfolio management"
      },
      {
        uid: "demo_sub_003",
        subName: "Arbitrage Scanner",
        status: "normal", 
        type: 1,
        createdAt: Date.now() - 86400000 * 7, // 7 days ago
        remarks: "Cross-exchange arbitrage opportunities"
      },
      {
        uid: "demo_sub_004",
        subName: "DCA Strategy",
        status: "locked",
        type: 1,
        createdAt: Date.now() - 86400000 * 5, // 5 days ago
        remarks: "Dollar cost averaging for major cryptocurrencies"
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
      fee: "0.00",
      status: "SUCCESS",
      createdAt: Date.now() - 3600000, // 1 hour ago
      direction: "IN",
      fromUid: "demo_main_account",
      toUid: "demo_sub_001",
      remark: "Initial funding for trading bot"
    }
  }

  static async getDepositList(params?: GetDepositListRequest): Promise<DepositRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [
      {
        orderId: "demo_deposit_001",
        currency: "BTC",
        amount: "0.5",
        fee: "0",
        status: "SUCCESS", 
        createdAt: Date.now() - 86400000, // 1 day ago
        address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        txId: "demo_tx_001",
        uid: "demo_sub_001"
      },
      {
        orderId: "demo_deposit_002",
        currency: "USDT",
        amount: "5000.00",
        fee: "0",
        status: "SUCCESS",
        createdAt: Date.now() - 86400000 * 3, // 3 days ago
        address: "0x742d35cc6663c0532925a3b8d5c9de3c",
        txId: "demo_tx_002", 
        uid: "demo_sub_002"
      },
      {
        orderId: "demo_deposit_003",
        currency: "ETH",
        amount: "2.5",
        fee: "0",
        status: "PROCESSING",
        createdAt: Date.now() - 7200000, // 2 hours ago
        address: "0x742d35cc6663c0532925a3b8d5c9de3c",
        txId: "demo_tx_003",
        uid: "demo_sub_003"
      }
    ]
  }

  static async getDepositDetail(params: GetDepositDetailRequest): Promise<DepositDetail> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    return {
      orderId: params.orderId,
      currency: "USDT",
      amount: "5000.00",
      fee: "0",
      status: "SUCCESS",
      createdAt: Date.now() - 86400000,
      address: "0x742d35cc6663c0532925a3b8d5c9de3c",
      txId: "demo_tx_detailed",
      uid: "demo_sub_002",
      confirmations: 12,
      requiredConfirmations: 12,
      network: "TRC20"
    }
  }

  static async getWithdrawDetail(params: GetWithdrawDetailRequest): Promise<WithdrawalDetail> {
    await new Promise(resolve => setTimeout(resolve, 450))
    
    return {
      orderId: params.orderId,
      currency: "BTC",
      amount: "0.1",
      fee: "0.0005",
      status: "SUCCESS", 
      createdAt: Date.now() - 3600000,
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      txId: "demo_withdraw_tx",
      uid: "demo_sub_001",
      memo: "",
      network: "BTC"
    }
  }

  static async downloadBrokerRebate(): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return "https://demo-download-link.com/rebate-report.csv"
  }

  static isDemoMode(): boolean {
    const apiKey = localStorage.getItem('kucoin_api_key')
    const apiSecret = localStorage.getItem('kucoin_api_secret')
    const passphrase = localStorage.getItem('kucoin_api_passphrase')
    
    return !apiKey || !apiSecret || !passphrase
  }
}