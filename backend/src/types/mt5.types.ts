/**
 * MT5 Web API Type Definitions
 * Comprehensive types for all MT5 trading operations
 */

// Base MT5 API Response
export interface MT5ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
  message?: string;
}

// Account Information Types
export interface MT5AccountInfo {
  login: number;
  name: string;
  server: string;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  profit: number;
  credit: number;
  company: string;
  leverage: number;
  tradeAllowed: boolean;
  tradeExpert: boolean;
  limitOrders: number;
  marginSoCall: number;
  marginSoMode: number;
  marginInit: number;
  marginMaintenance: number;
  assets: number;
  liabilities: number;
  commissionBlocked: number;
}

// Position Types
export interface MT5Position {
  ticket: number;
  time: number;
  timeUpdate: number;
  type: MT5PositionType;
  magic: number;
  identifier: number;
  reason: MT5PositionReason;
  volume: number;
  priceOpen: number;
  sl: number;
  tp: number;
  priceCurrent: number;
  swap: number;
  profit: number;
  symbol: string;
  comment: string;
  externalId: string;
}

export enum MT5PositionType {
  BUY = 0,
  SELL = 1
}

export enum MT5PositionReason {
  CLIENT = 0,
  MOBILE = 1,
  WEB = 2,
  EXPERT = 3,
  DEALER = 4,
  SL = 5,
  TP = 6,
  SO = 7
}

// Trade Request Types
export interface MT5TradeRequest {
  action: MT5TradeAction;
  magic?: number;
  order?: number;
  symbol: string;
  volume: number;
  price?: number;
  stoplimit?: number;
  sl?: number;
  tp?: number;
  deviation?: number;
  type: MT5OrderType;
  typeFilling?: MT5OrderFilling;
  typeTime?: MT5OrderTime;
  expiration?: number;
  comment?: string;
  positionBy?: number;
}

export enum MT5TradeAction {
  DEAL = 1,
  PENDING = 5,
  SLTP = 6,
  MODIFY = 7,
  REMOVE = 8,
  CLOSE_BY = 10
}

export enum MT5OrderType {
  BUY = 0,
  SELL = 1,
  BUY_LIMIT = 2,
  SELL_LIMIT = 3,
  BUY_STOP = 4,
  SELL_STOP = 5,
  BUY_STOP_LIMIT = 6,
  SELL_STOP_LIMIT = 7,
  CLOSE_BY = 8
}

export enum MT5OrderFilling {
  FOK = 0,
  IOC = 1,
  RETURN = 2
}

export enum MT5OrderTime {
  GTC = 0,
  DAY = 1,
  SPECIFIED = 2,
  SPECIFIED_DAY = 3
}

// Trade Result Types
export interface MT5TradeResult {
  retcode: number;
  deal?: number;
  order?: number;
  volume?: number;
  price?: number;
  bid?: number;
  ask?: number;
  comment?: string;
  requestId?: number;
  retcodeExternal?: number;
}

// Symbol Information Types
export interface MT5SymbolInfo {
  name: string;
  basis: string;
  category: string;
  currency: string;
  currencyProfit: string;
  currencyMargin: string;
  digits: number;
  trade: MT5SymbolTradeMode;
  backgroundColor: number;
  id: number;
  select: boolean;
  visible: boolean;
  sessionDeals: number;
  sessionBuyOrders: number;
  sessionSellOrders: number;
  volume: number;
  volumeHigh: number;
  volumeLow: number;
  time: number;
  bid: number;
  bidHigh: number;
  bidLow: number;
  ask: number;
  askHigh: number;
  askLow: number;
  last: number;
  lastHigh: number;
  lastLow: number;
  volumeReal: number;
  volumeHighReal: number;
  volumeLowReal: number;
  optionStrike: number;
  point: number;
  tradeTickValue: number;
  tradeTickValueProfit: number;
  tradeTickValueLoss: number;
  tradeTickSize: number;
  tradeContractSize: number;
  tradeAccruedInterest: number;
  tradeFaceValue: number;
  tradeLiquidityRate: number;
  volumeMin: number;
  volumeMax: number;
  volumeStep: number;
  volumeLimit: number;
  swapLong: number;
  swapShort: number;
  marginInitial: number;
  marginMaintenance: number;
  sessionVolume: number;
  sessionTurnover: number;
  sessionInterest: number;
  sessionBuyOrdersVolume: number;
  sessionSellOrdersVolume: number;
  sessionOpen: number;
  sessionClose: number;
  sessionAw: number;
  sessionPriceSettlement: number;
  sessionPriceLimitMin: number;
  sessionPriceLimitMax: number;
  marginHedged: number;
  priceChange: number;
  priceVolatility: number;
  priceTheoretical: number;
  priceGreeks: {
    delta: number;
    theta: number;
    gamma: number;
    vega: number;
    rho: number;
    omega: number;
  };
}

export enum MT5SymbolTradeMode {
  DISABLED = 0,
  LONGONLY = 1,
  SHORTONLY = 2,
  CLOSEONLY = 3,
  FULL = 4
}

// Market Data Types
export interface MT5Tick {
  symbol: string;
  time: number;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  timeMs: number;
  flags: number;
  volumeReal: number;
}

// Order Types
export interface MT5Order {
  ticket: number;
  timeSetup: number;
  timeSetupMs: number;
  timeDone: number;
  timeDoneMs: number;
  timeExpiration: number;
  type: MT5OrderType;
  typeFilling: MT5OrderFilling;
  typeTime: MT5OrderTime;
  state: MT5OrderState;
  magic: number;
  positionId: number;
  positionById: number;
  reason: MT5OrderReason;
  volumeInitial: number;
  volumeCurrent: number;
  priceOpen: number;
  sl: number;
  tp: number;
  priceCurrent: number;
  priceStoplimit: number;
  symbol: string;
  comment: string;
  externalId: string;
}

export enum MT5OrderState {
  STARTED = 0,
  PLACED = 1,
  CANCELED = 2,
  PARTIAL = 3,
  FILLED = 4,
  REJECTED = 5,
  EXPIRED = 6,
  REQUEST_ADD = 7,
  REQUEST_MODIFY = 8,
  REQUEST_CANCEL = 9
}

export enum MT5OrderReason {
  CLIENT = 0,
  MOBILE = 1,
  WEB = 2,
  EXPERT = 3,
  DEALER = 4,
  SL = 5,
  TP = 6,
  SO = 7
}

// API Request/Response Types for our backend
export interface TradeRequestPayload {
  symbol: string;
  volume: number;
  side: 'buy' | 'sell';
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  comment?: string;
}

export interface ClosePositionPayload {
  positionId: number;
  volume?: number; // Optional partial close
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: number;
  timestamp: string;
  path: string;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
  path: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;