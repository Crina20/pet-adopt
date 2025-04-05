"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useEffect } from "react";

export default function Home() {
  function handleLogout() {
    signOut(auth);
  }

  return (
    <div>
      <button onClick={() => handleLogout()}>LogOut</button>
    </div>
  );
}
