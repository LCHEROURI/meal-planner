import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase/config';
import { useAuthStore } from '../stores/authStore';

export function useAuthListener() {
  const { setUser, setLoading, setOnboardingCompleted } = useAuthStore();

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      if (user) {
        // Listen to user document for onboarding status
        unsubscribeDoc = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
          if (snapshot.exists()) {
            setOnboardingCompleted(snapshot.data().onboardingCompleted === true);
          } else {
            setOnboardingCompleted(false);
          }
          setLoading(false);
        }, (err) => {
          console.error("Error fetching user profile:", err);
          setLoading(false);
        });
      } else {
        if (unsubscribeDoc) unsubscribeDoc();
        setOnboardingCompleted(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, [setUser, setLoading, setOnboardingCompleted]);
}
