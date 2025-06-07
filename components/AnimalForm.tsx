"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/firebase/config";

export default function AnimalForm({
  initialData,
  userId,
  isEdit = false,
  isReadonly = false,
}: {
  initialData?: any;
  userId: string;
  isEdit?: boolean;
  isReadonly: boolean;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    species: initialData?.species || "",
    breed: initialData?.breed || "",
    age: initialData?.age || "",
    gender: initialData?.gender || "",
    description: initialData?.description || "",
    image: initialData?.image || "",
    latitude: 0,
    longitude: 0,
  });

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const router = useRouter();

  const speciesList = ["Dog", "Cat", "Rabbit", "Bird"];
  const breedList = {
    Dog: ["Labrador", "Bulldog", "Beagle", "Poodle"],
    Cat: ["Siamese", "Persian", "Maine Coon", "Sphynx"],
    Rabbit: ["Angora", "Himalayan", "Mini Rex", "Flemish Giant"],
    Bird: ["Parrot", "Canary", "Finch", "Budgie"],
  };

  const genderList = ["Male", "Female"];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        console.error("Failed to get location", err);
      }
    );
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const uploadData = new FormData();
      uploadData.append("image", file);

      try {
        const res = await axios.post(
          `https://api.imgbb.com/1/upload?key=b4e260b59d91b9deb65fba93ae3443de`, // Replace with your ImgBB API key
          uploadData
        );

        if (res.data.data.url) {
          // Presupunem că serverul returnează un obiect cu un câmp `url`
          setFormData({ ...formData, image: res.data.data.url });
        } else {
          alert("Error uploading the image.");
        }
      } catch (error) {
        console.error("Error uploading the image:", error);
        alert("Error uploading the image.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = isEdit ? "PUT" : "POST";
    const endpoint = isEdit ? `/api/animals/${initialData.id}` : "/api/animals";
    if (coords?.lat && coords.lng) {
      formData.latitude = coords?.lat;
      formData.longitude = coords?.lng;
    }

    const res = await fetch(endpoint, {
      method,
      body: JSON.stringify({ ...formData, userId }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      router.push("/animals");
    } else {
      alert("Error saving the data.");
    }
  };

  const handleMessage = async () => {
    const currentUserId = userId;
    const otherUserId = initialData.user.id;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUserId)
    );

    const snapshot = await getDocs(q);

    let conversation = snapshot.docs.find((doc) => {
      const data = doc.data();
      return data.participants.includes(otherUserId);
    });

    if (!conversation) {
      const newDoc = await addDoc(collection(db, "conversations"), {
        participants: [currentUserId, otherUserId],
        createdAt: new Date(),
      });
      conversation = { id: newDoc.id };
    }
    if (conversation) {
      router.push(`/chat/${conversation.id}`);
    }
  };

  return (
    <div className="flex">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto p-6 bg-gray-800 text-white shadow rounded-xl space-y-4 flex flex-col md:flex-row"
      >
        <div className="w-80 mr-5">
          <h2 className="text-2xl font-semibold text-gray-200 mb-4">
            {isEdit ? "Edit Animal" : "Add Animal"}
          </h2>

          {/* Coloană stângă pentru imagine */}
          <div className="flex-none w-full h-4/5 mb-4 md:mb-0">
            {formData.image && (
              <img
                src={formData.image}
                alt="Animal"
                className="w-full h-full object-cover rounded-lg"
              />
            )}
            <div className="mt-2 w-full">
              {!isReadonly && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isReadonly}
                  className="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>
        </div>
        {/* Coloană dreaptă pentru restul câmpurilor */}
        <div className="flex-1 space-y-4">
          {/* Input pentru Name */}
          <div className="mb-4">
            <label className="block text-sm mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              disabled={isReadonly}
              className="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Dropdown pentru Species */}
          <div className="mb-4">
            <label className="block text-sm mb-2">Species</label>
            <select
              name="species"
              value={formData.species}
              onChange={handleChange}
              disabled={isReadonly}
              className="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Species</option>
              {speciesList.map((species) => (
                <option key={species} value={species}>
                  {species}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown pentru Breed */}
          {formData.species && (
            <div className="mb-4">
              <label className="block text-sm mb-2">Breed</label>
              <select
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                disabled={isReadonly}
                className="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Breed</option>
                {breedList[formData.species]?.map((breed: string) => (
                  <option key={breed} value={breed}>
                    {breed}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Input pentru Age */}
          <div className="mb-4">
            <label className="block text-sm mb-2">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age || ""}
              onChange={handleChange}
              disabled={isReadonly}
              placeholder="Age"
              className="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Dropdown pentru Gender */}
          <div className="mb-4">
            <label className="block text-sm mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              disabled={isReadonly}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              {genderList.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>

          {/* Input pentru Location */}
          <div className="mb-4">
            <label className="block text-sm mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location"
              disabled={isReadonly}
              className="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Input pentru Description */}
          <div className="mb-4">
            <label className="block text-sm mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isReadonly}
              placeholder="Description"
              className="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isReadonly}
            hidden={isReadonly}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {isEdit ? "Save Changes" : "Add Animal"}
          </button>

          {isEdit && (
            <button
              disabled={isReadonly}
              hidden={isReadonly}
              type="button"
              onClick={async () => {
                if (confirm("Are you sure you want to delete this animal?")) {
                  const res = await fetch(`/api/animals/${initialData.id}`, {
                    method: "DELETE",
                    body: JSON.stringify({ userId }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                  });
                  if (res.ok) router.push("/");
                  else alert("Error deleting the animal.");
                }
              }}
              className="w-full mt-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
            >
              Delete Animal
            </button>
          )}
        </div>
      </form>
      {initialData?.user && (
        <div className="p-4 mt-4 rounded bg-gray-700 text-white h-10/12">
          <p className="text-sm text-gray-400">Posted by:</p>
          {initialData.user.picture ? (
            <div className="mt-4">
              <img
                src={initialData.user.picture}
                alt="Profile"
                className="w-52 h-52 rounded-full mb-7"
              />
            </div>
          ) : (
            <div className="mt-4 bg-gray-600 w-32 h-32 rounded-full flex items-center justify-center text-white">
              No Image
            </div>
          )}
          <p className="font-semibold">{initialData.user.fullName}</p>
          <p className="text-sm">Email: {initialData.user.email}</p>
          <p className="text-sm">Phone: {initialData.user.phone}</p>
          <p className="text-sm">Address: {initialData.user.address}</p>
          <p className="text-sm">Age: {initialData.user.age}</p>

          {isReadonly ? (
            <button
              onClick={handleMessage}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Send Message
            </button>
          ) : (
            <div></div>
          )}
        </div>
      )}
    </div>
  );
}
