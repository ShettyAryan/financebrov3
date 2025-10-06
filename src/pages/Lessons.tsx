import { LessonCard } from "@/components/LessonCard";
import { BottomNav } from "@/components/BottomNav";
import { BookOpen } from "lucide-react";

const Lessons = () => {
  const allLessons = [
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
      title: "Debt-to-Equity Ratio",
      description: "Understand how companies leverage debt and its impact on risk",
      isLocked: false,
      isCompleted: false,
      xpReward: 55,
      category: "ratios",
    },
    {
      id: "6",
      title: "Income Statement Analysis",
      description: "Deep dive into revenue, expenses, and profitability metrics",
      isLocked: false,
      isCompleted: false,
      xpReward: 70,
      category: "statements",
    },
    {
      id: "7",
      title: "Advanced Valuation Models",
      description: "Master DCF analysis and intrinsic value calculations",
      isLocked: true,
      isCompleted: false,
      xpReward: 100,
      category: "basics",
    },
    {
      id: "8",
      title: "Industry Comparison Techniques",
      description: "Learn to compare companies within the same sector effectively",
      isLocked: true,
      isCompleted: false,
      xpReward: 90,
      category: "basics",
    },
  ];

  const categories = ["all", "ratios", "statements", "basics"];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground">All Lessons</h1>
              <p className="text-sm text-muted-foreground">
                {allLessons.filter((l) => !l.isLocked).length} available
              </p>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  cat === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid gap-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {allLessons.map((lesson) => (
            <LessonCard key={lesson.id} {...lesson} />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Lessons;
