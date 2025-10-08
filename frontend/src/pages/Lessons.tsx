import { LessonCard } from "@/components/LessonCard";
import { BottomNav } from "@/components/BottomNav";
import { BookOpen } from "lucide-react";
import { useLessons, useLessonCategories } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

const Lessons = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const { 
    data: lessonsData, 
    isLoading: lessonsLoading, 
    error: lessonsError,
    refetch: refetchLessons 
  } = useLessons({ limit: 50, category: selectedCategory === "all" ? undefined : selectedCategory });
  
  const { 
    data: categories, 
    isLoading: categoriesLoading 
  } = useLessonCategories();

  if (lessonsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-4 animate-slide-up">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            
            {/* Category Pills Skeleton */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </div>

          {/* Lessons Grid Skeleton */}
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (lessonsError) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-4">
            <h1 className="font-heading font-bold text-2xl text-foreground">
              Failed to load lessons
            </h1>
            <p className="text-muted-foreground">
              There was an error loading the lessons. Please try again.
            </p>
            <Button onClick={() => refetchLessons()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const allLessons = lessonsData?.lessons || [];
  const allCategories = [
    { name: "all", count: allLessons.length },
    ...(categories || [])
  ];

  // Convert lessons to the format expected by LessonCard
  const formattedLessons = allLessons.map(lesson => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    isLocked: !lesson.isUnlocked,
    isCompleted: lesson.isCompleted,
    xpReward: lesson.xpReward,
    category: lesson.category,
  }));

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
                {formattedLessons.filter((l) => !l.isLocked).length} available
              </p>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  cat.name === selectedCategory
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                {cat.name !== "all" && (
                  <span className="ml-1 text-xs opacity-70">({cat.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid gap-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {formattedLessons.length > 0 ? (
            formattedLessons.map((lesson) => (
              <LessonCard key={lesson.id} {...lesson} />
            ))
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                No lessons found
              </h3>
              <p className="text-muted-foreground">
                {selectedCategory === "all" 
                  ? "No lessons are available yet." 
                  : `No lessons found in the ${selectedCategory} category.`}
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Lessons;
