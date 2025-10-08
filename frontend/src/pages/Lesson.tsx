import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

type LessonStep = "intro" | "example" | "quiz" | "complete";

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<LessonStep>("intro");
  const [answer, setAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const lessonData = {
    title: "Understanding P/E Ratio",
    category: "Ratios",
    xpReward: 50,
    intro: {
      headline: "What is the P/E Ratio?",
      content:
        "The Price-to-Earnings (P/E) ratio is one of the most widely used metrics for stock valuation. It tells you how much investors are willing to pay for each dollar of earnings.",
      formula: "P/E Ratio = Stock Price ÷ Earnings Per Share (EPS)",
    },
    example: {
      headline: "Real-World Example",
      scenario:
        "Company ABC has a stock price of $100 and an EPS of $5. This gives us a P/E ratio of 20. This means investors are paying $20 for every $1 of earnings.",
      interpretation:
        "A P/E of 20 suggests moderate valuation. Compare this to the industry average to determine if the stock is overvalued or undervalued.",
    },
    quiz: {
      question: "If a stock is priced at $150 and has an EPS of $10, what is its P/E ratio?",
      options: ["10", "15", "20", "25"],
      correctAnswer: "15",
      feedback:
        "Correct! P/E = $150 ÷ $10 = 15. This stock has a moderate valuation. Always compare P/E ratios within the same industry for meaningful insights.",
    },
  };

  const handleAnswer = () => {
    const correct = answer === lessonData.quiz.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      toast.success("Correct! +50 XP", {
        icon: <CheckCircle2 className="w-5 h-5" />,
      });
    } else {
      toast.error("Not quite right. Try again!", {
        icon: <XCircle className="w-5 h-5" />,
      });
    }
  };

  const handleComplete = () => {
    setStep("complete");
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-2xl text-foreground">
              {lessonData.title}
            </h1>
            <p className="text-sm text-muted-foreground">{lessonData.category}</p>
          </div>
          <div className="text-sm font-stats font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-xl">
            +{lessonData.xpReward} XP
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2">
          {["intro", "example", "quiz"].map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                ["intro", "example", "quiz"].indexOf(step) >= i
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content based on step */}
        {step === "intro" && (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="font-heading font-bold text-xl text-foreground">
                {lessonData.intro.headline}
              </h2>
              <p className="text-foreground leading-relaxed">{lessonData.intro.content}</p>
              <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-lg">
                <p className="font-stats font-semibold text-primary">{lessonData.intro.formula}</p>
              </div>
            </div>
            <Button size="lg" onClick={() => setStep("example")} className="w-full">
              Continue
            </Button>
          </div>
        )}

        {step === "example" && (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="font-heading font-bold text-xl text-foreground">
                {lessonData.example.headline}
              </h2>
              <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 space-y-3">
                <p className="text-foreground font-medium">{lessonData.example.scenario}</p>
                <div className="h-px bg-border" />
                <p className="text-muted-foreground text-sm">{lessonData.example.interpretation}</p>
              </div>
            </div>
            <Button size="lg" onClick={() => setStep("quiz")} className="w-full">
              Take the Quiz
            </Button>
          </div>
        )}

        {step === "quiz" && (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
              <h2 className="font-heading font-bold text-xl text-foreground">
                Quick Check
              </h2>
              <p className="text-foreground">{lessonData.quiz.question}</p>

              <RadioGroup value={answer} onValueChange={setAnswer} className="space-y-3">
                {lessonData.quiz.options.map((option) => (
                  <div
                    key={option}
                    className="flex items-center space-x-3 bg-muted/30 rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="flex-1 cursor-pointer font-medium">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="space-y-3">
                <Label htmlFor="reasoning" className="text-sm font-medium text-muted-foreground">
                  Explain your reasoning (optional)
                </Label>
                <Textarea
                  id="reasoning"
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  placeholder="Why did you choose this answer?"
                  className="rounded-xl resize-none"
                  rows={3}
                />
              </div>
            </div>

            {showFeedback && (
              <div
                className={`rounded-2xl p-6 shadow-card space-y-3 animate-scale-in ${
                  isCorrect
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-destructive/10 border-2 border-destructive"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <XCircle className="w-6 h-6 text-destructive" />
                  )}
                  <h3 className="font-heading font-bold text-lg">
                    {isCorrect ? "Great job!" : "Not quite"}
                  </h3>
                </div>
                <p className="text-foreground">{lessonData.quiz.feedback}</p>
                {isCorrect && (
                  <div className="flex items-center gap-2 text-accent font-stats font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>+{lessonData.xpReward} XP earned</span>
                  </div>
                )}
              </div>
            )}

            {!showFeedback ? (
              <Button size="lg" onClick={handleAnswer} disabled={!answer} className="w-full">
                Submit Answer
              </Button>
            ) : (
              isCorrect && (
                <Button size="lg" onClick={handleComplete} className="w-full">
                  Complete Lesson
                </Button>
              )
            )}
          </div>
        )}

        {step === "complete" && (
          <div className="text-center space-y-6 py-12 animate-scale-in">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-primary animate-bounce-subtle" />
            </div>
            <h2 className="font-heading font-bold text-3xl text-foreground">
              Lesson Complete!
            </h2>
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Lesson;
