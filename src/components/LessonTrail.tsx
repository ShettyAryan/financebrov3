import { Lock, CheckCircle2, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Lesson {
  id: string;
  title: string;
  description: string;
  isLocked: boolean;
  isCompleted: boolean;
  xpReward: number;
  category: string;
  order: number;
}

interface LessonTrailProps {
  lessons: Lesson[];
}

export function LessonTrail({ lessons }: LessonTrailProps) {
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <TooltipProvider>
      <div className="relative py-8">
        {sortedLessons.map((lesson, index) => {
          const isLast = index === sortedLessons.length - 1;
          const nextLesson = sortedLessons[index + 1];
          const showConnector = !isLast;
          const connectorActive = lesson.isCompleted;

          return (
            <div key={lesson.id} className="relative">
              {/* Lesson Card */}
              <div className="flex items-center gap-4 mb-8">
                {/* Order Number Badge */}
                <div
                  className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-stats font-bold text-lg transition-all duration-300",
                    lesson.isCompleted &&
                      "bg-primary text-primary-foreground shadow-elevated",
                    !lesson.isCompleted &&
                      !lesson.isLocked &&
                      "bg-accent/20 text-accent border-2 border-accent",
                    lesson.isLocked &&
                      "bg-muted text-muted-foreground border-2 border-border"
                  )}
                >
                  {lesson.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <span>{lesson.order}</span>
                  )}
                </div>

                {/* Lesson Card */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    {lesson.isLocked ? (
                      <div
                        className={cn(
                          "flex-1 bg-card rounded-2xl p-5 shadow-card border-2 border-border",
                          "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <LessonCardContent lesson={lesson} />
                      </div>
                    ) : (
                      <Link
                        to={`/lesson/${lesson.id}`}
                        className={cn(
                          "flex-1 block bg-card rounded-2xl p-5 shadow-card border-2 transition-all duration-200",
                          lesson.isCompleted
                            ? "border-primary/30 hover:shadow-elevated hover:-translate-y-1"
                            : "border-accent/50 hover:shadow-elevated hover:-translate-y-1 hover:border-accent"
                        )}
                      >
                        <LessonCardContent lesson={lesson} />
                      </Link>
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="font-semibold">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lesson.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Star className="w-3 h-3 text-accent" />
                      <span className="text-xs font-medium">
                        +{lesson.xpReward} XP
                      </span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Connecting Line */}
              {showConnector && (
                <div className="absolute left-6 -bottom-2 w-0.5 h-10 -translate-x-1/2">
                  <div
                    className={cn(
                      "h-full w-full transition-all duration-500 rounded-full",
                      connectorActive
                        ? "bg-gradient-to-b from-primary to-accent animate-pulse"
                        : "bg-border"
                    )}
                  />
                  {connectorActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2">
                      <TrendingUp
                        className={cn(
                          "w-4 h-4 text-primary animate-bounce-subtle"
                        )}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

function LessonCardContent({ lesson }: { lesson: Lesson }) {
  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      basics: "text-primary bg-primary/10",
      ratios: "text-secondary bg-secondary/10",
      statements: "text-accent bg-accent/10",
    };
    return colors[cat] || "text-primary bg-primary/10";
  };

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 space-y-2">
        <h3 className="font-heading font-bold text-lg text-foreground">
          {lesson.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {lesson.description}
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span
            className={cn(
              "text-xs font-stats font-medium px-2 py-1 rounded-lg",
              getCategoryColor(lesson.category)
            )}
          >
            +{lesson.xpReward} XP
          </span>
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {lesson.category}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0">
        {lesson.isCompleted ? (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
        ) : lesson.isLocked ? (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Star className="w-5 h-5 text-accent" />
          </div>
        )}
      </div>
    </div>
  );
}
