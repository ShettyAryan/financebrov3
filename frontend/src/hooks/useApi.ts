import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient, { Lesson, Progress, PracticeSession, User } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Query Keys
export const queryKeys = {
  user: ['user'] as const,
  lessons: ['lessons'] as const,
  lesson: (id: string) => ['lesson', id] as const,
  lessonCategories: ['lesson-categories'] as const,
  progress: ['progress'] as const,
  progressStats: ['progress-stats'] as const,
  practice: ['practice'] as const,
  practiceStats: ['practice-stats'] as const,
  aiTest: ['ai-test'] as const,
} as const;

// User Hooks
export const useUser = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => apiClient.getUserProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: (userData: { username?: string; email?: string }) =>
      apiClient.updateUserProfile(userData),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.setQueryData(queryKeys.user, updatedUser);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    },
  });
};

export const useUpdateUserStats = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: (stats: { xp?: number; coins?: number; streak?: number }) =>
      apiClient.updateUserStats(stats),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.setQueryData(queryKeys.user, updatedUser);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update stats');
    },
  });
};

// Lesson Hooks
export const useLessons = (params?: { page?: number; limit?: number; category?: string }) => {
  return useQuery({
    queryKey: [...queryKeys.lessons, params],
    queryFn: () => apiClient.getLessons(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useLesson = (id: string) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.lesson(id),
    queryFn: () => apiClient.getLesson(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLessonCategories = () => {
  return useQuery({
    queryKey: queryKeys.lessonCategories,
    queryFn: () => apiClient.getLessonCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUnlockNextLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.unlockNextLesson(),
    onSuccess: (result) => {
      if (result.unlocked) {
        toast.success(`New lesson unlocked: ${result.lesson?.title}`);
        // Invalidate and refetch lessons and progress
        queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
        queryClient.invalidateQueries({ queryKey: queryKeys.progress });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to unlock lesson');
    },
  });
};

// Progress Hooks
export const useProgress = (params?: { page?: number; limit?: number; status?: string }) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: [...queryKeys.progress, params],
    queryFn: () => apiClient.getProgress(params),
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useProgressStats = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.progressStats,
    queryFn: () => apiClient.getProgressStats(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (progressData: {
      lessonId: string;
      status?: 'not_started' | 'in_progress' | 'completed';
      score?: number;
    }) => apiClient.updateProgress(progressData),
    onSuccess: (result) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.progress });
      queryClient.invalidateQueries({ queryKey: queryKeys.progressStats });
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
      
      // Refresh user stats
      refreshUser();
      
      if (result.status === 'completed') {
        toast.success(`Lesson completed! +${result.lesson.xpReward} XP earned`);
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update progress');
    },
  });
};

// Practice Hooks
export const usePracticeSessions = (params?: { page?: number; limit?: number; lessonId?: string }) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: [...queryKeys.practice, params],
    queryFn: () => apiClient.getPracticeSessions(params),
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const usePracticeStats = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.practiceStats,
    queryFn: () => apiClient.getPracticeStats(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreatePracticeSession = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (sessionData: {
      lessonId?: string;
      coinsEarned?: number;
      coinsLost?: number;
      attempts?: number;
      feedback?: string;
      sessionData?: any;
    }) => apiClient.createPracticeSession(sessionData),
    onSuccess: (session) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.practice });
      queryClient.invalidateQueries({ queryKey: queryKeys.practiceStats });
      
      // Refresh user stats
      refreshUser();
      
      if (session.coinsEarned > 0) {
        toast.success(`Practice completed! +${session.coinsEarned} coins earned`);
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create practice session');
    },
  });
};

// AI Hooks
export const useAITest = () => {
  return useQuery({
    queryKey: queryKeys.aiTest,
    queryFn: () => apiClient.testAIService(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGenerateFeedback = () => {
  return useMutation({
    mutationFn: (feedbackData: {
      lessonId: string;
      userAnswer: string;
      question: string;
      context?: any;
    }) => apiClient.generateFeedback(feedbackData),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to generate feedback');
    },
  });
};

export const useGeneratePracticeScenarios = () => {
  return useMutation({
    mutationFn: (scenarioData: {
      lessonId?: string;
      difficulty?: string;
      count?: number;
      userLevel?: string;
    }) => apiClient.generatePracticeScenarios(scenarioData),
    onSuccess: (result) => {
      toast.success(`${result.scenarios.length} practice scenarios generated`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to generate scenarios');
    },
  });
};

export const useAnalyzeLearningPatterns = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['ai-analysis'],
    queryFn: () => apiClient.analyzeLearningPatterns(),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
