# MT5 Trading Backend Integration

A comprehensive Node.js/TypeScript backend for integrating MetaTrader 5 Web API with React/Electron trading dashboards.

## Features

- **Complete MT5 Web API Integration**: Account management, position tracking, trade execution
- **Secure Authentication**: JWT tokens and API key validation
- **Comprehensive Error Handling**: Proper error responses and logging
- **Rate Limiting**: Protection against API abuse
- **TypeScript Support**: Full type safety for all operations
- **Production Ready**: Logging, monitoring, and graceful shutdown

## Quick Start

### 1. Installation

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure your MT5 settings:

```bash
cp .env.example .env
```

Edit `.env` with your MT5 credentials:

```env
# MT5 Web API Configuration
MT5_API_URL=https://your-mt5-server.com/api/v1
MT5_API_KEY=your_mt5_api_key_here
MT5_SERVER_ID=your_mt5_server_id
MT5_LOGIN=your_mt5_login_number
MT5_PASSWORD=your_mt5_password

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Dashboard Authentication
DASHBOARD_API_KEY=your_dashboard_api_key_here
```

### 3. Development

```bash
npm run dev
```

### 4. Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

All endpoints require authentication via JWT token or API key:

```javascript
// JWT Token (preferred)
headers: {
  'Authorization': 'Bearer your-jwt-token'
}

// API Key (alternative)
headers: {
  'X-API-Key': 'your-api-key'
}
```

### Core Endpoints

#### 1. Get Account Information

```http
GET /api/account
```

**Response:**
```json
{
  "success": true,
  "data": {
    "login": 12345678,
    "name": "John Doe",
    "server": "MetaQuotes-Demo",
    "currency": "USD",
    "balance": 10000.00,
    "equity": 10150.50,
    "margin": 500.00,
    "freeMargin": 9650.50,
    "marginLevel": 2030.10,
    "profit": 150.50,
    "leverage": 100,
    "tradeAllowed": true
  },
  "timestamp": "2025-01-09T10:30:00.000Z",
  "path": "/api/account"
}
```

#### 2. Get Open Positions

```http
GET /api/positions
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ticket": 123456789,
      "time": 1704801600,
      "type": 0,
      "volume": 0.1,
      "symbol": "EURUSD",
      "priceOpen": 1.1050,
      "priceCurrent": 1.1065,
      "sl": 1.1000,
      "tp": 1.1100,
      "profit": 15.00,
      "swap": -0.50,
      "comment": "Dashboard Trade"
    }
  ],
  "timestamp": "2025-01-09T10:30:00.000Z",
  "path": "/api/positions"
}
```

#### 3. Place Trade Order

```http
POST /api/trade
Content-Type: application/json

{
  "symbol": "EURUSD",
  "volume": 0.1,
  "side": "buy",
  "stopLoss": 1.1000,
  "takeProfit": 1.1100,
  "comment": "Dashboard buy order"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "retcode": 10009,
    "deal": 987654321,
    "order": 123456789,
    "volume": 0.1,
    "price": 1.1055,
    "comment": "Dashboard buy order"
  },
  "timestamp": "2025-01-09T10:30:00.000Z",
  "path": "/api/trade"
}
```

#### 4. Close Position

```http
POST /api/close
Content-Type: application/json

{
  "positionId": 123456789,
  "volume": 0.1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "retcode": 10009,
    "deal": 987654322,
    "volume": 0.1,
    "price": 1.1060
  },
  "timestamp": "2025-01-09T10:30:00.000Z",
  "path": "/api/close"
}
```

## Frontend Integration Examples

### React/TypeScript Integration

```typescript
import axios from 'axios';

class TradingService {
  private baseURL = 'http://localhost:3001/api';
  private authToken: string;

  constructor(authToken: string) {
    this.authToken = authToken;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    };
  }

  async getAccountInfo() {
    const response = await axios.get(`${this.baseURL}/account`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async getPositions() {
    const response = await axios.get(`${this.baseURL}/positions`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async placeTrade(symbol: string, volume: number, side: 'buy' | 'sell') {
    const response = await axios.post(`${this.baseURL}/trade`, {
      symbol,
      volume,
      side
    }, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async closePosition(positionId: number) {
    const response = await axios.post(`${this.baseURL}/close`, {
      positionId
    }, {
      headers: this.getHeaders()
    });
    return response.data;
  }
}

// Usage in React component
const tradingService = new TradingService('your-jwt-token');

// Get account info
const accountInfo = await tradingService.getAccountInfo();

// Place a buy order
const tradeResult = await tradingService.placeTrade('EURUSD', 0.1, 'buy');

// Close position
const closeResult = await tradingService.closePosition(123456789);
```

### Electron Integration

```typescript
// In your Electron main process
import { TradingApiClient } from './trading-client';

const tradingClient = new TradingApiClient('http://localhost:3001/api');
tradingClient.setAuthToken(userToken);

// IPC handlers for renderer process
ipcMain.handle('trading:getAccount', async () => {
  return await tradingClient.getAccountInfo();
});

ipcMain.handle('trading:getPositions', async () => {
  return await tradingClient.getOpenPositions();
});

ipcMain.handle('trading:placeTrade', async (event, tradeData) => {
  return await tradingClient.placeBuyOrder(
    tradeData.symbol,
    tradeData.volume,
    tradeData.stopLoss,
    tradeData.takeProfit
  );
});

ipcMain.handle('trading:closePosition', async (event, positionId) => {
  return await tradingClient.closePosition(positionId);
});
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Admin/Governor role requirements
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses without sensitive data exposure
- **Logging**: Comprehensive audit trail

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "code": 400,
  "timestamp": "2025-01-09T10:30:00.000Z",
  "path": "/api/trade"
}
```

Common error codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error
- `503`: Service Unavailable (MT5 connection failed)

## Monitoring and Logging

- **Winston Logging**: Structured logging with rotation
- **Health Checks**: `/health` endpoint for monitoring
- **Connection Monitoring**: Automatic MT5 connection health checks
- **Performance Metrics**: Request timing and success rates

## Production Deployment

1. **Environment Variables**: Set all required environment variables
2. **SSL/TLS**: Use HTTPS in production
3. **Reverse Proxy**: Use nginx or similar for load balancing
4. **Process Management**: Use PM2 or similar for process management
5. **Monitoring**: Set up monitoring for logs and health checks

```bash
# Production build
npm run build

# Start with PM2
pm2 start dist/server.js --name "mt5-trading-backend"

# Monitor
pm2 logs mt5-trading-backend
pm2 monit
```

## Testing

```bash
# Run tests
npm test

# Test specific endpoint
curl -X GET http://localhost:3001/api/health

# Test with authentication
curl -X GET http://localhost:3001/api/account \
  -H "Authorization: Bearer your-jwt-token"
```

## Support

For issues or questions:
1. Check the logs in `logs/` directory
2. Verify MT5 configuration in `.env`
3. Test MT5 connection with `/api/health`
4. Review error responses for specific error codes