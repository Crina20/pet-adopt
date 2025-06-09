"use client";
import { useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { browserLocalPersistence, setPersistence } from "firebase/auth";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const handleSignin = async (e: any) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill out all fields");
      return;
    }

    setError("");
    console.log("Sign In:", email, password);

    try {
      await setPersistence(auth, browserLocalPersistence);
      const res = await signInWithEmailAndPassword(email, password);
      console.log({ res });
      if (res) {
        setEmail("");
        setPassword("");
        setError("");

        router.push("/animals");
      } else {
        setError("Invalid Credentials");
      }
    } catch (e) {
      console.log("sign-in " + e);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-black">
      <div className="color-section p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSignin}>
          <div className="mb-4">
            <label className="block text-sm mb-2">Email</label>
            <input
              type="email"
              className="w-full p-2 color-input rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm mb-2">Password</label>
            <input
              type="password"
              className="w-full p-2 color-input rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 mb-2 color-button hover:bg-blue-600 rounded transition"
          >
            Sign In
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              router.push("/sign-up");
            }}
            className="w-full p-2 color-button hover:bg-blue-600 rounded transition"
          >
            Register new account
          </button>
        </form>
      </div>
    </div>
  );
}
