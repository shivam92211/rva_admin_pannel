import axios, { type AxiosInstance } from 'axios';
import { AuthService } from './auth';

// ==================== INTERFACES ==================== //

export interface BotStatistics {
  activePairs: number;
  activeBots: number;
  activeOrders: number;
  pairs: string[];
  websocketConnections: number;
  websocketSymbols: number;
  orderbookStates: number;
  tickerPrices: number;
}

export interface BotPairsResponse {
  pairs: string[];
  count: number;
}

export interface CexBotApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface BotServiceOperationResponse {
  success: boolean;
  message: string;
}

export interface AddBotPairResponse {
  success: boolean;
  message: string;
}

export interface RemoveBotPairResponse {
  success: boolean;
  message: string;
}

// ==================== CEX BOT API SERVICE ==================== //

class CexBotAPI {
  private client: AxiosInstance;

  private getToken = () => {
    const authService = AuthService.getInstance();
    return authService.getToken();
  };

  constructor() {
    const baseURL = import.meta.env.VITE_BOT_API_BASE_URL ||
      (import.meta.env.VITE_API_BASE_URL + '/bot');

    this.client = axios.create({
      baseURL: baseURL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Add request interceptor to include fresh token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, handle logout
          const authService = AuthService.getInstance();
          authService.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== BOT STATISTICS ==================== //

  /**
   * Get comprehensive bot statistics including active pairs, orders, and websocket connections
   */
  async getBotStatistics(): Promise<BotStatistics> {
    const response = await this.client.get<CexBotApiResponse<BotStatistics>>('/api/v0/stats');

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get bot statistics');
    }

    return response.data.data!;
  }

  // ==================== TRADING PAIRS MANAGEMENT ==================== //

  /**
   * Get all active bot trading pairs
   */
  async getBotPairs(): Promise<BotPairsResponse> {
    const response = await this.client.get<CexBotApiResponse<BotPairsResponse>>('/api/v0/pairs');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get bot pairs');
    }
    return response.data.data!;
  }

  /**
   * Add a new trading pair to the bot
   * @param symbol - Trading pair symbol (e.g., 'BTC-USDT', 'ETH-USDT')
   */
  async addBotPair(symbol: string): Promise<AddBotPairResponse> {
    if (!symbol || !symbol.trim()) {
      throw new Error('Symbol is required');
    }
    const response = await this.client.post<AddBotPairResponse>(`/api/v0/pairs/${symbol.trim()}`);
    if (!response.data.success) {
      throw new Error(response.data.message || `Failed to add bot pair ${symbol}`);
    }
    return response.data;
  }

  /**
   * Remove a trading pair from the bot
   * @param symbol - Trading pair symbol to remove
   */
  async removeBotPair(symbol: string): Promise<RemoveBotPairResponse> {
    if (!symbol || !symbol.trim()) {
      throw new Error('Symbol is required');
    }
    const response = await this.client.delete<RemoveBotPairResponse>(`/api/v0/pairs/${symbol.trim()}`);
    if (!response.data.success) {
      throw new Error(response.data.message || `Failed to remove bot pair ${symbol}`);
    }
    return response.data;
  }

  // ==================== BOT SERVICE CONTROL ==================== //

  /**
   * Start the bot service
   */
  async startBotService(): Promise<BotServiceOperationResponse> {
    const response = await this.client.post<BotServiceOperationResponse>('/api/v0/start');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to start bot service');
    }
    return response.data;
  }

  /**
   * Stop the bot service
   */
  async stopBotService(): Promise<BotServiceOperationResponse> {
    const response = await this.client.post<BotServiceOperationResponse>('/api/v0/stop');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to stop bot service');
    }
    return response.data;
  }

  /**
   * Check if the bot is active for a specific trading pair
   * @param symbol - Trading pair symbol to check
   */
  async isBotActiveForPair(symbol: string): Promise<boolean> {
    if (!symbol || !symbol.trim()) {
      throw new Error('Symbol is required');
    }
    const pairs = await this.getBotPairs();
    return pairs.pairs.includes(symbol.trim());
  }

  // ==================== UTILITY METHODS ==================== //

  /**
   * Check if bot service is healthy by getting statistics
   */
  async isServiceHealthy(): Promise<boolean> {
    try {
      await this.getBotStatistics();
      return true;
    } catch (error) {
      console.error('Bot service health check failed:', error);
      return false;
    }
  }

  /**
   * Get formatted bot status summary
   */
  async getBotStatusSummary(): Promise<{
    isHealthy: boolean;
    totalPairs: number;
    totalOrders: number;
    pairs: string[];
  }> {
    try {
      const stats = await this.getBotStatistics();
      return {
        isHealthy: true,
        totalPairs: stats.activePairs,
        totalOrders: stats.activeOrders,
        pairs: stats.pairs,
      };
    } catch (error) {
      return {
        isHealthy: false,
        totalPairs: 0,
        totalOrders: 0,
        pairs: [],
      };
    }
  }

  /**
   * Batch add multiple trading pairs
   * @param symbols - Array of trading pair symbols
   */
  async addMultipleBotPairs(symbols: string[]): Promise<{
    successful: string[];
    failed: Array<{ symbol: string; error: string; }>;
  }> {
    const successful: string[] = [];
    const failed: Array<{ symbol: string; error: string; }> = [];

    for (const symbol of symbols) {
      try {
        await this.addBotPair(symbol);
        successful.push(symbol);
      } catch (error) {
        failed.push({
          symbol,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Batch remove multiple trading pairs
   * @param symbols - Array of trading pair symbols to remove
   */
  async removeMultipleBotPairs(symbols: string[]): Promise<{
    successful: string[];
    failed: Array<{ symbol: string; error: string; }>;
  }> {
    const successful: string[] = [];
    const failed: Array<{ symbol: string; error: string; }> = [];

    for (const symbol of symbols) {
      try {
        await this.removeBotPair(symbol);
        successful.push(symbol);
      } catch (error) {
        failed.push({
          symbol,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { successful, failed };
  }
}

// ==================== SINGLETON EXPORT ==================== //

export const cexBotApi = new CexBotAPI();
export default cexBotApi;

// ==================== REACT HOOKS (OPTIONAL) ==================== //

// You can also create custom React hooks for easier usage
export const useCexBotApi = () => {
  return cexBotApi;
};

// Example usage in React components:
/*
import { useCexBotApi } from './cexbot-api.service';

function BotDashboard() {
  const cexBotApi = useCexBotApi();
  const [stats, setStats] = useState<BotStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const botStats = await cexBotApi.getBotStatistics();
        setStats(botStats);
      } catch (error) {
        console.error('Failed to fetch bot stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleAddPair = async (symbol: string) => {
    try {
      await cexBotApi.addBotPair(symbol);
      // Refresh stats or update UI
    } catch (error) {
      console.error('Failed to add pair:', error);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2>Bot Statistics</h2>
          <p>Active Pairs: {stats?.activePairs}</p>
          <p>Active Orders: {stats?.activeOrders}</p>
          // ... rest of your component
        </div>
      )}
    </div>
  );
}
*/