
export interface SupportedChain {
  chain: string;
  name: string;
  enabled: boolean;
  description?: string;
  addressExplorer: string;
  hashExplorer: string;
}

export const SUPPORTED_CHAINS: SupportedChain[] = [
  {
    chain: 'eth',
    name: 'Ethereum',
    enabled: true,
    description: 'Ethereum mainnet',
    addressExplorer: 'https://etherscan.io/address/<address>',
    hashExplorer: 'https://etherscan.io/tx/<hash>'
  },
  {
    chain: 'bech32',
    name: 'Bech32',
    enabled: true,
    description: 'Bech32 address format',
    addressExplorer: 'https://blockstream.info/address/<address>',
    hashExplorer: 'https://blockstream.info/tx/<hash>'
  },
  {
    chain: 'btc',
    name: 'Bitcoin',
    enabled: true,
    description: 'Bitcoin mainnet',
    addressExplorer: 'https://blockstream.info/address/<address>',
    hashExplorer: 'https://blockstream.info/tx/<hash>'
  },
  {
    chain: 'kcc',
    name: 'KuCoin Community Chain',
    enabled: true,
    description: 'KuCoin Community Chain',
    addressExplorer: 'https://explorer.kcc.io/address/<address>',
    hashExplorer: 'https://explorer.kcc.io/tx/<hash>'
  },
  {
    chain: 'trx',
    name: 'TRON',
    enabled: true,
    description: 'TRON network',
    addressExplorer: 'https://tronscan.org/#/address/<address>',
    hashExplorer: 'https://tronscan.org/#/transaction/<hash>'
  },
  {
    chain: 'bsc',
    name: 'Binance Smart Chain',
    enabled: true,
    description: 'Binance Smart Chain mainnet',
    addressExplorer: 'https://bscscan.com/address/<address>',
    hashExplorer: 'https://bscscan.com/tx/<hash>'
  },
  {
    chain: 'arbitrum',
    name: 'Arbitrum',
    enabled: true,
    description: 'Arbitrum Layer 2',
    addressExplorer: 'https://arbiscan.io/address/<address>',
    hashExplorer: 'https://arbiscan.io/tx/<hash>'
  },
  {
    chain: 'ton',
    name: 'TON',
    enabled: true,
    description: 'The Open Network',
    addressExplorer: 'https://tonscan.org/address/<address>',
    hashExplorer: 'https://tonscan.org/tx/<hash>'
  },
  {
    chain: 'optimism',
    name: 'Optimism',
    enabled: true,
    description: 'Optimism Layer 2',
    addressExplorer: 'https://optimistic.etherscan.io/address/<address>',
    hashExplorer: 'https://optimistic.etherscan.io/tx/<hash>'
  }
];

export type ChainId = 'eth' | 'bech32' | 'btc' | 'kcc' | 'trx' | 'bsc' | 'arbitrum' | 'ton' | 'optimism';

const chainMap: { [key: string]: SupportedChain; } = SUPPORTED_CHAINS.reduce((map, chain) => {
  map[chain.chain] = chain;
  return map;
}, {} as { [key: string]: SupportedChain; });

export const getSupportedChain = (chainId: ChainId): SupportedChain | null => {
  return chainMap[chainId] || null;
};