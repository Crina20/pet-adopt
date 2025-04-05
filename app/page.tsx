"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useEffect } from "react";

export default function Home() {
  const [user] = useAuthState(auth);
  console.log(user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return router.push("/sign-in");
    }
  }, [user]);

  function handleLogout() {
    signOut(auth);
  }

  return !user ? (
    <div></div>
  ) : (
    <div>
      <button onClick={() => handleLogout()}>LogOut</button>
    </div>
  );
}
