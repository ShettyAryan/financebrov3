import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/BottomNav";
import { Target, TrendingUp, AlertCircle, Award } from "lucide-react";
import { toast } from "sonner";
import { useGeneratePracticeQuiz, useEvaluatePractice } from "@/hooks/useApi";
import { useLocation } from "react-router-dom";

const Practice = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string; xp?: number; coins?: number } | null>(null);

  const generateMutation = useGeneratePracticeQuiz();
  const evaluateMutation = useEvaluatePractice();

  // Expect lesson data via router state
  const location = useLocation() as any;
  const { lessonId, conceptName, lessonContent } = location.state || {};

  useEffect(() => {
    if (!lessonId || !lessonContent) return;
    generateMutation.mutate({ lessonId, conceptName, lessonContent }, {
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to generate practice');
      }
    });
  }, [lessonId, conceptName, lessonContent]);

  const questions = generateMutation.data?.questions || [];
  const current = questions[currentIndex];

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowFeedback(true);
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = selectedAnswer;
      return next;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Evaluate
      evaluateMutation.mutate({ lessonId, conceptName, questions, userAnswers: answers }, {
        onSuccess: (res) => {
          setResult({ score: res.score, feedback: res.feedback, xp: res.xp_delta, coins: res.coins_delta });
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to evaluate');
        }
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
                {Math.min(currentIndex + 1, questions.length || 0)} / {questions.length || 0}
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
                  Question {currentIndex + 1}
                </span>
              </div>
              <h2 className="font-heading font-bold text-xl text-foreground">
                {conceptName || 'Practice'}
              </h2>
            </div>

            <div className="bg-muted/30 rounded-xl p-4 border-l-4 border-secondary">
              <p className="text-foreground leading-relaxed">{current?.scenario || 'Loading...'}</p>
            </div>

            <div className="space-y-4">
              <p className="font-medium text-foreground">Select the best answer</p>

              <RadioGroup
                value={selectedAnswer}
                onValueChange={setSelectedAnswer}
                className="space-y-3"
              >
                {(current?.options || []).map((option, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 bg-muted/20 rounded-xl p-4 cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <RadioGroupItem value={idx.toString()} id={`option-${idx}`} className="mt-0.5" />
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
          {showFeedback && current && (
            <div className="bg-secondary/10 border-2 border-secondary rounded-2xl p-6 shadow-card space-y-3 animate-scale-in">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-secondary" />
                <h3 className="font-heading font-bold text-lg text-foreground">Analysis</h3>
              </div>
              <p className="text-foreground leading-relaxed">{current.explanation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {!showFeedback ? (
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="w-full"
              >
                Submit Answer
              </Button>
            ) : (
              <Button size="lg" onClick={handleNext} className="w-full">
                {currentIndex < (questions.length || 0) - 1 ? "Next Question" : (evaluateMutation.status === 'pending' ? 'Evaluating...' : 'Complete Practice')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
      {/* Result Modal (inline simple) */}
      {result && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-card p-6 max-w-md w-full space-y-4 animate-scale-in">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-primary" />
              <h3 className="font-heading font-bold text-xl text-foreground">Practice Results</h3>
            </div>
            <p className="text-foreground">You scored <span className="font-stats font-semibold text-primary">{result.score}/10</span>.</p>
            {typeof result.xp === 'number' && typeof result.coins === 'number' && (
              <div className="flex gap-3">
                <span className="text-sm font-stats font-semibold text-secondary bg-secondary/10 px-3 py-1.5 rounded-lg">+{result.xp} XP</span>
                <span className="text-sm font-stats font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-lg">+{result.coins} Coins</span>
              </div>
            )}
            <div className="bg-muted/30 rounded-xl p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{result.feedback}</p>
            </div>
            <Button className="w-full" onClick={() => window.history.back()}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Practice;
