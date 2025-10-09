import { BottomNav } from "@/components/BottomNav";
import { StatsDisplay } from "@/components/StatsDisplay";
import { Award, CheckCircle2, TrendingUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useApi";
import { useUserProgressSummary } from "@/hooks/useApi";
import { useProgress } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { isAuthenticated } = useAuth();
  const { data: user, isLoading: userLoading, error: userError } = useUser();
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useUserProgressSummary();
  const { data: progressData, isLoading: progressLoading, error: progressError } = useProgress({ status: 'completed', limit: 5 });

  const xp = user?.xp || 0;
  const coins = user?.coins || 0;
  const streak = user?.streak || 0;
  const level = Math.floor(xp / 200) + 1; // simple level calc
  const xpToNextLevel = (level * 200) - (xp % 200);
  const name = user?.username || 'User';

  const badges = [
    { id: 1, name: "First Lesson", icon: "🎓", earned: (summary?.completedLessons || 0) > 0 },
    { id: 2, name: "Week Streak", icon: "🔥", earned: streak >= 7 },
    { id: 3, name: "Quiz Master", icon: "🏆", earned: (summary?.accuracyRate || 0) >= 80 },
    { id: 4, name: "Practice Pro", icon: "🎯", earned: (summary?.completedLessons || 0) >= 5 },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-heading font-bold text-2xl text-foreground">Please sign in to view your profile</h1>
          <p className="text-muted-foreground">Create an account or sign in to see your name, XP, coins, and streak.</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Header */}
        <div className="space-y-6 animate-slide-up">
          <div className="bg-card rounded-3xl p-6 shadow-card space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <div className="flex-1 space-y-2">
                {userLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : (
                  <h1 className="font-heading font-bold text-2xl text-foreground">{name}</h1>
                )}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-primary/10 rounded-full">
                    <span className="text-sm font-stats font-semibold text-primary">
                      Level {level}
                    </span>
                  </div>
                </div>
                
                {/* Level Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Level Progress</span>
                    <span className="font-stats font-medium text-primary">
                      {xp} / {xp + xpToNextLevel} XP
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${xp + xpToNextLevel === 0 ? 0 : (xp / (xp + xpToNextLevel)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {userLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : (
              <StatsDisplay name={name} level={level} streak={streak} xp={xp} coins={coins} xpToNextLevel={xpToNextLevel} />
            )}
          </div>
        </div>

        {/* Badges Section */}
        <section className="space-y-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" />
            <h2 className="font-heading font-bold text-xl text-foreground">Badges</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`bg-card rounded-2xl p-4 shadow-card text-center space-y-2 ${
                  badge.earned
                    ? "border-2 border-accent"
                    : "opacity-50 grayscale"
                }`}
              >
                <div className="text-4xl">{badge.icon}</div>
                <p className="text-sm font-medium text-foreground">{badge.name}</p>
                {badge.earned && (
                  <CheckCircle2 className="w-4 h-4 text-accent mx-auto" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Performance Insights */}
        <section className="space-y-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-secondary" />
            <h2 className="font-heading font-bold text-xl text-foreground">Performance</h2>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
            {summaryLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Accuracy" value={`${summary?.accuracyRate ?? 0}%`} color="text-primary" />
                <StatCard label="Lessons" value={summary?.completedLessons ?? 0} color="text-secondary" />
                <StatCard label="Total XP" value={xp} color="text-accent" />
                <StatCard label="Streak" value={`${streak} days`} color="text-destructive" />
              </div>
            )}
          </div>
        </section>

        {/* Completed Lessons */}
        <section className="space-y-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-bold text-xl text-foreground">Completed Lessons</h2>
          </div>
          {progressLoading ? (
            <div className="grid gap-3">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : progressError ? (
            <div className="text-sm text-destructive">Failed to load completed lessons.</div>
          ) : (
            <div className="space-y-3">
              {progressData?.progress?.length ? (
                progressData.progress.map((p) => (
                  <div key={p.id} className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{p.lesson.title}</p>
                      <p className="text-xs text-muted-foreground">Completed {p.completedAt ? new Date(p.completedAt).toLocaleDateString() : ''}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-stats font-semibold text-primary">+{p.lesson.xpReward} XP</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-2 text-sm text-muted-foreground">
                  No completed lessons yet. Start learning to see them here.
                </div>
              )}
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button variant="outline" size="lg" className="w-full">
            Edit Profile
          </Button>
          <Button variant="ghost" size="lg" className="w-full text-muted-foreground">
            Settings
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="text-center space-y-1">
      <p className={`font-stats font-bold text-2xl ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default Profile;
