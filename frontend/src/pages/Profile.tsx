import { BottomNav } from "@/components/BottomNav";
import { StatsDisplay } from "@/components/StatsDisplay";
import { Award, CheckCircle2, TrendingUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const userData = {
    name: "Aryan",
    level: 8,
    streak: 7,
    xp: 1250,
    coins: 340,
    xpToNextLevel: 250,
  };

  const badges = [
    { id: 1, name: "First Lesson", icon: "🎓", earned: true },
    { id: 2, name: "Week Streak", icon: "🔥", earned: true },
    { id: 3, name: "Quiz Master", icon: "🏆", earned: false },
    { id: 4, name: "Practice Pro", icon: "🎯", earned: true },
  ];

  const completedLessons = [
    { id: 1, title: "Understanding P/E Ratio", category: "Ratios", xp: 50 },
    { id: 2, title: "Financial Ratios Basics", category: "Ratios", xp: 45 },
    { id: 3, title: "Market Capitalization", category: "Basics", xp: 40 },
  ];

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
                <h1 className="font-heading font-bold text-2xl text-foreground">{userData.name}</h1>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-primary/10 rounded-full">
                    <span className="text-sm font-stats font-semibold text-primary">
                      Level {userData.level}
                    </span>
                  </div>
                </div>
                
                {/* Level Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Level Progress</span>
                    <span className="font-stats font-medium text-primary">
                      {userData.xp} / {userData.xp + userData.xpToNextLevel} XP
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${(userData.xp / (userData.xp + userData.xpToNextLevel)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <StatsDisplay {...userData} />
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
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Accuracy" value="87%" color="text-primary" />
              <StatCard label="Lessons" value={completedLessons.length} color="text-secondary" />
              <StatCard label="Total XP" value={userData.xp} color="text-accent" />
              <StatCard label="Streak" value={`${userData.streak} days`} color="text-destructive" />
            </div>
          </div>
        </section>

        {/* Completed Lessons */}
        <section className="space-y-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-bold text-xl text-foreground">Completed Lessons</h2>
          </div>
          <div className="space-y-2">
            {completedLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-card rounded-xl p-4 shadow-card flex justify-between items-center"
              >
                <div className="space-y-1">
                  <h3 className="font-medium text-foreground">{lesson.title}</h3>
                  <p className="text-xs text-muted-foreground">{lesson.category}</p>
                </div>
                <div className="text-sm font-stats font-semibold text-primary">
                  +{lesson.xp} XP
                </div>
              </div>
            ))}
          </div>
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
