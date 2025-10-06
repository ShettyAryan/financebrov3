import { StatsDisplay } from "@/components/StatsDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { LessonTrail } from "@/components/LessonTrail";
import { BottomNav } from "@/components/BottomNav";

const Dashboard = () => {
  const userName = "Aryan";
  const userStats = { streak: 7, xp: 1250, coins: 340 };
  const overallProgress = 35;

  // Lesson progression trail: first lesson unlocked, rest locked until previous completed
  const lessonsTrail = [
    {
      id: "1",
      title: "Introduction to Financial Statements",
      description: "Learn the three core financial statements every investor must understand",
      isLocked: false,
      isCompleted: true,
      xpReward: 50,
      category: "basics",
      order: 1,
    },
    {
      id: "2",
      title: "Understanding P/E Ratio",
      description: "Master how to evaluate stock valuation using the Price-to-Earnings ratio",
      isLocked: false,
      isCompleted: false,
      xpReward: 60,
      category: "ratios",
      order: 2,
    },
    {
      id: "3",
      title: "Reading Balance Sheets",
      description: "Analyze a company's assets, liabilities, and shareholder equity",
      isLocked: true,
      isCompleted: false,
      xpReward: 75,
      category: "statements",
      order: 3,
    },
    {
      id: "4",
      title: "Cash Flow Analysis",
      description: "Track how cash moves in and out of a business over time",
      isLocked: true,
      isCompleted: false,
      xpReward: 80,
      category: "statements",
      order: 4,
    },
    {
      id: "5",
      title: "Advanced Valuation Techniques",
      description: "Dive deep into DCF models and intrinsic value calculations",
      isLocked: true,
      isCompleted: false,
      xpReward: 100,
      category: "ratios",
      order: 5,
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

        {/* Learning Trail */}
        <section className="space-y-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex justify-between items-center">
            <h2 className="font-heading font-bold text-2xl text-foreground">Your Learning Path</h2>
            <span className="text-sm text-muted-foreground">
              {lessonsTrail.filter(l => l.isCompleted).length} / {lessonsTrail.length} completed
            </span>
          </div>
          <div className="bg-card/50 rounded-2xl p-6 shadow-card">
            <LessonTrail lessons={lessonsTrail} />
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
