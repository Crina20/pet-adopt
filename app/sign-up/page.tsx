"use client";

import { useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { createUser } from "@/services/userService";
import { useRouter } from "next/navigation";
export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth);

  const handleSignup = async (e: any) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    try {
      const res = await createUserWithEmailAndPassword(email, password);
      console.log({ res });

      if (res) {
        await createUser({ uid: res?.user.uid, email: email });
      } else {
        setError("User already exists");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        return;
      }

      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError("");
      router.push("/profile");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-black">
      <div className="color-section p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSignup}>
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
          <div className="mb-4">
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
          <div className="mb-4">
            <label className="block text-sm mb-2">Confirm Password</label>
            <input
              type="password"
              className="w-full p-2 color-input rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 mb-2 color-button rounded transition"
          >
            Sign Up
          </button>
          <button
            onClick={() => router.push('/sign-in')}
            className="w-full p-2 color-button rounded transition"
          >
            Return to Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
