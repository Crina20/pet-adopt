"use client";

import Link from "next/link";
import { useFirebaseUser } from "@/contexts/FirebaseUserContext";
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import Loader from "./loader";

export default function Navbar() {
  const { user, loading } = useFirebaseUser();

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/animals" className="text-lg font-semibold text-black">
          Pet Adopt
        </Link>
        <Link href="/animals" className="text-gray-700 hover:text-black">
          Pets
        </Link>
        <Link href="/animals/create" className="text-gray-700 hover:text-black">
          Post Pet
        </Link>
        <Link href="/profile" className="text-gray-700 hover:text-black">
          Profile
        </Link>
        <Link href="/chat" className="text-gray-700 hover:text-black">
          Conversations
        </Link>
        <Link href="/animals/nearby" className="text-gray-700 hover:text-black">
          Nearby Pets
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {loading ? (
          <Loader />
        ) : user ? (
          <>
            <span className="text-sm text-gray-700">
              {user.fullName || user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
}
