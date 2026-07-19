import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, functions } from '../../lib/firebase/config';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Button } from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/common/Card';
import { Clock, Users, RefreshCw, ShoppingCart, Loader2, Share2, Copy, CheckCircle2, Lock } from 'lucide-react';
import type { MealPlan, Recipe } from '../../schemas';
import { httpsCallable } from 'firebase/functions';

export function PlanDetails() {
  const { planId } = useParams();
  const { user } = useAuthStore();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regeneratingRecipeId, setRegeneratingRecipeId] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (!user || !planId) return;

    const fetchPlan = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'mealPlans', planId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPlan({ id: docSnap.id, ...docSnap.data() } as MealPlan);
        } else {
          setError("Meal plan not found.");
        }
      } catch (err) {
        setError("Failed to load meal plan.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [user, planId]);

  const handleShare = async () => {
    if (!user || !plan || !planId) return;
    setIsSharing(true);
    
    try {
      const isCurrentlyShared = !!plan.sharedId;
      let sharedId = plan.sharedId;
      
      if (!isCurrentlyShared) {
        sharedId = Math.random().toString(36).substring(2, 10);
        
        // Create shared document
        await setDoc(doc(db, 'sharedPlans', sharedId), {
          ...plan,
          sharedBy: user.uid,
          id: undefined, // Don't copy the original internal ID over
          isPublic: true
        });
        
        // Update local plan with sharedId
        await updateDoc(doc(db, 'users', user.uid, 'mealPlans', planId), {
          sharedId
        });
        
        setPlan({ ...plan, sharedId });
      }
      
      const shareUrl = `${window.location.origin}/share/${sharedId}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
      
    } catch (err) {
      console.error(err);
      alert("Failed to share meal plan.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevokeShare = async () => {
    if (!user || !plan || !planId || !plan.sharedId) return;
    setIsSharing(true);
    
    try {
      await deleteDoc(doc(db, 'sharedPlans', plan.sharedId));
      
      await updateDoc(doc(db, 'users', user.uid, 'mealPlans', planId), {
        sharedId: null
      });
      
      setPlan({ ...plan, sharedId: undefined });
    } catch (err) {
      console.error(err);
      alert("Failed to revoke share link.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleRegenerateRecipe = async (recipe: Recipe) => {
    if (!user || !plan || !planId) return;
    
    setRegeneratingRecipeId(recipe.id || recipe.name);
    
    try {
      const regenerateCall = httpsCallable(functions, 'regenerateRecipe');
      const result = await regenerateCall({
        planId: plan.id,
        recipeId: recipe.id || recipe.name,
        reason: 'User requested regeneration',
        currentPlanState: plan,
      });
      
      const newRecipe = result.data as Recipe;
      
      // Update plan in local state
      const updatedRecipes = plan.recipes.map(r => 
        (r.id === recipe.id && r.name === recipe.name) ? newRecipe : r
      );
      
      const updatedPlan = { ...plan, recipes: updatedRecipes };
      setPlan(updatedPlan);
      
      // Save to Firestore
      await updateDoc(doc(db, 'users', user.uid, 'mealPlans', planId), {
        recipes: updatedRecipes
      });
      
    } catch (err) {
      console.error(err);
      alert("Failed to regenerate recipe. Please try again.");
    } finally {
      setRegeneratingRecipeId(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !plan) return <ErrorState message={error || "Unknown error"} />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{plan.name || 'Weeknight Meal Plan'}</h1>
          <p className="text-text-secondary">
            {plan.planLength} days • {plan.servings} servings
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {plan.sharedId ? (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare}
                disabled={isSharing}
                className="bg-primary/10 text-primary hover:bg-primary/20"
              >
                {shareCopied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {shareCopied ? 'Copied Link' : 'Copy Link'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleRevokeShare}
                disabled={isSharing}
                className="text-error hover:bg-error/10 hover:text-error"
                title="Make Private"
              >
                <Lock className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={handleShare}
              disabled={isSharing}
            >
              <Share2 className="mr-2 h-4 w-4" />
              {isSharing ? 'Sharing...' : 'Share'}
            </Button>
          )}

          <Link to={`/app/plans/${plan.id}/shopping-list`}>
            <Button variant="secondary">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Shopping List
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plan.recipes.map((recipe, index) => {
          const isRegenerating = regeneratingRecipeId === (recipe.id || recipe.name);
          
          return (
            <Card key={recipe.id || index} className="flex flex-col relative overflow-hidden">
              {isRegenerating && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center">
                    <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm font-medium text-text-primary">Generating new recipe...</span>
                  </div>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{recipe.name}</CardTitle>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    Day {index + 1}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-text-secondary">{recipe.description}</p>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex space-x-4 text-sm text-text-secondary">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {recipe.totalTimeMinutes}m
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    {recipe.servings}
                  </div>
                </div>
                
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-text-primary">Key Ingredients:</h4>
                  <ul className="list-inside list-disc text-sm text-text-secondary">
                    {recipe.ingredients.slice(0, 4).map((ing, i) => (
                      <li key={i} className="truncate">{ing.displayText}</li>
                    ))}
                    {recipe.ingredients.length > 4 && (
                      <li className="text-primary italic">+{recipe.ingredients.length - 4} more</li>
                    )}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-border pt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRegenerateRecipe(recipe)}
                  disabled={isRegenerating}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Swap
                </Button>
                <Link to={`/app/plans/${plan.id}/recipes/${recipe.id || index}`}>
                  <Button size="sm">Cook This</Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
