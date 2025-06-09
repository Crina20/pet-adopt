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

  const [adoptionButtonDisabled, setAdoptionButtonDisabled] = useState(false);

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
          `https://api.imgbb.com/1/upload?key=b4e260b59d91b9deb65fba93ae3443de`,
          uploadData
        );

        if (res.data.data.url) {
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

  const handleAdoptionRequest = async () => {
    var adoptionData = {
      animalId: initialData.id,
      requestedById: userId,
      requestedToId: initialData.user.id,
      status: 1,
    };

    const res = await axios.post("/api/adoption", adoptionData);
    if (res) {
      alert("Adoption request sent to owner");
      setAdoptionButtonDisabled(true);
    }
  };

  return (
    <div className="flex">
      <form
        onSubmit={handleSubmit}
        className="mx-auto p-6 color-section text-black shadow rounded-xl space-y-4 flex flex-col md:flex-row"
      >
        <div className="w-90 mr-5">
          <h2 className="text-2xl font-semibold text-black mb-3">
            {isEdit ? "Edit Pet" : "Add New Pet"}
          </h2>

          <div className="flex-none w-90 h-4/5 mb-3 md:mb-0">
            {formData.image && (
              <img
                src={formData.image}
                alt="Animal"
                className="w-full h-full object-contain object-center bg-gray-100 rounded-lg"
              />
            )}
            <div className="mt-2 w-full">
              {!isReadonly && (
                <div>
                  <label
                    htmlFor="image-upload"
                    className="block w-full cursor-pointer p-2 text-white rounded text-center color-button focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {"Upload new image"}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isReadonly}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Coloană dreaptă pentru restul câmpurilor */}
        <div className="flex-1 w-80 space-y-4">
          {/* Input pentru Name */}
          <div className="mb-3">
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              disabled={isReadonly}
              className="w-full p-2 color-input rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Dropdown pentru Species */}
          <div className="mb-3">
            <label className="block text-sm mb-1">Species</label>
            <select
              name="species"
              value={formData.species}
              onChange={handleChange}
              disabled={isReadonly}
              className="w-full p-2 color-input rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="mb-3">
              <label className="block text-sm mb-1">Breed</label>
              <select
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                disabled={isReadonly}
                className="w-full p-2 color-input rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="mb-3">
            <label className="block text-sm mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age || ""}
              onChange={handleChange}
              disabled={isReadonly}
              placeholder="Age"
              className="w-full p-2 color-input rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Dropdown pentru Gender */}
          <div className="mb-3">
            <label className="block text-sm mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              disabled={isReadonly}
              onChange={handleChange}
              className="w-full p-2 color-input rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              {genderList.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>

          {/* Input pentru Description */}
          <div className="mb-3">
            <label className="block text-sm mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isReadonly}
              rows={7}
              placeholder="Description"
              className="w-full p-2 color-input rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isReadonly}
            hidden={isReadonly}
            className="w-full color-button text-black py-2 px-4 rounded-lg transition disabled:bg-gray-400"
          >
            {isEdit ? "Save Changes" : "Create New Pet"}
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
              className="w-full mt-2 bg-red-800 text-white py-2 px-4 rounded-lg hover:bg-red-900 transition"
            >
              Remove Pet
            </button>
          )}

          {isReadonly && (
            <button
              disabled={adoptionButtonDisabled}
              type="button"
              className={"w-full mt-2 text-white px-4 py-2 rounded " + (adoptionButtonDisabled ? "bg-orange-200" : "color-button")}
              onClick={handleAdoptionRequest}
            >
              Request Adoption
            </button>
          )}
        </div>
      </form>
      {initialData?.user && (
        <div className="p-4 mt-4 rounded color-section text-black h-10/12">
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
            <div className="mt-4 bg-gray-600 w-32 h-32 rounded-full flex items-center justify-center text-black">
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
              className="mt-4 color-button text-white px-4 py-2 rounded hover:bg-blue-700"
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
