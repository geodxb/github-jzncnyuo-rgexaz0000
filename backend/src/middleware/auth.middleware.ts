/**
 * Authentication Middleware
 * Handles JWT token validation and API key authentication
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to authenticate dashboard users via JWT token
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logger.warn('Authentication failed: No token provided', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      });
      
      res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 401,
        timestamp: new Date().toISOString(),
        path: req.path
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET not configured');
      res.status(500).json({
        success: false,
        error: 'Server configuration error',
        code: 500,
        timestamp: new Date().toISOString(),
        path: req.path
      });
      return;
    }

    jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
      if (err) {
        logger.warn('Authentication failed: Invalid token', {
          error: err.message,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path
        });
        
        res.status(403).json({
          success: false,
          error: 'Invalid or expired token',
          code: 403,
          timestamp: new Date().toISOString(),
          path: req.path
        });
        return;
      }

      req.user = decoded;
      logger.info('User authenticated successfully', {
        userId: decoded.id,
        email: decoded.email,
        role: decoded.role,
        path: req.path
      });
      
      next();
    });
  } catch (error) {
    logger.error('Authentication middleware error', { error });
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
};

/**
 * Middleware to authenticate API requests via API key
 */
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const expectedApiKey = process.env.DASHBOARD_API_KEY;

    if (!expectedApiKey) {
      logger.error('DASHBOARD_API_KEY not configured');
      res.status(500).json({
        success: false,
        error: 'Server configuration error',
        code: 500,
        timestamp: new Date().toISOString(),
        path: req.path
      });
      return;
    }

    if (!apiKey || apiKey !== expectedApiKey) {
      logger.warn('API key authentication failed', {
        providedKey: apiKey ? 'PROVIDED' : 'MISSING',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      });
      
      res.status(401).json({
        success: false,
        error: 'Invalid API key',
        code: 401,
        timestamp: new Date().toISOString(),
        path: req.path
      });
      return;
    }

    logger.info('API key authenticated successfully', {
      ip: req.ip,
      path: req.path
    });
    
    next();
  } catch (error) {
    logger.error('API key authentication error', { error });
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 401,
        timestamp: new Date().toISOString(),
        path: req.path
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed: Insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path
      });
      
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 403,
        timestamp: new Date().toISOString(),
        path: req.path
      });
      return;
    }

    next();
  };
};