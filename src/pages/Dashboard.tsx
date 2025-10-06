import { StatsDisplay } from "@/components/StatsDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { LessonCard } from "@/components/LessonCard";
import { BottomNav } from "@/components/BottomNav";

const Dashboard = () => {
  const userName = "Aryan";
  const userStats = { streak: 7, xp: 1250, coins: 340 };
  const overallProgress = 35;

  const recentLessons = [
    {
      id: "1",
      title: "Understanding P/E Ratio",
      description: "Learn how to evaluate stock valuation using the Price-to-Earnings ratio",
      isLocked: false,
      isCompleted: true,
      xpReward: 50,
      category: "ratios",
    },
    {
      id: "2",
      title: "Reading Balance Sheets",
      description: "Master the fundamentals of analyzing a company's financial position",
      isLocked: false,
      isCompleted: false,
      xpReward: 75,
      category: "statements",
    },
  ];

  const upcomingLessons = [
    {
      id: "3",
      title: "ROE & ROA Analysis",
      description: "Discover how to measure company profitability and efficiency",
      isLocked: false,
      isCompleted: false,
      xpReward: 60,
      category: "ratios",
    },
    {
      id: "4",
      title: "Cash Flow Statements",
      description: "Learn to track a company's cash movements and financial health",
      isLocked: false,
      isCompleted: false,
      xpReward: 80,
      category: "statements",
    },
    {
      id: "5",
      title: "Advanced Valuation",
      description: "Dive deep into DCF models and intrinsic value calculations",
      isLocked: true,
      isCompleted: false,
      xpReward: 100,
      category: "basics",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4 animate-slide-up">
          <h1 className="font-heading font-bold text-3xl text-foreground">
            Welcome back, {userName}! 👋
          </h1>
          <StatsDisplay {...userStats} />
          <ProgressBar progress={overallProgress} />
        </div>

        {/* Recent Lessons */}
        <section className="space-y-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex justify-between items-center">
            <h2 className="font-heading font-bold text-xl text-foreground">Continue Learning</h2>
            <span className="text-sm text-muted-foreground">{recentLessons.length} active</span>
          </div>
          <div className="space-y-3">
            {recentLessons.map((lesson) => (
              <LessonCard key={lesson.id} {...lesson} />
            ))}
          </div>
        </section>

        {/* Upcoming Lessons */}
        <section className="space-y-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex justify-between items-center">
            <h2 className="font-heading font-bold text-xl text-foreground">Upcoming Lessons</h2>
            <span className="text-sm text-muted-foreground">{upcomingLessons.length} total</span>
          </div>
          <div className="grid gap-3">
            {upcomingLessons.map((lesson) => (
              <LessonCard key={lesson.id} {...lesson} />
            ))}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
