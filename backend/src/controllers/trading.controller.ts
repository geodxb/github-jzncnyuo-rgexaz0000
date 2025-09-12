/**
 * Trading Controller
 * Handles all trading-related API endpoints
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { mt5Service } from '../services/mt5.service';
import logger from '../utils/logger';
import { 
  TradeRequestPayload, 
  ClosePositionPayload, 
  ApiResponse,
  MT5AccountInfo,
  MT5Position,
  MT5TradeResult
} from '../types/mt5.types';

export class TradingController {
  /**
   * GET /api/account
   * Fetch MT5 account information
   */
  public static async getAccount(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Account info request', {
        userId: req.user?.id,
        ip: req.ip
      });

      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          code: 400,
          timestamp: new Date().toISOString(),
          path: req.path
        };
        res.status(400).json(response);
        return;
      }

      // Check MT5 connection
      const isConnected = await mt5Service.checkConnection();
      if (!isConnected) {
        const response: ApiResponse = {
          success: false,
          error: 'MT5 server connection failed',
          code: 503,
          timestamp: new Date().toISOString(),
          path: req.path
        };
        res.status(503).json(response);
        return;
      }

      // Fetch account information
      const accountInfo: MT5AccountInfo = await mt5Service.getAccount();

      const response: ApiResponse<MT5AccountInfo> = {
        success: true,
        data: accountInfo,
        timestamp: new Date().toISOString(),
        path: req.path
      };

      logger.info('Account info sent successfully', {
        userId: req.user?.id,
        balance: accountInfo.balance,
        equity: accountInfo.equity
      });

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Account info request failed', {
        error: error.message,
        userId: req.user?.id,
        ip: req.ip
      });

      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to fetch account information',
        code: 500,
        timestamp: new Date().toISOString(),
        path: req.path
      };

      res.status(500).json(response);
    }
  }

  /**
   * GET /api/positions
   * Fetch all open positions
   */
  public static async getPositions(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Positions request', {
        userId: req.user?.id,
        ip: req.ip
      });

      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          code: 400,
          timestamp: new Date().toISOString(),
          path: req.path
        };
        res.status(400).json(response);
        return;
      }

      // Check MT5 connection
      const isConnected = await mt5Service.checkConnection();
      if (!isConnected) {
        const response: ApiResponse = {
          success: false,
          error: 'MT5 server connection failed',
          code: 503,
          timestamp: new Date().toISOString(),
          path: req.path
        };
        res.status(503).json(response);
        return;
      }

      // Fetch positions
      const positions: MT5Position[] = await mt5Service.getAllPositions();

      const response: ApiResponse<MT5Position[]> = {
        success: true,
        data: positions,
        timestamp: new Date().toISOString(),
        path: req.path
      };

      logger.info('Positions sent successfully', {
        userId: req.user?.id,
        positionCount: positions.length,
        totalProfit: positions.reduce((sum, pos) => sum + pos.profit, 0)
      });

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Positions request failed', {
        error: error.message,
        userId: req.user?.id,
        ip: req.ip
      });

      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to fetch positions',
        code: 500,
        timestamp: new Date().toISOString(),
        path: req.path
      };

      res.status(500).json(response);
    }
  }

  /**
   * POST /api/trade
   * Place a buy/sell order
   */
  public static async placeTrade(req: Request, res: Response): Promise<void> {
    try {
      const tradeRequest: TradeRequestPayload = req.body;

      logger.info('Trade request received', {
        userId: req.user?.id,
        symbol: tradeRequest.symbol,
        volume: tradeRequest.volume,
        side: tradeRequest.side,
        ip: req.ip
      });

      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          error: `Validation failed: ${errors.array().map(e => e.msg).join(', ')}`,
          code: 400,
          timestamp: new Date().toISOString(),
          path: req.path
        };
        res.status(400).json(response);
        return;
      }

      // Check MT5 connection
      const isConnected = await mt5Service.checkConnection();
      if (!isConnected) {
        const response: ApiResponse = {
          success: false,
          error: 'MT5 server connection failed',
          code: 503,
          timestamp: new Date().toISOString(),
          path: req.path
        };
        res.status(503).json(response);
        return;
      }

      // Execute trade
      const tradeResult: MT5TradeResult = await mt5Service.executeTrade(tradeRequest);

      const response: ApiResponse<MT5TradeResult> = {
        success: true,
        data: tradeResult,
        timestamp: new Date().toISOString(),
        path: req.path
      };

      logger.info('Trade executed successfully', {
        userId: req.user?.id,
        deal: tradeResult.deal,
        order: tradeResult.order,
        symbol: tradeRequest.symbol,
        volume: tradeRequest.volume,
        side: tradeRequest.side
      });

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Trade request failed', {
        error: error.message,
        userId: req.user?.id,
        tradeRequest: req.body,
        ip: req.ip
      });

      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to execute trade',
        code: 500,
        timestamp: new Date().toISOString(),
        path: req.path
      };

      res.status(500).json(response);
    }
  }

  /**
   * POST /api/close
   * Close a position
   */
  public static async closePosition(req: Request, res: Response): Promise<void> {
    try {
      const closeRequest: ClosePositionPayload = req.body;

      logger.info('Close position request received', {
        userId: req.user?.id,
        positionId: closeRequest.positionId,
        volume: closeRequest.volume,
        ip: req.ip
      });

      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          error: `Validation failed: ${errors.array().map(e => e.msg).join(', ')}`,
          code: 400,
          timestamp: new Date().toISOString(),
          path: req.path
        };
        res.status(400).json(response);
        return;
      }

      // Check MT5 connection
      const isConnected = await mt5Service.checkConnection();
      if (!isConnected) {
        const response: ApiResponse = {
          success: false,
          error: 'MT5 server connection failed',
          code: 503,
          timestamp: new Date().toISOString(),
          path: req.path
        };
        res.status(503).json(response);
        return;
      }

      // Close position
      const closeResult: MT5TradeResult = await mt5Service.executeClose(closeRequest);

      const response: ApiResponse<MT5TradeResult> = {
        success: true,
        data: closeResult,
        timestamp: new Date().toISOString(),
        path: req.path
      };

      logger.info('Position closed successfully', {
        userId: req.user?.id,
        positionId: closeRequest.positionId,
        deal: closeResult.deal,
        volume: closeResult.volume
      });

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Close position request failed', {
        error: error.message,
        userId: req.user?.id,
        closeRequest: req.body,
        ip: req.ip
      });

      const response: ApiResponse = {
        success: false,
        error: error.message || 'Failed to close position',
        code: 500,
        timestamp: new Date().toISOString(),
        path: req.path
      };

      res.status(500).json(response);
    }
  }

  /**
   * GET /api/health
   * Health check endpoint for MT5 connection
   */
  public static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const connectionStatus = mt5Service.getConnectionStatus();
      const isConnected = await mt5Service.checkConnection();

      const response: ApiResponse<{
        mt5Connected: boolean;
        lastConnectionCheck: number;
        serverTime: string;
        uptime: number;
      }> = {
        success: true,
        data: {
          mt5Connected: isConnected,
          lastConnectionCheck: connectionStatus.lastCheck,
          serverTime: new Date().toISOString(),
          uptime: process.uptime()
        },
        timestamp: new Date().toISOString(),
        path: req.path
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Health check failed', { error: error.message });

      const response: ApiResponse = {
        success: false,
        error: error.message || 'Health check failed',
        code: 500,
        timestamp: new Date().toISOString(),
        path: req.path
      };

      res.status(500).json(response);
    }
  }
}