"use client";

import { useState, useEffect } from "react";
import AnimalForm from "@/components/AnimalForm";
import { useRouter } from "next/navigation";
import { useFirebaseUser } from "@/contexts/FirebaseUserContext";
import { use } from "react";
import Loader from "@/components/loader";

export default function EditAnimalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = useFirebaseUser(); // Access user context
  const [animal, setAnimal] = useState<any>(null);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false); // State pentru a determina dacă formularul e read-only
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    if (id) {
      const fetchAnimal = async () => {
        const res = await fetch(`/api/animals/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAnimal(data);

          // Verificăm dacă utilizatorul este stăpânul animalului
          console.log(data.userId, user?.id);
          setIsReadOnly(data.userId !== user?.id);
        } else {
          // Dacă animalul nu este găsit, redirecționăm utilizatorul
          router.push("/");
        }
      };

      fetchAnimal();
    }
  }, [id, user?.id]);

  if (!animal || !user) {
    return <Loader />; // Loading state
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Edit Animal</h1>
      <AnimalForm
        userId={user.id}
        initialData={animal}
        isEdit={true}
        isReadonly={isReadOnly}
      />
    </div>
  );
}
