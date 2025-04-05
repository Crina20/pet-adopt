"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config"; // Your Firebase config file
import { usePathname, useRouter } from "next/navigation";
import axios from "axios"; // For making requests to your backend
import { User } from "@prisma/client";
import { getUser } from "@/services/userService";

interface FirebaseUserContextType {
  user: User | null;
  loading: boolean;
}

const FirebaseUserContext = createContext<FirebaseUserContextType | undefined>(
  undefined
);

export const FirebaseUserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [firebaseUser, loadingFirebase] = useAuthState(auth); // Firebase hook to track auth state
  const [user, setUser] = useState<User | null>(null); // Local state to hold the user data
  const [loading, setLoading] = useState<boolean>(true); // Loading state to handle loading user data
  const router = useRouter();
  const pathname = usePathname(); // Get current path from the router

  useEffect(() => {
    const fetchUserData = async () => {
      if (firebaseUser) {
        try {
          // After the user is authenticated, fetch user data from your backend (e.g., Prisma DB)
          const response = await getUser(firebaseUser.uid);
          if (response) {
            const userData: User = response;
            setUser(userData); // Set user data to state
          }
        } catch (error) {
          console.error("Error fetching user data from backend:", error);
          setUser(null);
        }
      }
      setLoading(false); // Once data fetching is complete, stop loading
    };

    if (firebaseUser) {
      fetchUserData();
    } else {
      setUser(null);
      setLoading(false);
    }

    // Redirect to sign-in if the user is not authenticated and path is not sign-in or sign-up
    if (
      !loadingFirebase &&
      !firebaseUser &&
      pathname !== "/sign-in" &&
      pathname !== "/sign-up"
    ) {
      router.push("/sign-in"); // Redirect to sign-in if not authenticated and not on the sign-in/sign-up pages
    }
  }, [firebaseUser, loadingFirebase, pathname, router]); // Run this effect when firebaseUser or path changes

  return (
    <FirebaseUserContext.Provider
      value={{ user, loading: loading || loadingFirebase }}
    >
      {children}
    </FirebaseUserContext.Provider>
  );
};

// Custom hook to access Firebase User context
export const useFirebaseUser = (): FirebaseUserContextType => {
  const context = useContext(FirebaseUserContext);
  if (!context) {
    throw new Error(
      "useFirebaseUser must be used within a FirebaseUserProvider"
    );
  }
  return context;
};
