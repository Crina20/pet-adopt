"use client";

import { useState, useEffect } from "react";
import Loader from "@/components/loader"; // Update to match your loader component
import { useFirebaseUser } from "@/contexts/FirebaseUserContext"; // Import your context hook
import axios from "axios";
import { updateUserProfile } from "@/services/userService";

const Profile = () => {
  const { user, setUser, loading } = useFirebaseUser(); // Access user context

  // State variables to hold user details
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [age, setAge] = useState(user?.age);
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [description, setDescription] = useState(user?.description || "");
  const [imageURL, setImageURL] = useState(user?.picture || ""); // Image URL from ImgBB
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setDescription(user.description || "");
      setImageURL(user.picture || "");
      setAge(user.age);
    }
  }, [user]); // This effect runs whenever `user` changes

  // Handle image file upload to ImgBB
  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setLoadingImage(true);
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=b4e260b59d91b9deb65fba93ae3443de`, // Replace with your ImgBB API key
          formData
        );
        setImageURL(response.data.data.url); // Set the uploaded image URL
      } catch (error) {
        console.error("Image upload failed:", error);
      } finally {
        setLoadingImage(false);
      }
    }
  };

  // Handle saving user profile data
  const handleSave = async () => {
    try {
      if (user) {
        const updatedUserData = {
          id: user.id, // Keep the user id unchanged
          email: user.email, // Keep the email unchanged (readonly)
          fullName,
          phone,
          address,
          picture: imageURL, // Update the image URL
          description: description, // Keep other fields (like description) unchanged unless updated in the form
          age: age ?? null, // Same for other fields
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };

        console.log(updatedUserData);
        // Save updated data in the context (and optionally send it to your backend)
        setUser(updatedUserData);
        updateUserProfile(updatedUserData);
      }

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving user data:", error);
      alert("An error occurred while saving your profile.");
    }
  };

  if (loading || loadingImage) return <Loader />;

  return (
    <div className="flex items-center justify-center min-h-screen text-black">
      <div className="color-section p-8 rounded-lg shadow-lg w-3/5 flex space-x-6">
        {/* Left side - Profile Picture, Full Name, Description */}
        <div className="flex flex-col items-center space-y-4 w-2/3">
          <div
            className="cursor-pointer"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <label className="block text-sm mb-2 text-center">
              Profile Picture
            </label>
            <input
              type="file"
              id="file-input"
              className="hidden"
              onChange={handleImageUpload}
            />
            {imageURL ? (
              <div className="mt-4">
                <img
                  src={imageURL}
                  alt="Profile"
                  className="w-52 h-52 rounded-full object-contain object-center bg-gray-100"
                />
              </div>
            ) : (
              <div className="mt-4 color-input w-32 h-32 rounded-full flex items-center justify-center text-black">
                No Image
              </div>
            )}
          </div>

          <div className="mb-4 w-full">
            <label className="block text-sm mb-2">Description</label>
            <textarea
              className="w-full p-2 color-input rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              rows={5}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Right side - Email, Phone, Address */}
        <div className="w-2/3 space-y-4">
          <div className="mb-4">
            <label className="block text-sm mb-2">Email</label>
            <input
              type="email"
              className="w-full p-2 color-input rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={user?.email || ""}
              readOnly
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2">Phone Number</label>
            <input
              type="text"
              className="w-full p-2 color-input rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2">Full Name</label>
            <input
              type="text"
              className="w-full p-2 color-input rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2">Address</label>
            <input
              type="text"
              className="w-full p-2 color-input rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2">Age</label>
            <input
              type="number"
              className="w-full p-2 color-input rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={age ?? ""}
              onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full p-2 color-button rounded transition mt-11"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
