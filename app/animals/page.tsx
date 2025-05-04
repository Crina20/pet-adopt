"use client";

import { JSX, useEffect, useState } from "react";
import { Dog, Cat, Rabbit, Bird } from "lucide-react"; // Iconițe din lucide
import { useRouter } from "next/navigation";

type Animal = {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  description: string;
  image: string;
  location: string;
};

const speciesIcons: Record<string, JSX.Element> = {
  Dog: <Dog className="w-4 h-4 inline-block mr-1" />,
  Cat: <Cat className="w-4 h-4 inline-block mr-1" />,
  Rabbit: <Rabbit className="w-4 h-4 inline-block mr-1" />,
  Bird: <Bird className="w-4 h-4 inline-block mr-1" />,
};

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchAnimals = async () => {
      const res = await fetch("/api/animals");
      const data = await res.json();
      setAnimals(data);
      setFilteredAnimals(data);
    };

    fetchAnimals();
  }, []);

  useEffect(() => {
    let result = animals;

    if (selectedSpecies) {
      result = result.filter((animal) => animal.species === selectedSpecies);
    }

    if (selectedBreed) {
      result = result.filter((animal) => animal.breed === selectedBreed);
    }

    setFilteredAnimals(result);
  }, [selectedSpecies, selectedBreed, animals]);

  const uniqueSpecies = Array.from(new Set(animals.map((a) => a.species)));
  const uniqueBreeds = Array.from(
    new Set(
      animals
        .filter((a) => !selectedSpecies || a.species === selectedSpecies)
        .map((a) => a.breed)
    )
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Available Animals</h1>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <select
          value={selectedSpecies}
          onChange={(e) => {
            setSelectedSpecies(e.target.value);
            setSelectedBreed(""); // Reset breed on species change
          }}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          <option value="">All Species</option>
          {uniqueSpecies.map((species) => (
            <option key={species} value={species}>
              {species}
            </option>
          ))}
        </select>

        {/* Breed Filter */}
        <select
          value={selectedBreed}
          onChange={(e) => setSelectedBreed(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          disabled={!selectedSpecies}
        >
          <option value="">All Breeds</option>
          {uniqueBreeds.map((breed) => (
            <option key={breed} value={breed}>
              {breed}
            </option>
          ))}
        </select>
      </div>

      {/* Animal Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 cursor-pointer">
        {filteredAnimals.map((animal) => (
          <div
            key={animal.id}
            className="relative rounded-lg overflow-hidden shadow-lg group hover:shadow-xl transition cursor-pointer"
            onClick={() => router.push(`/animals/edit/${animal.id}`)}
          >
            <img
              src={animal.image}
              alt={animal.name}
              className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-300 ease-in-out"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h2 className="text-xl font-semibold text-white">
                {animal.name}
              </h2>
              <p className="text-sm text-gray-300 line-clamp-2">
                {animal.description}
              </p>
              <p className="text-xs text-gray-400 mt-1 italic flex items-center gap-1">
                {speciesIcons[animal.species]} {animal.species} • {animal.breed}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
