import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useLesson } from "@/hooks/useApi";
import { useUpdateStatsAndUnlock } from "@/hooks/useApi";

type LessonStep = "intro" | "example" | "quiz" | "complete";

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<LessonStep>("intro");
  const [answer, setAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [passed, setPassed] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const { data: lesson, isLoading } = useLesson(id!);
  const { mutate: updateStats } = useUpdateStatsAndUnlock();

  const sections = useMemo(() => lesson?.content?.sections || [], [lesson]);
  const introSection = sections.find((s: any) => s.type === 'concept');
  const exampleSection = sections.find((s: any) => s.type === 'example');
  const quizSection = sections.find((s: any) => s.type === 'quiz');
  const totalQuestions = quizSection?.questions?.length || 0;
  const currentQuestion = totalQuestions > 0 ? quizSection.questions[questionIndex] : null;

  const xpReward = lesson?.xpReward || 50;

  // Helpers
  const renderMultiline = (text?: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => (
      <p key={idx} className="text-foreground leading-relaxed whitespace-pre-wrap">{line}</p>
    ));
  };

  const handleSubmitQuestion = () => {
    if (!currentQuestion) return;
    let correct = false;
    if (currentQuestion.format === 'mcq') {
      const idx = (currentQuestion.options || []).indexOf(answer);
      correct = idx === currentQuestion.answer || answer === (currentQuestion.options?.[currentQuestion.answer] || '');
    } else if (currentQuestion.format === 'input') {
      const expected = String(currentQuestion.answer).trim().toLowerCase();
      correct = String(answer).trim().toLowerCase() === expected;
    } else if (currentQuestion.format === 'mixed') {
      const idx = (currentQuestion.options || []).indexOf(answer);
      correct = idx === currentQuestion.answer; // reasoning optional
    }

    if (correct) {
      setCorrectCount((c) => c + 1);
      toast.success("Correct", { icon: <CheckCircle2 className="w-5 h-5" /> });
    } else {
      toast.error("Incorrect", { icon: <XCircle className="w-5 h-5" /> });
    }
    setWasCorrect(correct);
    setShowFeedback(true);
  };

  const handleNextAfterFeedback = () => {
    const isLast = questionIndex + 1 >= totalQuestions;
    if (isLast) {
      const scorePct = Math.round((correctCount / (totalQuestions || 1)) * 100);
      setQuizFinished(true);
      setPassed(scorePct >= 40);
      setShowFeedback(false);
      setWasCorrect(null);
      return;
    }
    setQuestionIndex((i) => i + 1);
    setAnswer("");
    setReasoning("");
    setShowFeedback(false);
    setWasCorrect(null);
  };

  const handleComplete = () => {
    const scorePct = Math.round((correctCount / (totalQuestions || 1)) * 100);
    if (id) {
      updateStats({ xpDelta: passed ? xpReward : 0, coinsDelta: 0, streakIncrement: 1, lessonId: id, score: scorePct });
    }
    setStep("complete");
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  if (isLoading || !lesson) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-3xl mx-auto px-4 py-6">Loading...</div>
        <BottomNav />
      </div>
    );
  }

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
              {lesson.title}
            </h1>
            <p className="text-sm text-muted-foreground">{lesson.category}</p>
          </div>
          <div className="text-sm font-stats font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-xl">
            +{xpReward} XP
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
                {introSection?.title || 'Concept'}
              </h2>
              <div className="space-y-2">
                {Array.isArray(introSection?.body)
                  ? (introSection?.body as string[]).map((t, i) => (
                      <p key={i} className="text-foreground leading-relaxed whitespace-pre-wrap">{t}</p>
                    ))
                  : renderMultiline(introSection?.body as string)}
              </div>
              {lesson.description && (
                <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-lg">
                  <p className="font-stats font-semibold text-primary">{lesson.description}</p>
                </div>
              )}
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
                {exampleSection?.title || 'Example'}
              </h2>
              <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 space-y-3">
                <div className="space-y-2">
                  {Array.isArray(exampleSection?.body)
                    ? (exampleSection?.body as string[]).map((t, i) => (
                        <p key={i} className="text-foreground font-medium whitespace-pre-wrap">{t}</p>
                      ))
                    : renderMultiline(exampleSection?.body as string)}
                </div>
                <div className="h-px bg-border" />
                {lesson.category && (
                  <p className="text-muted-foreground text-sm">Category: {lesson.category}</p>
                )}
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
              <div className="text-sm text-muted-foreground">Question {questionIndex + 1} of {totalQuestions}</div>
              <p className="text-foreground">{currentQuestion?.prompt}</p>

              {currentQuestion?.format !== 'input' && (
                <RadioGroup value={answer} onValueChange={setAnswer} className="space-y-3">
                  {(currentQuestion?.options || []).map((option: string) => (
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
              )}

              {currentQuestion?.format !== 'mcq' && (
                <div className="space-y-3">
                  <Label htmlFor="input" className="text-sm font-medium text-muted-foreground">
                    {currentQuestion?.inputType === 'number' ? 'Enter your answer' : 'Your answer'}
                  </Label>
                  <Input id="input" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer" />
                </div>
              )}

              {currentQuestion?.explanationRequired && (
                <div className="space-y-3">
                  <Label htmlFor="reasoning" className="text-sm font-medium text-muted-foreground">
                    Explain your reasoning
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
              )}
            </div>
            {/* Feedback after submit */}
            {!quizFinished && showFeedback && (
              <div className={`rounded-2xl p-6 shadow-card space-y-3 ${wasCorrect ? 'bg-primary/10 border-2 border-primary' : 'bg-destructive/10 border-2 border-destructive'}`}>
                <div className="flex items-center gap-3">
                  {wasCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <XCircle className="w-6 h-6 text-destructive" />
                  )}
                  <h3 className="font-heading font-bold text-lg">
                    {wasCorrect ? 'Correct!' : 'Incorrect'}
                  </h3>
                </div>
                <div className="text-sm space-y-2">
                  {!wasCorrect && (
                    <div className="text-foreground">
                      Correct answer: {currentQuestion?.format === 'input' ? String(currentQuestion?.answer) : currentQuestion?.options?.[currentQuestion?.answer]}
                    </div>
                  )}
                  {(currentQuestion as any)?.solution_explanation && (
                    <div className="bg-muted/40 rounded-lg p-3">
                      <p className="text-muted-foreground whitespace-pre-wrap">{(currentQuestion as any).solution_explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Buttons depending on state */}
            {!quizFinished && !showFeedback && (
              <Button size="lg" onClick={handleSubmitQuestion} disabled={!answer} className="w-full">
                Submit Answer
              </Button>
            )}

            {!quizFinished && showFeedback && (
              <Button size="lg" onClick={handleNextAfterFeedback} className="w-full">
                {questionIndex + 1 >= totalQuestions ? 'Finish Quiz' : 'Next Question'}
              </Button>
            )}

            {quizFinished && (
              <div className="space-y-4">
                <div className={`rounded-2xl p-6 shadow-card ${passed ? 'bg-primary/10 border-2 border-primary' : 'bg-destructive/10 border-2 border-destructive'}`}>
                  <h3 className="font-heading font-bold text-lg mb-2">Quiz Complete</h3>
                  <p className="text-foreground">Score: {Math.round((correctCount / (totalQuestions || 1)) * 100)}%</p>
                  <p className="text-muted-foreground">{passed ? 'Great job! You passed.' : 'You did not reach the passing score.'}</p>
                </div>
                {passed && (
                  <Button size="lg" onClick={handleComplete} className="w-full">
                    Complete Lesson
                  </Button>
                )}
              </div>
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
