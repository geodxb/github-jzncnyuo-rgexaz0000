/**
 * Usage Examples
 * Example implementations for frontend integration
 */

import axios from 'axios';
import { 
  MT5AccountInfo, 
  MT5Position, 
  MT5TradeResult, 
  TradeRequestPayload, 
  ClosePositionPayload,
  ApiResponse 
} from '../types/mt5.types';

// Backend API base URL
const API_BASE_URL = 'http://localhost:3001/api';

// Example API client class for frontend integration
export class TradingApiClient {
  private baseURL: string;
  private authToken: string;
  private apiKey: string;

  constructor(baseURL: string = API_BASE_URL, authToken: string = '', apiKey: string = '') {
    this.baseURL = baseURL;
    this.authToken = authToken;
    this.apiKey = apiKey;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Set API key
   */
  setApiKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * Get request headers
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    return headers;
  }

  /**
   * Example: Get MT5 account information
   */
  async getAccountInfo(): Promise<MT5AccountInfo> {
    try {
      console.log('🔄 Fetching MT5 account information...');
      
      const response = await axios.get<ApiResponse<MT5AccountInfo>>(
        `${this.baseURL}/account`,
        { headers: this.getHeaders() }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch account info');
      }

      console.log('✅ Account info retrieved:', {
        login: response.data.data.login,
        balance: response.data.data.balance,
        equity: response.data.data.equity,
        freeMargin: response.data.data.freeMargin
      });

      return response.data.data;
    } catch (error: any) {
      console.error('❌ Failed to get account info:', error.message);
      throw error;
    }
  }

  /**
   * Example: Get all open positions
   */
  async getOpenPositions(): Promise<MT5Position[]> {
    try {
      console.log('🔄 Fetching open positions...');
      
      const response = await axios.get<ApiResponse<MT5Position[]>>(
        `${this.baseURL}/positions`,
        { headers: this.getHeaders() }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch positions');
      }

      const positions = response.data.data;
      
      console.log('✅ Positions retrieved:', {
        count: positions.length,
        totalProfit: positions.reduce((sum, pos) => sum + pos.profit, 0)
      });

      return positions;
    } catch (error: any) {
      console.error('❌ Failed to get positions:', error.message);
      throw error;
    }
  }

  /**
   * Example: Place a buy order
   */
  async placeBuyOrder(
    symbol: string, 
    volume: number, 
    stopLoss?: number, 
    takeProfit?: number
  ): Promise<MT5TradeResult> {
    try {
      console.log('🔄 Placing buy order...', { symbol, volume });
      
      const tradeRequest: TradeRequestPayload = {
        symbol,
        volume,
        side: 'buy',
        stopLoss,
        takeProfit,
        comment: 'Dashboard Buy Order'
      };

      const response = await axios.post<ApiResponse<MT5TradeResult>>(
        `${this.baseURL}/trade`,
        tradeRequest,
        { headers: this.getHeaders() }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Trade execution failed');
      }

      console.log('✅ Buy order executed:', {
        deal: response.data.data.deal,
        order: response.data.data.order,
        price: response.data.data.price
      });

      return response.data.data;
    } catch (error: any) {
      console.error('❌ Failed to place buy order:', error.message);
      throw error;
    }
  }

  /**
   * Example: Place a sell order
   */
  async placeSellOrder(
    symbol: string, 
    volume: number, 
    stopLoss?: number, 
    takeProfit?: number
  ): Promise<MT5TradeResult> {
    try {
      console.log('🔄 Placing sell order...', { symbol, volume });
      
      const tradeRequest: TradeRequestPayload = {
        symbol,
        volume,
        side: 'sell',
        stopLoss,
        takeProfit,
        comment: 'Dashboard Sell Order'
      };

      const response = await axios.post<ApiResponse<MT5TradeResult>>(
        `${this.baseURL}/trade`,
        tradeRequest,
        { headers: this.getHeaders() }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Trade execution failed');
      }

      console.log('✅ Sell order executed:', {
        deal: response.data.data.deal,
        order: response.data.data.order,
        price: response.data.data.price
      });

      return response.data.data;
    } catch (error: any) {
      console.error('❌ Failed to place sell order:', error.message);
      throw error;
    }
  }

