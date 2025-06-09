"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type DailyStats = {
  date: string;
  animals: number;
  adoptions: number;
};

export default function AdminDashboardMetrics() {
  const [data, setData] = useState<DailyStats[]>([]);
  const [totalAnimals, setTotalAnimals] = useState(0);
  const [totalAdoptions, setTotalAdoptions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/metrics/")
      .then((res) => res.json())
      .then((json) => {
        setData(json.dailyStats);
        setTotalAnimals(json.totalAnimals);
        setTotalAdoptions(json.totalAdoptions);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-white p-6">Loading metrics...</div>;

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-semibold mb-4">Overview (Last 10 Days)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 shadow text-center">
          <p className="text-sm text-gray-400">Total Animals</p>
          <p className="text-2xl font-bold text-green-400">{totalAnimals}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 shadow text-center">
          <p className="text-sm text-gray-400">Total Adoptions</p>
          <p className="text-2xl font-bold text-blue-400">{totalAdoptions}</p>
        </div>
      </div>

      <div className="bg-gray-900 p-4 rounded-lg shadow">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="animals"
              stroke="#22c55e"
              name="Animals Created"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="adoptions"
              stroke="#3b82f6"
              name="Adoption Requests"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
