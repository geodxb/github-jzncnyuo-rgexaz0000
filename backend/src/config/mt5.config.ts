/**
 * MT5 Web API Configuration
 * Centralized configuration for MT5 API connection and settings
 */

import dotenv from 'dotenv';

dotenv.config();

export interface MT5Config {
  apiUrl: string;
  apiKey: string;
  serverId: string;
  login: string;
  password: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export const mt5Config: MT5Config = {
  apiUrl: process.env.MT5_API_URL || 'https://your-mt5-server.com/api/v1',
  apiKey: process.env.MT5_API_KEY || '',
  serverId: process.env.MT5_SERVER_ID || '',
  login: process.env.MT5_LOGIN || '',
  password: process.env.MT5_PASSWORD || '',
  timeout: parseInt(process.env.MT5_TIMEOUT || '30000'), // 30 seconds
  retryAttempts: parseInt(process.env.MT5_RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(process.env.MT5_RETRY_DELAY || '1000') // 1 second
};

// Validate required configuration
export const validateMT5Config = (): void => {
  const requiredFields: (keyof MT5Config)[] = ['apiUrl', 'apiKey', 'serverId', 'login', 'password'];
  
  for (const field of requiredFields) {
    if (!mt5Config[field]) {
      throw new Error(`Missing required MT5 configuration: ${field}`);
    }
  }
};

// Trading symbols configuration
export const TRADING_SYMBOLS = {
  FOREX: [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
    'EURJPY', 'GBPJPY', 'EURGBP', 'AUDJPY', 'EURAUD', 'EURCHF', 'AUDNZD'
  ],
  METALS: [
    'XAUUSD', 'XAGUSD', 'XPTUSD', 'XPDUSD'
  ],
  INDICES: [
    'US30', 'US500', 'NAS100', 'UK100', 'GER30', 'FRA40', 'JPN225'
  ],
  CRYPTO: [
    'BTCUSD', 'ETHUSD', 'LTCUSD', 'XRPUSD', 'ADAUSD', 'DOTUSD'
  ]
} as const;

// Trading limits and validation
export const TRADING_LIMITS = {
  MIN_VOLUME: 0.01,
  MAX_VOLUME: 100.0,
  MAX_SLIPPAGE: 10,
  DEFAULT_DEVIATION: 5,
  MAX_POSITIONS: 100
} as const;