import { Flame, Star, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsDisplayProps {
  streak: number;
  xp: number;
  coins: number;
  className?: string;
}

export function StatsDisplay({ streak, xp, coins, className }: StatsDisplayProps) {
  return (
    <div className={cn("flex gap-3", className)}>
      <StatBadge icon={Flame} value={streak} label="Day Streak" color="text-destructive" />
      <StatBadge icon={Star} value={xp} label="XP" color="text-secondary" />
      <StatBadge icon={Coins} value={coins} label="Coins" color="text-accent" />
    </div>
  );
}

interface StatBadgeProps {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
}

function StatBadge({ icon: Icon, value, label, color }: StatBadgeProps) {
  return (
    <div className="flex items-center gap-2 bg-card rounded-2xl px-4 py-2 shadow-card">
      <Icon className={cn("w-5 h-5", color)} />
      <div className="flex flex-col">
        <span className={cn("font-stats font-semibold text-sm", color)}>{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
