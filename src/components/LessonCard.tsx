import { Lock, CheckCircle2, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  id: string;
  title: string;
  description: string;
  isLocked: boolean;
  isCompleted: boolean;
  xpReward: number;
  category: string;
}

export function LessonCard({
  id,
  title,
  description,
  isLocked,
  isCompleted,
  xpReward,
  category,
}: LessonCardProps) {
  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      basics: "border-l-primary",
      ratios: "border-l-secondary",
      statements: "border-l-accent",
    };
    return colors[cat] || "border-l-primary";
  };

  const content = (
    <div
      className={cn(
        "relative bg-card rounded-2xl p-5 shadow-card transition-all duration-200",
        "border-l-4",
        getCategoryColor(category),
        !isLocked && "hover:shadow-elevated hover:-translate-y-1 cursor-pointer",
        isLocked && "opacity-60 cursor-not-allowed"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <h3 className="font-heading font-bold text-lg text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs font-stats font-medium text-accent bg-accent/10 px-2 py-1 rounded-lg">
              +{xpReward} XP
            </span>
            <span className="text-xs font-medium text-muted-foreground capitalize">
              {category}
            </span>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          {isCompleted ? (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
          ) : isLocked ? (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <PlayCircle className="w-6 h-6 text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLocked) {
    return content;
  }

  return (
    <Link to={`/lesson/${id}`} className="block">
      {content}
    </Link>
  );
}