  /**
   * Example: Close a position
   */
  async closePosition(positionId: number, volume?: number): Promise<MT5TradeResult> {
    try {
      console.log('🔄 Closing position...', { positionId, volume });
      
      const closeRequest: ClosePositionPayload = {
        positionId,
        volume
      };

      const response = await axios.post<ApiResponse<MT5TradeResult>>(
        `${this.baseURL}/close`,
        closeRequest,
        { headers: this.getHeaders() }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Position close failed');
      }

      console.log('✅ Position closed:', {
        deal: response.data.data.deal,
        volume: response.data.data.volume,
        price: response.data.data.price
      });

      return response.data.data;
    } catch (error: any) {
      console.error('❌ Failed to close position:', error.message);
      throw error;
    }
  }

  /**
   * Example: Check API health
   */
  async checkHealth(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Health check failed:', error.message);
      throw error;
    }
  }
}

// Example usage in a Node.js application
export const exampleUsage = async (): Promise<void> => {
  try {
    // Initialize API client
    const client = new TradingApiClient();
    client.setAuthToken('your-jwt-token-here');
    client.setApiKey('your-api-key-here');

    // Check health
    console.log('🔄 Checking API health...');
    const health = await client.checkHealth();
    console.log('✅ API Health:', health);

    // Get account information
    console.log('🔄 Getting account information...');
    const account = await client.getAccountInfo();
    console.log('✅ Account Balance:', account.balance);
    console.log('✅ Account Equity:', account.equity);

    // Get open positions
    console.log('🔄 Getting open positions...');
    const positions = await client.getOpenPositions();
    console.log('✅ Open Positions:', positions.length);

    // Place a buy order for EURUSD
    if (account.freeMargin > 1000) { // Check if we have enough margin
      console.log('🔄 Placing EURUSD buy order...');
      const buyResult = await client.placeBuyOrder('EURUSD', 0.1);
      console.log('✅ Buy Order Result:', buyResult);

      // Close the position after 5 seconds (example)
      setTimeout(async () => {
        if (buyResult.order) {
          console.log('🔄 Closing position...');
          const closeResult = await client.closePosition(buyResult.order);
          console.log('✅ Close Result:', closeResult);
        }
      }, 5000);
    }

  } catch (error: any) {
    console.error('❌ Example usage failed:', error.message);
  }
};

// Express.js route examples for direct integration
export const expressRouteExamples = {
  /**
   * Example: Custom trading endpoint
   */
  customTradingEndpoint: async (req: express.Request, res: express.Response) => {
    try {
      const { symbol, action, volume } = req.body;
      
      // Validate request
      if (!symbol || !action || !volume) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: symbol, action, volume'
        });
      }

      // Initialize trading client
      const client = new TradingApiClient();
      client.setAuthToken(req.headers.authorization?.split(' ')[1] || '');

      let result;
      if (action === 'buy') {
        result = await client.placeBuyOrder(symbol, volume);
      } else if (action === 'sell') {
        result = await client.placeSellOrder(symbol, volume);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Must be "buy" or "sell"'
        });
      }

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Example: Portfolio summary endpoint
   */
  portfolioSummaryEndpoint: async (req: express.Request, res: express.Response) => {
    try {
      const client = new TradingApiClient();
      client.setAuthToken(req.headers.authorization?.split(' ')[1] || '');

      // Get account and positions data
      const [account, positions] = await Promise.all([
        client.getAccountInfo(),
        client.getOpenPositions()
      ]);

      // Calculate portfolio metrics
      const totalProfit = positions.reduce((sum, pos) => sum + pos.profit, 0);
      const totalVolume = positions.reduce((sum, pos) => sum + pos.volume, 0);
      const profitablePositions = positions.filter(pos => pos.profit > 0).length;

      const portfolioSummary = {
        account: {
          balance: account.balance,
          equity: account.equity,
          freeMargin: account.freeMargin,
          marginLevel: account.marginLevel
        },
        positions: {
          total: positions.length,
          profitable: profitablePositions,
          unprofitable: positions.length - profitablePositions,
          totalProfit,
          totalVolume
        },
        performance: {
          profitLossRatio: positions.length > 0 ? (profitablePositions / positions.length) * 100 : 0,
          averageProfit: positions.length > 0 ? totalProfit / positions.length : 0
        }
      };

      res.status(200).json({
        success: true,
        data: portfolioSummary,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

export default app;