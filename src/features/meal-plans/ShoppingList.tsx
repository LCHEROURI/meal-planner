import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import type { MealPlan, Ingredient } from '../../schemas';

type ShoppingListItem = Ingredient & { checked: boolean; id: string };

export function ShoppingList() {
  const { planId } = useParams();
  const { user } = useAuthStore();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !planId) return;

    const fetchPlan = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'mealPlans', planId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const fetchedPlan = { id: docSnap.id, ...docSnap.data() } as MealPlan;
          setPlan(fetchedPlan);
          
          // Generate shopping list from recipes if not saved yet
          if (fetchedPlan.shoppingList) {
            setItems(fetchedPlan.shoppingList as ShoppingListItem[]);
          } else {
            const aggregatedItems: Record<string, ShoppingListItem> = {};
            
            fetchedPlan.recipes.forEach(recipe => {
              recipe.ingredients.forEach(ing => {
                const key = `${ing.name}-${ing.unit || 'unit'}`.toLowerCase();
                if (aggregatedItems[key]) {
                  aggregatedItems[key].quantity += ing.quantity;
                } else {
                  aggregatedItems[key] = {
                    ...ing,
                    id: Math.random().toString(36).substring(7),
                    checked: false
                  };
                }
              });
            });
            
            const initialItems = Object.values(aggregatedItems).sort((a, b) => 
              (a.category || 'other').localeCompare(b.category || 'other')
            );
            
            setItems(initialItems);
            
            // Persist the generated list
            await updateDoc(docRef, { shoppingList: initialItems });
          }
        } else {
          setError("Meal plan not found.");
        }
      } catch (err) {
        setError("Failed to load shopping list.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [user, planId]);

  const toggleItem = async (itemId: string) => {
    if (!user || !planId) return;
    
    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    
    setItems(updatedItems);
    
    // Optimistic background save
    try {
      await updateDoc(doc(db, 'users', user.uid, 'mealPlans', planId), {
        shoppingList: updatedItems
      });
    } catch (err) {
      console.error("Failed to update shopping list", err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !plan) return <ErrorState message={error || "Unknown error"} />;

  // Group by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = Object.entries(groupedItems).map(([category, catItems]) => {
      const itemsText = catItems.map(item => `- [${item.checked ? 'x' : ' '}] ${Math.round(item.quantity * 100) / 100} ${item.unit} ${item.name}`).join('\n');
      return `\n${category.toUpperCase()}\n${itemsText}`;
    }).join('\n');
    
    navigator.clipboard.writeText(`Shopping List: ${plan.name}\n${text}`);
    alert("Shopping list copied to clipboard!");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      <Link to={`/app/plans/${planId}`} className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary print:hidden">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Plan
      </Link>

      <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Shopping List</h1>
          <p className="text-text-secondary">For: {plan.name || 'Weeknight Meal Plan'}</p>
        </div>
        <div className="flex space-x-3 print:hidden">
          <Button variant="secondary" onClick={handleCopy}>
            Copy Text
          </Button>
          <Button onClick={handlePrint}>
            Print List
          </Button>
        </div>
      </div>

      <div className="space-y-8 print:space-y-4">
        {Object.entries(groupedItems).sort().map(([category, categoryItems]) => (
          <div key={category} className="rounded-xl border border-border bg-surface p-6 shadow-sm print:break-inside-avoid print:border-none print:p-0 print:shadow-none">
            <h2 className="mb-4 text-xl font-bold capitalize text-text-primary print:mb-2 print:text-lg">{category}</h2>
            <ul className="space-y-3 print:space-y-1">
              {categoryItems.map(item => (
                <li 
                  key={item.id}
                  className={`flex cursor-pointer items-center rounded-lg p-2 transition-colors hover:bg-background print:p-1 ${item.checked ? 'opacity-50 print:opacity-100' : ''}`}
                  onClick={() => toggleItem(item.id)}
                >
                  <button className="mr-4 text-primary focus:outline-none print:hidden">
                    {item.checked ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                  </button>
                  <div className={`hidden print:block mr-2 h-4 w-4 rounded border border-text-primary ${item.checked ? 'bg-text-primary' : ''}`} />
                  <div className={`flex-1 ${item.checked ? 'line-through print:no-underline' : ''}`}>
                    <span className="font-semibold text-text-primary">
                      {Math.round(item.quantity * 100) / 100} {item.unit}
                    </span>
                    <span className="ml-2 text-text-primary">{item.name}</span>
                    {item.preparationNote && (
                      <span className="ml-2 text-sm text-text-secondary">({item.preparationNote})</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
