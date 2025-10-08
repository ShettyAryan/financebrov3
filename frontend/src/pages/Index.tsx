import { Button } from "@/components/ui/button";
import { TrendingUp, Award, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/AuthForm";
import { useEffect } from "react";

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Welcome Content */}
        <div className="space-y-6 text-center lg:text-left animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>Learn Finance, Level Up</span>
          </div>
          
          <h1 className="font-heading font-bold text-5xl lg:text-6xl text-foreground leading-tight">
            Master Fundamental Analysis
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
            Learn to analyze stocks like a pro through interactive lessons, real-world scenarios, 
            and gamified challenges. Start your investing journey today!
          </p>

          <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4">
            <FeatureItem icon={Award} text="Earn XP & Rewards" />
            <FeatureItem icon={Target} text="Real-World Scenarios" />
            <FeatureItem icon={TrendingUp} text="Track Your Progress" />
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-card rounded-3xl p-8 shadow-elevated space-y-6 animate-scale-in border border-border">
          <div className="space-y-2 text-center">
            <h2 className="font-heading font-bold text-2xl text-foreground">Get Started</h2>
            <p className="text-sm text-muted-foreground">
              Join thousands learning to invest smarter
            </p>
          </div>

          <AuthForm onSuccess={handleAuthSuccess} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue as</span>
            </div>
          </div>

          <Link to="/dashboard" className="block">
            <Button size="lg" variant="outline" className="w-full font-semibold">
              Continue as Guest
            </Button>
          </Link>

          <p className="text-xs text-center text-muted-foreground pt-2">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

function FeatureItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="text-sm font-medium text-foreground">{text}</span>
    </div>
  );
}

export default Index;
