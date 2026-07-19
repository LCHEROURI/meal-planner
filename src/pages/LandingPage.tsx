import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="mb-6 max-w-4xl text-5xl font-extrabold tracking-tight text-text-primary md:text-6xl">
        Plan real weeknight dinners—not random AI recipes.
      </h1>
      <p className="mb-10 max-w-2xl text-xl text-text-secondary">
        Create a practical three-, five-, or seven-night dinner plan based on your schedule, household, dietary preferences, and ingredients already in your kitchen.
      </p>
      
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Link to="/signup">
          <Button size="lg" className="w-full sm:w-auto">
            Create My Meal Plan
          </Button>
        </Link>
        <Link to="/login">
          <Button variant="secondary" size="lg" className="w-full sm:w-auto">
            Sign In
          </Button>
        </Link>
      </div>

      <div className="mt-20 max-w-3xl rounded-xl border border-border bg-surface p-8 text-left shadow-sm">
        <h3 className="mb-4 text-xl font-bold text-text-primary">Why this is different</h3>
        <ul className="space-y-3 text-text-secondary">
          <li className="flex items-start">
            <span className="mr-2 text-primary">✓</span>
            <span><strong>Recognizable Dishes:</strong> Generates established meals (like Chicken Piccata or Pasta Primavera) instead of weird, random ingredient combinations.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-primary">✓</span>
            <span><strong>Practical & Realistic:</strong> Respects your active prep time limits and ensures portion sizes match your household.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-primary">✓</span>
            <span><strong>Consolidated Shopping:</strong> Automatically builds a grouped shopping list across your entire week's plan.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
