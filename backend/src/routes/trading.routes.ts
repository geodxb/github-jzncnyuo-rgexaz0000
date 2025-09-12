/**
 * Trading Routes
 * Express.js routes for MT5 trading operations
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { TradingController } from '../controllers/trading.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for trading operations
const tradingRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per windowMs
  message: {
    success: false,
    error: 'Too many trading requests, please try again later',
    code: 429,
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiting for trade execution
const tradeExecutionRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit to 10 trades per minute
  message: {
    success: false,
    error: 'Trade execution rate limit exceeded',
    code: 429,
    timestamp: new Date().toISOString()
  }
});

/**
 * GET /api/account
 * Fetch MT5 account information
 * Requires: Authentication + Admin/Governor role
 */
router.get('/account',
  authenticateToken,
  requireRole(['admin', 'governor']),
  tradingRateLimit,
  TradingController.getAccount
);

/**
 * GET /api/positions
 * Fetch all open positions
 * Requires: Authentication + Admin/Governor role
 */
router.get('/positions',
  authenticateToken,
  requireRole(['admin', 'governor']),
  tradingRateLimit,
  TradingController.getPositions
);

/**
 * POST /api/trade
 * Place a buy/sell order
 * Requires: Authentication + Admin/Governor role + Request validation
 */
router.post('/trade',
  authenticateToken,
  requireRole(['admin', 'governor']),
  tradeExecutionRateLimit,
  [
    body('symbol')
      .isString()
      .isLength({ min: 3, max: 12 })
      .matches(/^[A-Z0-9]+$/)
      .withMessage('Symbol must be a valid trading symbol (3-12 uppercase alphanumeric characters)'),
    
    body('volume')
      .isFloat({ min: 0.01, max: 100 })
      .withMessage('Volume must be between 0.01 and 100'),
    
    body('side')
      .isIn(['buy', 'sell'])
      .withMessage('Side must be either "buy" or "sell"'),
    
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    
    body('stopLoss')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Stop loss must be a positive number'),
    
    body('takeProfit')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Take profit must be a positive number'),
    
    body('comment')
      .optional()
      .isString()
      .isLength({ max: 64 })
      .withMessage('Comment must be a string with maximum 64 characters')
  ],
  TradingController.placeTrade
);

/**
 * POST /api/close
 * Close a position
 * Requires: Authentication + Admin/Governor role + Request validation
 */
router.post('/close',
  authenticateToken,
  requireRole(['admin', 'governor']),
  tradeExecutionRateLimit,
  [
    body('positionId')
      .isInt({ min: 1 })
      .withMessage('Position ID must be a positive integer'),
    
    body('volume')
      .optional()
      .isFloat({ min: 0.01, max: 100 })
      .withMessage('Volume must be between 0.01 and 100')
  ],
  TradingController.closePosition
);

/**
 * GET /api/health
 * Health check endpoint
 * Public endpoint for monitoring
 */
router.get('/health',
  TradingController.healthCheck
);

export default router;