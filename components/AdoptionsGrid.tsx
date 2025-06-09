"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

type RequestUser = {
  name: String;
  email: String;
};

type Contract = {
  id: string;
  animalId: string;
  animalName: string;
  requestedBy: RequestUser;
  requestedTo: RequestUser;
  status: 1 | 2 | 3 | 4;
  createdAt: string;
};

const statusMap: Record<number, string> = {
  1: "In Progress",
  2: "Approved",
  3: "Rejected",
  4: "Cancelled",
};

const statusColors: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-green-400",
  3: "text-red-400",
  4: "text-gray-400",
};

const CONTRACTS_PER_PAGE = 5;

export default function AnimalContractsGrid({
  contracts,
}: {
  contracts: Contract[];
}) {
  const [statusFilter, setStatusFilter] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [page, setPage] = useState(1);

  const filteredContracts = useMemo(() => {
    return contracts
      .filter((c) => (statusFilter === 0 ? true : c.status === statusFilter))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [contracts, statusFilter]);

  const totalPages = Math.ceil(filteredContracts.length / CONTRACTS_PER_PAGE);

  const paginated = filteredContracts.slice(
    (page - 1) * CONTRACTS_PER_PAGE,
    page * CONTRACTS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(Number(value) as any);
    setPage(1);
  };

  return (
    <div className="mt-10 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Adoption Requests</h2>
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="bg-gray-800 p-2 rounded"
        >
          <option value={0}>All</option>
          <option value={1}>In Progress</option>
          <option value={2}>Approved</option>
          <option value={3}>Rejected</option>
          <option value={4}>Cancelled</option>
        </select>
      </div>

      <div className="grid grid-cols-5 bg-gray-800 text-gray-200 font-semibold p-3 rounded-t">
        <div>Pet Name</div>
        <div>RequestedBy</div>
        <div>RequestedTo</div>
        <div>Status</div>
        <div>Date</div>
      </div>

      {paginated.map((c) => (
        <div
          key={c.id}
          className="grid grid-cols-5 items-center bg-gray-900 p-4 border-b border-gray-800"
        >
          <Link
            className="px-3 py-1 text-sm text-blue-600"
            href={`/animals/edit/${c.animalId}`}
          >
            {c.animalName}
          </Link>
          <div className="text-sm text-gray-400">
            {c.requestedBy.name + " | " + c.requestedBy.email}
          </div>
          <div className="text-sm text-gray-400">
            {c.requestedTo.name + " | " + c.requestedTo.email}
          </div>
          <div className={`${statusColors[c.status]} text-sm`}>
            {statusMap[c.status]}
          </div>
          <div className="text-sm">
            {new Date(c.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}

      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1">{`Page ${page} of ${totalPages}`}</span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
