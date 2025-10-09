/**
 * FinanceBro API Client
 * Handles all communication with the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  xp: number;
  coins: number;
  streak: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  xpReward: number;
  orderIndex: number;
  content?: any;
  isUnlocked: boolean;
  isCompleted: boolean;
  status?: string;
  score?: number;
  completedAt?: string;
  createdAt: string;
}

export interface Progress {
  id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  lesson: Lesson;
}

export interface PracticeSession {
  id: string;
  coinsEarned: number;
  coinsLost: number;
  attempts: number;
  lastFeedback?: string;
  sessionData?: any;
  createdAt: string;
  updatedAt: string;
  lesson?: {
    id: string;
    title: string;
    category: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  meta?: any;
}

// User progress summary type
export interface UserProgressSummary {
  completedLessons: number;
  totalXp: number;
  coinsBalance: number;
  accuracyRate: number;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // User endpoints
  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.data) {
      this.setToken(response.data.token);
    }
    
    return response.data!;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.data) {
      this.setToken(response.data.token);
    }
    
    return response.data!;
  }

  async logout(): Promise<void> {
    this.setToken(null);
  }

  async getUserProfile(): Promise<User> {
    // Backend returns { user, stats, achievements } in data
    const response = await this.request<{ user: User; stats?: any; achievements?: any[] }>('/users/profile');
    return (response.data as any)?.user as User;
  }

  async updateUserProfile(userData: {
    username?: string;
    email?: string;
  }): Promise<User> {
    const response = await this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.data!;
  }

  async updateUserStats(stats: {
    xp?: number;
    coins?: number;
    streak?: number;
  }): Promise<User> {
    const response = await this.request<User>('/users/stats', {
      method: 'PUT',
      body: JSON.stringify(stats),
    });
    return response.data!;
  }

  // Update stats with deltas and optionally unlock next lesson
  async updateStatsAndUnlock(payload: {
    xpDelta?: number;
    coinsDelta?: number;
    streakIncrement?: number;
    lessonId?: string;
    score?: number;
  }): Promise<{
    user: User;
    unlocked: boolean;
    nextLesson?: { id: string; title: string; orderIndex: number } | null;
  }> {
    const response = await this.request<any>('/users/updateStats', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data!;
  }

  // Progress summary (completed lessons, total XP, coins, accuracy)
  async getUserProgressSummary(): Promise<UserProgressSummary> {
    const response = await this.request<UserProgressSummary>('/users/progress');
    return response.data!;
  }

  // Lesson endpoints
  async getLessons(params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<{ lessons: Lesson[]; meta: any }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);

    const endpoint = `/lessons${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await this.request<Lesson[]>(endpoint);
    
    return {
      lessons: response.data || [],
      meta: response.meta
    };
  }

  async getLesson(id: string): Promise<Lesson> {
    const response = await this.request<Lesson>(`/lessons/${id}`);
    return response.data!;
  }

  async getLessonCategories(): Promise<Array<{ name: string; count: number }>> {
    const response = await this.request<Array<{ name: string; count: number }>>('/lessons/categories');
    return response.data!;
  }

  async unlockNextLesson(): Promise<{
    unlocked: boolean;
    lesson?: {
      id: string;
      title: string;
      orderIndex: number;
    };
    progress?: {
      id: string;
      status: string;
      createdAt: string;
    };
  }> {
    const response = await this.request<any>('/lessons/unlock', {
      method: 'POST',
    });
    return response.data!;
  }

  // Progress endpoints
  async getProgress(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ progress: Progress[]; meta: any }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);

    const endpoint = `/progress${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await this.request<Progress[]>(endpoint);
    
    return {
      progress: response.data || [],
      meta: response.meta
    };
  }

  async updateProgress(progressData: {
    lessonId: string;
    status?: 'not_started' | 'in_progress' | 'completed';
    score?: number;
  }): Promise<{
    id: string;
    status: string;
    score: number;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    lesson: {
      id: string;
      title: string;
      xpReward: number;
    };
    isNewRecord: boolean;
  }> {
    const response = await this.request<any>('/progress', {
      method: 'PUT',
      body: JSON.stringify(progressData),
    });
    return response.data!;
  }

  async getProgressStats(): Promise<{
    user: {
      xp: number;
      coins: number;
      streak: number;
    };
    lessons: {
      total: number;
      completed: number;
      inProgress: number;
      notStarted: number;
      completionRate: number;
    };
    performance: {
      totalXpEarned: number;
      averageScore: number;
      totalXpFromLessons: number;
    };
    recentActivity: Array<{
      status: string;
      completedAt?: string;
      lessonTitle: string;
    }>;
  }> {
    const response = await this.request<any>('/progress/stats');
    return response.data!;
  }

  // Practice endpoints
  async getPracticeSessions(params?: {
    page?: number;
    limit?: number;
    lessonId?: string;
  }): Promise<{ sessions: PracticeSession[]; meta: any }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.lessonId) searchParams.append('lessonId', params.lessonId);

    const endpoint = `/practice${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await this.request<PracticeSession[]>(endpoint);
    
    return {
      sessions: response.data || [],
      meta: response.meta
    };
  }

  async createPracticeSession(sessionData: {
    lessonId?: string;
    coinsEarned?: number;
    coinsLost?: number;
    attempts?: number;
    feedback?: string;
    sessionData?: any;
  }): Promise<PracticeSession> {
    const response = await this.request<PracticeSession>('/practice', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
    return response.data!;
  }

  async getPracticeStats(): Promise<{
    currentCoins: number;
    totalSessions: number;
    totalCoinsEarned: number;
    totalCoinsLost: number;
    netCoins: number;
    totalAttempts: number;
    successRate: number;
    recentActivity: {
      sessions: number;
      coinsEarned: number;
      coinsLost: number;
      netCoins: number;
    };
    averages: {
      coinsPerSession: number;
      attemptsPerSession: number;
    };
  }> {
    const response = await this.request<any>('/practice/stats');
    return response.data!;
  }

  // AI endpoints (placeholders)
  async testAIService(): Promise<any> {
    const response = await this.request<any>('/ai/test');
    return response.data!;
  }

  async generateFeedback(feedbackData: {
    lessonId: string;
    userAnswer: string;
    question: string;
    context?: any;
  }): Promise<any> {
    const response = await this.request<any>('/ai/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
    return response.data!;
  }

  async generatePracticeScenarios(scenarioData: {
    lessonId?: string;
    difficulty?: string;
    count?: number;
    userLevel?: string;
  }): Promise<any> {
    const response = await this.request<any>('/ai/scenarios', {
      method: 'POST',
      body: JSON.stringify(scenarioData),
    });
    return response.data!;
  }

  async analyzeLearningPatterns(): Promise<any> {
    const response = await this.request<any>('/ai/analysis');
    return response.data!;
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types and client
export type { AuthResponse, ApiResponse };
export default apiClient;
