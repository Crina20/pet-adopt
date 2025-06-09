"use client";

type RequestUser = {
    name: String;
    email: String;
}

type Contract = {
  id: string;
  animalId: string;
  animalName: string;
  requestedBy: RequestUser;
  requestedTo: RequestUser;
  status: 1 | 2 | 3 | 4;
  createdAt: string;
};


import { useEffect, useState } from "react";
import axios from "axios";
import AdoptionsGrid from "@/components/AdoptionsGrid";
import AdminDashboardMetrics from "@/components/DashBoardMetrics";

type User = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  isActive: boolean;
  isAdmin: boolean;
};

const USERS_PER_PAGE = 5;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"name" | "email">("name");
  const [emailSearch, setEmailSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    axios.get("/api/admin/users").then((res) => {
      setUsers(res.data);
    });

    axios.get("/api/admin/adoptions").then((res) => {
      setContracts(res.data);
    });
  }, []);

  const filtered = users
    .filter((u) =>
      filter === "all" ? true : filter === "active" ? u.isActive : !u.isActive
    )
    .filter((u) => u.email.toLowerCase().includes(emailSearch.toLowerCase()))
    .filter((u) =>
      (u.phone || "").toLowerCase().includes(phoneSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return (a.fullName || "").localeCompare(b.fullName || "");
      } else {
        return a.email.localeCompare(b.email);
      }
    });

  const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const toggleUser = async (id: string, newState: boolean) => {
    try {
      await axios.patch(`/api/admin/users/${id}`, { isActive: newState });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: newState } : u))
      );
    } catch {
      alert("Failed to update user");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset page when filters change
  const handleFilterChange = (cb: () => void) => {
    cb();
    setCurrentPage(1);
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) =>
            handleFilterChange(() => setFilter(e.target.value as any))
          }
          className="bg-gray-800 p-2 rounded"
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-gray-800 p-2 rounded"
        >
          <option value="name">Sort by Name</option>
          <option value="email">Sort by Email</option>
        </select>

        <input
          type="text"
          placeholder="Search by Email"
          value={emailSearch}
          onChange={(e) =>
            handleFilterChange(() => setEmailSearch(e.target.value))
          }
          className="bg-gray-800 p-2 rounded flex-grow min-w-[200px]"
        />

        <input
          type="text"
          placeholder="Search by Phone"
          value={phoneSearch}
          onChange={(e) =>
            handleFilterChange(() => setPhoneSearch(e.target.value))
          }
          className="bg-gray-800 p-2 rounded flex-grow min-w-[200px]"
        />
      </div>

      <div className="grid grid-cols-7 bg-gray-800 text-gray-200 font-semibold p-3 rounded-t">
        <div>Full Name</div>
        <div>Email</div>
        <div>Phone</div>
        <div>Status</div>
        <div>Role</div>
        <div className="col-span-2">Actions</div>
      </div>

      {paginated.map((user) => (
        <div
          key={user.id}
          className="grid grid-cols-7 items-center bg-gray-900 p-4 border-b border-gray-800"
        >
          <div>{user.fullName || "No Name"}</div>
          <div className="text-sm text-gray-400">{user.email}</div>
          <div className="text-sm text-gray-400">{user.phone || "-"}</div>
          <div>
            <span
              className={`text-sm font-medium ${
                user.isActive ? "text-green-400" : "text-red-400"
              }`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="text-sm">{user.isAdmin ? "Admin" : "User"}</div>
          <div>
            {!user.isAdmin && (
              <button
                onClick={() => toggleUser(user.id, !user.isActive)}
                className={`px-3 py-1 text-sm rounded ${
                  user.isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {user.isActive ? "Deactivate" : "Activate"}
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Pagination controls */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1">{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <AdoptionsGrid contracts={contracts} />

       <AdminDashboardMetrics />
    </div>
  );
}
