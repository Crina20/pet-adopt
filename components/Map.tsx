"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function NearbyAnimalMap() {
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [animals, setAnimals] = useState<any[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords([latitude, longitude]);

        const res = await fetch(`/api/animals`);
        const data = await res.json();
        setAnimals(data);
      },
      (err) => {
        console.error("Location access denied or error", err);
      }
    );
  }, []);

  if (!userCoords) return <p>Loading map...</p>;

  return (
    <MapContainer
      center={userCoords}
      zoom={12}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={userCoords}>
        <Popup>You are here</Popup>
      </Marker>

      {animals.map((animal) => (
        <Marker key={animal.id} position={[animal.latitude, animal.longitude]}>
          <Popup minWidth={200}>
            <div className="text-sm">
              <img
                src={animal.image || "/fallback.jpg"}
                alt={animal.name}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <strong className="block">{animal.name}</strong>
              <span>{animal.species}</span>
              <br />
              {animal.description && (
                <p className="mt-1 text-gray-600">{animal.description}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
