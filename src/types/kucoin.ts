export interface ApiResponse<T = any> {
  code: string
  data: T
  msg?: string
  success?: boolean
}

export interface BrokerInfo {
  accountSize: number
  maxAccountSize: number | null
  level: number
}

export interface SubAccount {
  accountName: string
  uid: string
  createdAt: number
  level: number
}

export interface PaginatedResponse<T> {
  currentPage: number
  pageSize: number
  totalNum: number
  totalPage: number
  items: T[]
}

export interface ApiKeyInfo {
  uid: string
  label: string
  apiKey: string
  secretKey?: string
  apiVersion: number
  permissions: ('general' | 'spot' | 'futures')[]
  ipWhitelist: string[]
  createdAt: number
}

export interface CreateSubAccountRequest {
  accountName: string
}

export interface CreateApiKeyRequest {
  uid: string
  passphrase: string
  ipWhitelist: string[]
  permissions: ('general' | 'spot' | 'futures')[]
  label: string
}

export interface ModifyApiKeyRequest {
  uid: string
  apiKey: string
  ipWhitelist: string[]
  permissions: ('general' | 'spot' | 'futures')[]
  label: string
}

export interface TransferRequest {
  currency: string
  amount: string
  clientOid: string
  direction: 'OUT' | 'IN'
  accountType: 'MAIN' | 'TRADE'
  specialUid: string
  specialAccountType: 'MAIN' | 'TRADE'
}

export interface TransferResponse {
  orderId: string
}

export interface TransferDetail {
  orderId: string
  currency: string
  amount: string
  fromUid: string
  fromAccountType: string
  toUid: string
  toAccountType: string
  status: 'PROCESSING' | 'SUCCESS' | 'FAILURE'
  createdAt: number
}

export interface DepositRecord {
  uid: string
  hash: string
  address: string
  amount: string
  currency: string
  status: 'PROCESSING' | 'SUCCESS' | 'FAILURE'
  chain: string
  createdAt: number
  updatedAt: number
}

export interface DepositDetail {
  chain: string
  hash: string
  walletTxId: string
  uid: string
  amount: string
  address: string
  status: 'PROCESSING' | 'SUCCESS' | 'FAILURE'
  createdAt: number
  isInner: boolean
}

export interface WithdrawalDetail {
  id: string
  chain: string
  walletTxId: string
  uid: string
  amount: string
  address: string
  currency: string
  status: 'PROCESSING' | 'SUCCESS' | 'FAILURE'
  createdAt: number
  updatedAt: number
}

export interface RebateDownloadRequest {
  begin: string
  end: string
  tradeType: 1 | 2
}

export interface RebateRecord {
  date: string
  brokerUid: string
  affiliateUid: string
  uid: string
  bizLine: 'Spot' | 'Futures'
  volume: string
  totalCommission: string
  brokerCommission: string
  userCommission: string
  affiliateCommission: string
  createdAt: number
}

export interface KycSubmitRequest {
  uid: string
  firstName: string
  lastName: string
  dateOfBirth: string
  country: string
  documentType: string
  documentNumber: string
  frontImage: string
  backImage: string
}

export interface KycStatusItem {
  uid: string
  status: string
  rejectReason?: string
}

export type TradeType = 1 | 2
export type TransferDirection = 'OUT' | 'IN'
export type AccountType = 'MAIN' | 'TRADE' | 'CONTRACT'
export type TransactionStatus = 'PROCESSING' | 'SUCCESS' | 'FAILURE'
export type ApiPermission = 'general' | 'spot' | 'futures'

export interface GetBrokerInfoRequest {
  begin: string
  end: string
  tradeType: TradeType
}

export interface GetSubAccountsRequest {
  uid?: string
  currentPage?: number
  pageSize?: number
}

export interface GetApiKeysRequest {
  uid: string
  apiKey?: string
}

export interface GetDepositListRequest {
  currency?: string
  status?: TransactionStatus
  hash?: string
  startTimestamp?: number
  endTimestamp?: number
  limit?: number
}

export interface GetDepositDetailRequest {
  currency: string
  hash: string
}

export interface GetWithdrawDetailRequest {
  withdrawalId: string
}

export interface GetTransferHistoryRequest {
  orderId: string
}

export interface CreateTradingPairRequest {
  symbol: string
  baseAsset: string
  quoteAsset: string
  baseAssetPrecision: number
  quoteAssetPrecision: number
  minOrderSize: string
  minOrderValue: string
  maxOrderSize?: string
  maxOrderValue?: string
  tickSize: string
  lotSize: string
  makerFeeRate: string
  takerFeeRate: string
  status?: string
  isMarketOrderEnabled?: boolean
  isLimitOrderEnabled?: boolean
  isStopOrderEnabled?: boolean
  isIcebergOrderEnabled?: boolean
  isHiddenOrderEnabled?: boolean
  description?: string
  tags?: string[]
}

export interface TradingPair {
  id: string
  symbol: string
  baseAsset: string
  quoteAsset: string
  baseAssetPrecision: number
  quoteAssetPrecision: number
  minOrderSize: string
  minOrderValue: string
  maxOrderSize?: string
  maxOrderValue?: string
  tickSize: string
  lotSize: string
  makerFeeRate: string
  takerFeeRate: string
  status: string
  isMarketOrderEnabled: boolean
  isLimitOrderEnabled: boolean
  isStopOrderEnabled: boolean
  isIcebergOrderEnabled: boolean
  isHiddenOrderEnabled: boolean
  description?: string
  tags?: string[]
  createdAt: number
  updatedAt: number
}