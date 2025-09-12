/**
 * Validation Utilities
 * Custom validation functions for trading operations
 */

import { TRADING_SYMBOLS, TRADING_LIMITS } from '../config/mt5.config';
import { TradeRequestPayload, ClosePositionPayload } from '../types/mt5.types';

/**
 * Validate trading symbol
 */
export const isValidSymbol = (symbol: string): boolean => {
  const allSymbols = [
    ...TRADING_SYMBOLS.FOREX,
    ...TRADING_SYMBOLS.METALS,
    ...TRADING_SYMBOLS.INDICES,
    ...TRADING_SYMBOLS.CRYPTO
  ];
  
  return allSymbols.includes(symbol as any);
};

/**
 * Validate trading volume
 */
export const isValidVolume = (volume: number): boolean => {
  return volume >= TRADING_LIMITS.MIN_VOLUME && 
         volume <= TRADING_LIMITS.MAX_VOLUME &&
         Number.isFinite(volume);
};

/**
 * Validate price value
 */
export const isValidPrice = (price: number): boolean => {
  return price > 0 && Number.isFinite(price);
};

/**
 * Comprehensive trade request validation
 */
export const validateTradeRequest = (request: TradeRequestPayload): string[] => {
  const errors: string[] = [];

  // Validate symbol
  if (!request.symbol) {
    errors.push('Symbol is required');
  } else if (!isValidSymbol(request.symbol)) {
    errors.push(`Invalid symbol: ${request.symbol}. Must be one of the supported trading symbols.`);
  }

  // Validate volume
  if (request.volume === undefined || request.volume === null) {
    errors.push('Volume is required');
  } else if (!isValidVolume(request.volume)) {
    errors.push(`Invalid volume: ${request.volume}. Must be between ${TRADING_LIMITS.MIN_VOLUME} and ${TRADING_LIMITS.MAX_VOLUME}`);
  }

  // Validate side
  if (!request.side) {
    errors.push('Side is required');
  } else if (!['buy', 'sell'].includes(request.side)) {
    errors.push('Side must be either "buy" or "sell"');
  }

  // Validate optional price
  if (request.price !== undefined && !isValidPrice(request.price)) {
    errors.push('Invalid price value');
  }

  // Validate optional stop loss
  if (request.stopLoss !== undefined && !isValidPrice(request.stopLoss)) {
    errors.push('Invalid stop loss value');
  }

  // Validate optional take profit
  if (request.takeProfit !== undefined && !isValidPrice(request.takeProfit)) {
    errors.push('Invalid take profit value');
  }

  // Validate comment length
  if (request.comment && request.comment.length > 64) {
    errors.push('Comment must be 64 characters or less');
  }

  return errors;
};

/**
 * Comprehensive close position validation
 */
export const validateCloseRequest = (request: ClosePositionPayload): string[] => {
  const errors: string[] = [];

  // Validate position ID
  if (!request.positionId) {
    errors.push('Position ID is required');
  } else if (!Number.isInteger(request.positionId) || request.positionId <= 0) {
    errors.push('Position ID must be a positive integer');
  }

  // Validate optional volume
  if (request.volume !== undefined && !isValidVolume(request.volume)) {
    errors.push(`Invalid volume: ${request.volume}. Must be between ${TRADING_LIMITS.MIN_VOLUME} and ${TRADING_LIMITS.MAX_VOLUME}`);
  }

  return errors;
};

/**
 * Sanitize string input
 */
export const sanitizeString = (input: string, maxLength: number = 64): string => {
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>\"'&]/g, ''); // Remove potentially dangerous characters
};

/**
 * Format number for trading operations
 */
export const formatTradingNumber = (value: number, decimals: number = 5): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Check if market is open (basic implementation)
 */
export const isMarketOpen = (): boolean => {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getUTCHours();

  // Basic forex market hours (Sunday 22:00 UTC to Friday 22:00 UTC)
  if (day === 0 && hour < 22) return false; // Sunday before 22:00
  if (day === 6) return false; // Saturday
  if (day === 5 && hour >= 22) return false; // Friday after 22:00

  return true;
};

/**
 * Calculate position size based on risk management
 */
export const calculatePositionSize = (
  accountBalance: number,
  riskPercentage: number,
  stopLossPoints: number,
  pointValue: number
): number => {
  const riskAmount = accountBalance * (riskPercentage / 100);
  const positionSize = riskAmount / (stopLossPoints * pointValue);
  
  // Round to valid volume step
  return formatTradingNumber(positionSize, 2);
};