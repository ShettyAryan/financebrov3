import { StatsDisplay } from "@/components/StatsDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { LessonTrail } from "@/components/LessonTrail";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useLessons, useProgressStats } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: lessonsData, isLoading: lessonsLoading, error: lessonsError } = useLessons({ limit: 10 });
  const { data: progressStats, isLoading: statsLoading } = useProgressStats();

  // Show loading state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-heading font-bold text-2xl text-foreground">
            Please sign in to view your dashboard
          </h1>
          <p className="text-muted-foreground">
            Create an account or sign in to continue your learning journey.
          </p>
        </div>
      </div>
    );
  }

  if (lessonsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          <div className="space-y-4 animate-slide-up">
            <Skeleton className="h-8 w-64" />
            <div className="flex gap-3">
              <Skeleton className="h-16 w-32" />
              <Skeleton className="h-16 w-32" />
              <Skeleton className="h-16 w-32" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="bg-card/50 rounded-2xl p-6 shadow-card">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (lessonsError) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="font-heading font-bold text-2xl text-foreground">
              Failed to load dashboard
            </h1>
            <p className="text-muted-foreground">
              There was an error loading your data. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const lessons = lessonsData?.lessons || [];
  const stats = progressStats || { user: { xp: 0, coins: 0, streak: 0 }, lessons: { completionRate: 0 } };

  // Convert lessons to the format expected by LessonTrail
  const lessonsTrail = lessons.map(lesson => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    isLocked: !lesson.isUnlocked,
    isCompleted: lesson.isCompleted,
    xpReward: lesson.xpReward,
    category: lesson.category,
    order: lesson.orderIndex,
  }));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4 animate-slide-up">
          <h1 className="font-heading font-bold text-3xl text-foreground">
            Welcome back, {user?.username}! 👋
          </h1>
          <StatsDisplay 
            streak={stats.user.streak} 
            xp={stats.user.xp} 
            coins={stats.user.coins} 
          />
          <ProgressBar progress={stats.lessons.completionRate} />
        </div>

        {/* Learning Trail */}
        <section className="space-y-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex justify-between items-center">
            <h2 className="font-heading font-bold text-2xl text-foreground">Your Learning Path</h2>
            <span className="text-sm text-muted-foreground">
              {stats.lessons.completed} / {stats.lessons.total} completed
            </span>
          </div>
          <div className="bg-card/50 rounded-2xl p-6 shadow-card">
            {lessonsTrail.length > 0 ? (
              <LessonTrail lessons={lessonsTrail} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No lessons available yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
