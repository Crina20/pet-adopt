import NearbyAnimalMap from "../../../components/Map";

export default function NearbyPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Animals Near You</h1>
      <NearbyAnimalMap />
    </div>
  );
}
