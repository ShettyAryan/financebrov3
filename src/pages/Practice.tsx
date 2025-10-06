import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/BottomNav";
import { Target, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const Practice = () => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const scenarios = [
    {
      id: 1,
      title: "Tech Startup Analysis",
      scenario:
        "You're analyzing a tech startup with a P/E ratio of 45, compared to an industry average of 25. The company has strong revenue growth of 40% YoY and expanding profit margins.",
      question: "Should you invest based on fundamental analysis?",
      options: [
        "Yes, high P/E indicates strong growth potential",
        "No, the P/E is too high compared to industry average",
        "Maybe, need more information about debt levels",
        "Yes, but only short-term due to volatility",
      ],
      correctAnswer: "Yes, high P/E indicates strong growth potential",
      feedback:
        "Correct! A high P/E ratio can be justified for growth companies with strong fundamentals. The 40% revenue growth and improving margins support the premium valuation.",
      xpReward: 25,
      coinReward: 15,
    },
    {
      id: 2,
      title: "Retail Giant Evaluation",
      scenario:
        "A large retail company shows declining same-store sales (-5%), but maintains a low P/E of 8 and high dividend yield of 6%. The company has minimal debt.",
      question: "What's the best investment decision?",
      options: [
        "Strong buy - low P/E and high dividend",
        "Hold - wait for sales improvement",
        "Sell - declining sales are a red flag",
        "Buy with caution - focus on turnaround potential",
      ],
      correctAnswer: "Buy with caution - focus on turnaround potential",
      feedback:
        "Good thinking! The low valuation and high dividend are attractive, but declining sales warrant caution. This could be a value opportunity if management can execute a turnaround.",
      xpReward: 30,
      coinReward: 20,
    },
  ];

  const currentPractice = scenarios[currentScenario];

  const handleSubmit = () => {
    const isCorrect = selectedAnswer === currentPractice.correctAnswer;
    setShowFeedback(true);
    
    const newTotal = score.total + 1;
    const newCorrect = isCorrect ? score.correct + 1 : score.correct;
    
    setScore({ correct: newCorrect, total: newTotal });

    if (isCorrect) {
      toast.success(`Correct! +${currentPractice.xpReward} XP, +${currentPractice.coinReward} Coins`, {
        duration: 3000,
      });
    } else {
      toast.error("Try again! Review the lesson for hints.", {
        duration: 3000,
      });
    }
  };

  const handleNext = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setSelectedAnswer("");
      setShowFeedback(false);
    } else {
      toast.success(`Practice Complete! Score: ${score.correct + 1}/${score.total + 1}`, {
        duration: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground">Practice Mode</h1>
              <p className="text-sm text-muted-foreground">Real-world scenario simulations</p>
            </div>
          </div>

          {/* Score Display */}
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Progress</span>
              </div>
              <span className="font-stats font-semibold text-primary">
                {currentScenario + 1} / {scenarios.length}
              </span>
            </div>
          </div>
        </div>

        {/* Scenario Card */}
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="bg-card rounded-2xl p-6 shadow-card space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                  Scenario {currentPractice.id}
                </span>
              </div>
              <h2 className="font-heading font-bold text-xl text-foreground">
                {currentPractice.title}
              </h2>
            </div>

            <div className="bg-muted/30 rounded-xl p-4 border-l-4 border-secondary">
              <p className="text-foreground leading-relaxed">{currentPractice.scenario}</p>
            </div>

            <div className="space-y-4">
              <p className="font-medium text-foreground">{currentPractice.question}</p>

              <RadioGroup
                value={selectedAnswer}
                onValueChange={setSelectedAnswer}
                className="space-y-3"
              >
                {currentPractice.options.map((option, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 bg-muted/20 rounded-xl p-4 cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <RadioGroupItem value={option} id={`option-${idx}`} className="mt-0.5" />
                    <Label
                      htmlFor={`option-${idx}`}
                      className="flex-1 cursor-pointer leading-relaxed"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className="bg-secondary/10 border-2 border-secondary rounded-2xl p-6 shadow-card space-y-3 animate-scale-in">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-secondary" />
                <h3 className="font-heading font-bold text-lg text-foreground">Analysis</h3>
              </div>
              <p className="text-foreground leading-relaxed">{currentPractice.feedback}</p>
              <div className="flex gap-3 pt-2">
                <span className="text-sm font-stats font-semibold text-secondary bg-secondary/10 px-3 py-1.5 rounded-lg">
                  +{currentPractice.xpReward} XP
                </span>
                <span className="text-sm font-stats font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-lg">
                  +{currentPractice.coinReward} Coins
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {!showFeedback ? (
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="w-full"
              >
                Submit Answer
              </Button>
            ) : (
              <Button size="lg" onClick={handleNext} className="w-full">
                {currentScenario < scenarios.length - 1 ? "Next Scenario" : "Complete Practice"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Practice;
