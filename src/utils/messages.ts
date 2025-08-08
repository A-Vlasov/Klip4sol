export interface TokenDetectedMessage {
  type: 'TOKEN_DETECTED';
  address: string;
}

export interface AnalysisReadyMessage {
  type: 'ANALYSIS_READY';
  address: string;
  analysis: TokenAnalysis;
}

export interface GetAnalysisMessage {
  type: 'GET_ANALYSIS';
  address?: string; // Опциональный адрес для загрузки конкретного токена
}

export interface RugcheckData {
  status: 'safe' | 'caution' | 'danger' | 'unknown';
  score: number;
  risk_factors: (string | { name?: string; description?: string; value?: string; score?: number; level?: string })[];
  message?: string;
  rugged?: boolean;
  mint?: string;
  name?: string;
  symbol?: string;
  liquidity?: number;
  detectedAt?: string;
  links?: any[];
}

export interface TokenAnalysis {
  tokenInfo?: {
    name?: string;
    symbol?: string;
    address?: string;
    logo?: string;
    decimals?: number;
    marketCap?: number;
    fdv?: number;
    price?: number;
    price_1m?: number;
    price_5m?: number;
    price_1h?: number;
    price_6h?: number;
    price_24h?: number;
    volume_1m?: number;
    volume_5m?: number;
    volume_1h?: number;
    volume_6h?: number;
    volume_24h?: number;
    swaps_1m?: number;
    swaps_5m?: number;
    swaps_1h?: number;
    swaps_6h?: number;
    swaps_24h?: number;
    buys_1m?: number;
    buys_5m?: number;
    buys_1h?: number;
    buys_6h?: number;
    buys_24h?: number;
    sells_1m?: number;
    sells_5m?: number;
    sells_1h?: number;
    sells_6h?: number;
    sells_24h?: number;
    net_in_volume_1m?: number;
    net_in_volume_5m?: number;
    net_in_volume_1h?: number;
    net_in_volume_6h?: number;
    net_in_volume_24h?: number;
    holder_count?: number;
    total_supply?: number;
    max_supply?: number;
    liquidity?: number;
    biggest_pool_address?: string;
    open_timestamp?: number;
    link?: any;
    social_links?: any;
    bundlers?: number;
    circulating_supply?: number;
    [key: string]: any;
  };
  topBuyers?: Array<{
    wallet: string;
    status?: string;
    tags?: string[];
    maker_token_tags?: string[];
  }>;
  topBuyersMeta?: {
    holder_count?: number;
    statusNow?: any;
  };
  securityInfo?: RugcheckData;
  stats?: {
    holders: number;
    transactions24h: number;
    liquidity: number;
    burnedTokens: number;
  };
  error?: string;
}

export interface ShowNotificationMessage {
  type: 'SHOW_NOTIFICATION';
  title: string;
  message: string;
  contracts: Array<{
    address: string;
    type: string;
  }>;
}

export interface ContractAnalyzeMessage {
  type: 'CONTRACT_ANALYZE';
  address: string;
  contractType: string;
}

export interface ContractClickedMessage {
  type: 'CONTRACT_CLICKED';
  address: string;
  contractType: string;
}

export interface ContractsDetectedMessage {
  type: 'CONTRACTS_DETECTED';
  contracts: Array<{
    address: string;
    type: string;
  }>;
}

export interface ContractAnalysisReadyMessage {
  type: 'CONTRACT_ANALYSIS_READY';
  address: string;
  analysis: TokenAnalysis;
  contractType: string;
}

export type RuntimeMessage =
  | TokenDetectedMessage
  | AnalysisReadyMessage
  | GetAnalysisMessage
  | ShowNotificationMessage
  | ContractAnalyzeMessage
  | ContractClickedMessage
  | ContractsDetectedMessage
  | ContractAnalysisReadyMessage; 