import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase/config';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useNavigate, Link } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const createUserProfile = async (uid: string, email: string) => {
    await setDoc(doc(db, 'users', uid), {
      email,
      onboardingCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await createUserProfile(userCredential.user.uid, data.email);
      navigate('/app');
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/email-already-in-use') {
          setError('Email is already in use.');
        } else {
          setError('Failed to create account.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // If it's a new user, create their profile
      // For simplicity, we just set the doc with merge: true
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        onboardingCompleted: false, // We don't know if they finished, but merge will keep existing data if not new
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      navigate('/app');
    } catch (err) {
      setError('Google sign-up failed.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm">
      <h2 className="mb-6 text-center text-2xl font-bold text-text-primary">Create an Account</h2>
      
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

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Sign Up
        </Button>
      </form>

      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-border"></div>
        <span className="px-3 text-sm text-text-secondary">or</span>
        <div className="flex-1 border-t border-border"></div>
      </div>

      <Button variant="secondary" className="w-full" onClick={handleGoogleSignup}>
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
