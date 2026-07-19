import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase/config';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useNavigate, Link } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate('/app');
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError('Invalid email or password.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/app');
    } catch (err) {
      setError('Google sign-in failed.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm">
      <h2 className="mb-6 text-center text-2xl font-bold text-text-primary">Sign In</h2>
      
      {error && (
        <div className="mb-4 rounded-md bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          error={errors.email?.message}
        />
        
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
        />

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-border"></div>
        <span className="px-3 text-sm text-text-secondary">or</span>
        <div className="flex-1 border-t border-border"></div>
      </div>

      <Button variant="secondary" className="w-full" onClick={handleGoogleLogin}>
        Sign in with Google
      </Button>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
