/**
 * MT5 Web API Service
 * Core service for interacting with MetaTrader 5 Web API
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { mt5Config, validateMT5Config } from '../config/mt5.config';
import logger from '../utils/logger';
import {
  MT5ApiResponse,
  MT5AccountInfo,
  MT5Position,
  MT5TradeRequest,
  MT5TradeResult,
  MT5SymbolInfo,
  MT5Tick,
  MT5Order,
  MT5OrderType,
  MT5TradeAction,
  TradeRequestPayload,
  ClosePositionPayload
} from '../types/mt5.types';

export class MT5Service {
  private static instance: MT5Service;
  private axiosInstance: AxiosInstance;
  private isConnected: boolean = false;
  private lastConnectionCheck: number = 0;
  private connectionCheckInterval: number = 30000; // 30 seconds

  private constructor() {
    // Validate configuration on initialization
    validateMT5Config();

    // Create axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL: mt5Config.apiUrl,
      timeout: mt5Config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mt5Config.apiKey}`,
        'X-MT5-Server': mt5Config.serverId,
        'User-Agent': 'InteractiveBrokers-Dashboard/1.0'
      }
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        logger.info('MT5 API Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data ? 'DATA_PRESENT' : 'NO_DATA'
        });
        return config;
      },
      (error) => {
        logger.error('MT5 API Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging and error handling
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.info('MT5 API Response', {
          status: response.status,
          url: response.config.url,
          dataSize: JSON.stringify(response.data).length
        });
        return response;
      },
      (error) => {
        logger.error('MT5 API Response Error', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get singleton instance of MT5Service
   */
  public static getInstance(): MT5Service {
    if (!MT5Service.instance) {
      MT5Service.instance = new MT5Service();
    }
    return MT5Service.instance;
  }

  /**
   * Check MT5 server connection status
   */
  public async checkConnection(): Promise<boolean> {
    try {
      const now = Date.now();
      
      // Use cached result if checked recently
      if (this.isConnected && (now - this.lastConnectionCheck) < this.connectionCheckInterval) {
        return this.isConnected;
      }

      logger.info('Checking MT5 server connection...');
      
      const response = await this.axiosInstance.get('/ping', {
        timeout: 5000 // Quick timeout for connection check
      });
      
      this.isConnected = response.status === 200;
      this.lastConnectionCheck = now;
      
      logger.info('MT5 connection check result', { connected: this.isConnected });
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      this.lastConnectionCheck = Date.now();
      logger.error('MT5 connection check failed', { error });
      return false;
    }
  }

  /**
   * Get MT5 account information
   */
  public async getAccountInfo(): Promise<MT5AccountInfo> {
    try {
      logger.info('Fetching MT5 account information...');
      
      const response = await this.axiosInstance.post('/account/info', {
        login: mt5Config.login,
        password: mt5Config.password,
        server: mt5Config.serverId
      });

      const apiResponse: MT5ApiResponse<MT5AccountInfo> = response.data;
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error || 'Failed to fetch account info');
      }

      logger.info('Account info retrieved successfully', {
        login: apiResponse.data.login,
        balance: apiResponse.data.balance,
        equity: apiResponse.data.equity
      });

      return apiResponse.data;
    } catch (error: any) {
      logger.error('Failed to get account info', { error: error.message });
      throw new Error(`MT5 Account Info Error: ${error.message}`);
    }
  }

  /**
   * Get all open positions
   */
  public async getPositions(): Promise<MT5Position[]> {
    try {
      logger.info('Fetching MT5 open positions...');
      
      const response = await this.axiosInstance.post('/positions/get', {
        login: mt5Config.login,
        password: mt5Config.password,
        server: mt5Config.serverId
      });

      const apiResponse: MT5ApiResponse<MT5Position[]> = response.data;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Failed to fetch positions');
      }

      const positions = apiResponse.data || [];
      
      logger.info('Positions retrieved successfully', {
        count: positions.length,
        totalProfit: positions.reduce((sum, pos) => sum + pos.profit, 0)
      });

      return positions;
    } catch (error: any) {
      logger.error('Failed to get positions', { error: error.message });
      throw new Error(`MT5 Positions Error: ${error.message}`);
    }
  }

  /**
   * Place a trade order
   */
  public async placeTrade(tradeRequest: TradeRequestPayload): Promise<MT5TradeResult> {
    try {
      logger.info('Placing MT5 trade order', {
        symbol: tradeRequest.symbol,
        volume: tradeRequest.volume,
        side: tradeRequest.side
      });

      // Validate trade request
      this.validateTradeRequest(tradeRequest);

      // Convert our simplified request to MT5 format
      const mt5Request: MT5TradeRequest = {
        action: MT5TradeAction.DEAL,
        symbol: tradeRequest.symbol,
        volume: tradeRequest.volume,
        type: tradeRequest.side === 'buy' ? MT5OrderType.BUY : MT5OrderType.SELL,
        price: tradeRequest.price,
        sl: tradeRequest.stopLoss,
        tp: tradeRequest.takeProfit,
        comment: tradeRequest.comment || 'Dashboard Trade',
        deviation: 5, // 5 points slippage tolerance
        magic: 123456 // Magic number for dashboard trades
      };

      const response = await this.axiosInstance.post('/trade/send', {
        login: mt5Config.login,
        password: mt5Config.password,
        server: mt5Config.serverId,
        request: mt5Request
      });

      const apiResponse: MT5ApiResponse<MT5TradeResult> = response.data;
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error || 'Trade execution failed');
      }

      const result = apiResponse.data;
      
      // Check if trade was successful
      if (result.retcode !== 10009) { // TRADE_RETCODE_DONE
        throw new Error(`Trade failed with code ${result.retcode}: ${this.getRetcodeMessage(result.retcode)}`);
      }

      logger.info('Trade executed successfully', {
        deal: result.deal,
        order: result.order,
        volume: result.volume,
        price: result.price,
        symbol: tradeRequest.symbol
      });

      return result;
    } catch (error: any) {
      logger.error('Failed to place trade', { 
        error: error.message,
        tradeRequest 
      });
      throw new Error(`MT5 Trade Error: ${error.message}`);
    }
  }

  /**
   * Close a position
   */
  public async closePosition(closeRequest: ClosePositionPayload): Promise<MT5TradeResult> {
    try {
      logger.info('Closing MT5 position', {
        positionId: closeRequest.positionId,
        volume: closeRequest.volume
      });

      // First, get the position details
      const positions = await this.getPositions();
      const position = positions.find(pos => pos.ticket === closeRequest.positionId);
      
      if (!position) {
        throw new Error(`Position ${closeRequest.positionId} not found`);
      }

      // Create close request
      const mt5Request: MT5TradeRequest = {
        action: MT5TradeAction.DEAL,
        symbol: position.symbol,
        volume: closeRequest.volume || position.volume,
        type: position.type === 0 ? MT5OrderType.SELL : MT5OrderType.BUY, // Opposite of current position
        positionBy: position.ticket,
        comment: 'Dashboard Close',
        deviation: 5,
        magic: 123456
      };

      const response = await this.axiosInstance.post('/trade/send', {
        login: mt5Config.login,
        password: mt5Config.password,
        server: mt5Config.serverId,
        request: mt5Request
      });

      const apiResponse: MT5ApiResponse<MT5TradeResult> = response.data;
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error || 'Position close failed');
      }

      const result = apiResponse.data;
      
      if (result.retcode !== 10009) {
        throw new Error(`Close failed with code ${result.retcode}: ${this.getRetcodeMessage(result.retcode)}`);
      }

      logger.info('Position closed successfully', {
        deal: result.deal,
        positionId: closeRequest.positionId,
        volume: result.volume,
        price: result.price
      });

      return result;
    } catch (error: any) {
      logger.error('Failed to close position', { 
        error: error.message,
        closeRequest 
      });
      throw new Error(`MT5 Close Error: ${error.message}`);
    }
  }

  /**
   * Get symbol information
   */
  public async getSymbolInfo(symbol: string): Promise<MT5SymbolInfo> {
    try {
      const response = await this.axiosInstance.post('/symbol/info', {
        login: mt5Config.login,
        password: mt5Config.password,
        server: mt5Config.serverId,
        symbol
      });

      const apiResponse: MT5ApiResponse<MT5SymbolInfo> = response.data;
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error || 'Failed to fetch symbol info');
      }

      return apiResponse.data;
    } catch (error: any) {
      logger.error('Failed to get symbol info', { error: error.message, symbol });
      throw new Error(`MT5 Symbol Info Error: ${error.message}`);
    }
  }

  /**
   * Get current market prices
   */
  public async getMarketPrices(symbols: string[]): Promise<MT5Tick[]> {
    try {
      const response = await this.axiosInstance.post('/market/ticks', {
        login: mt5Config.login,
        password: mt5Config.password,
        server: mt5Config.serverId,
        symbols
      });

      const apiResponse: MT5ApiResponse<MT5Tick[]> = response.data;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Failed to fetch market prices');
      }

      return apiResponse.data || [];
    } catch (error: any) {
      logger.error('Failed to get market prices', { error: error.message, symbols });
      throw new Error(`MT5 Market Data Error: ${error.message}`);
    }
  }

  /**
   * Validate trade request parameters
   */
  private validateTradeRequest(request: TradeRequestPayload): void {
    const { symbol, volume, side } = request;

    if (!symbol || typeof symbol !== 'string') {
      throw new Error('Invalid symbol provided');
    }

    if (!volume || typeof volume !== 'number' || volume <= 0) {
      throw new Error('Invalid volume provided');
    }

    if (volume < 0.01 || volume > 100) {
      throw new Error('Volume must be between 0.01 and 100');
    }

    if (!side || !['buy', 'sell'].includes(side)) {
      throw new Error('Invalid side provided (must be "buy" or "sell")');
    }

    // Validate stop loss and take profit if provided
    if (request.stopLoss !== undefined && typeof request.stopLoss !== 'number') {
      throw new Error('Invalid stop loss value');
    }

    if (request.takeProfit !== undefined && typeof request.takeProfit !== 'number') {
      throw new Error('Invalid take profit value');
    }
  }

  /**
   * Get human-readable message for MT5 return codes
   */
  private getRetcodeMessage(retcode: number): string {
    const retcodeMsgs: Record<number, string> = {
      10009: 'Request completed',
      10010: 'Only part of the request was completed',
      10011: 'Request processing error',
      10012: 'Request canceled by timeout',
      10013: 'Invalid request',
      10014: 'Invalid volume in the request',
      10015: 'Invalid price in the request',
      10016: 'Invalid stops in the request',
      10017: 'Trade is disabled',
      10018: 'Market is closed',
      10019: 'There is not enough money to complete the request',
      10020: 'Prices changed',
      10021: 'There are no quotes to process the request',
      10022: 'Invalid request expiration',
      10023: 'Order state changed',
      10024: 'Too frequent requests',
      10025: 'No changes in request',
      10026: 'Autotrading disabled by server',
      10027: 'Autotrading disabled by client terminal',
      10028: 'Request locked for processing',
      10029: 'Order or position frozen',
      10030: 'Invalid order filling type',
      10031: 'No connection with the trade server'
    };

    return retcodeMsgs[retcode] || `Unknown error code: ${retcode}`;
  }

  /**
   * Retry mechanism for failed requests
   */
  private async retryRequest<T>(
    operation: () => Promise<T>,
    attempts: number = mt5Config.retryAttempts
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (attempts > 1) {
        logger.warn(`Request failed, retrying... (${mt5Config.retryAttempts - attempts + 1}/${mt5Config.retryAttempts})`, {
          error: error.message
        });
        
        await new Promise(resolve => setTimeout(resolve, mt5Config.retryDelay));
        return this.retryRequest(operation, attempts - 1);
      }
      throw error;
    }
  }

  /**
   * Public method to get account info with retry
   */
  public async getAccount(): Promise<MT5AccountInfo> {
    return this.retryRequest(() => this.getAccountInfo());
  }

  /**
   * Public method to get positions with retry
   */
  public async getAllPositions(): Promise<MT5Position[]> {
    return this.retryRequest(() => this.getPositions());
  }

  /**
   * Public method to place trade with retry
   */
  public async executeTrade(request: TradeRequestPayload): Promise<MT5TradeResult> {
    return this.retryRequest(() => this.placeTrade(request));
  }

  /**
   * Public method to close position with retry
   */
  public async executeClose(request: ClosePositionPayload): Promise<MT5TradeResult> {
    return this.retryRequest(() => this.closePosition(request));
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): { connected: boolean; lastCheck: number } {
    return {
      connected: this.isConnected,
      lastCheck: this.lastConnectionCheck
    };
  }
}

// Export singleton instance
export const mt5Service = MT5Service.getInstance();