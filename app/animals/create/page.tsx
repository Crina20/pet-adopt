// app/animals/create/page.tsx
"use client";
import AnimalForm from "@/components/AnimalForm";
import Loader from "@/components/loader";
import { useFirebaseUser } from "@/contexts/FirebaseUserContext";

export default function CreateAnimalPage() {
  const { user, setUser, loading } = useFirebaseUser();

  if (loading || !user) return <Loader />;

  return (
    <div className="p-6">
      <AnimalForm userId={user.id} />
    </div>
  );
}
