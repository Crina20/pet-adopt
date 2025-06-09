"use client";

import { useEffect, useState } from "react";
import { useFirebaseUser } from "@/contexts/FirebaseUserContext";
import axios from "axios";
import Loader from "@/components/loader";
import Link from "next/link";
import toast from "react-hot-toast";
import { XCircle, CheckCircle, Clock, Ban } from "lucide-react";

type PetAdoption = {
  id: string;
  status: number;
  animal: {
    id: string;
    name: string;
  };
  requestedBy: {
    email: string;
  };
  requestedTo: {
    email: string;
  };
};

export default function AdoptionsPage() {
  const { user, loading } = useFirebaseUser();
  const [requestsMade, setRequestsMade] = useState<PetAdoption[]>([]);
  const [requestsReceived, setRequestsReceived] = useState<PetAdoption[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user && !loading) {
      axios.get(`/api/adoption/${user.id}`).then((res) => {
        setRequestsMade(res.data.requestsMade);
        setRequestsReceived(res.data.requestsReceived);
        setLoadingData(false);
      });
    }
  }, [user, loading]);

  const cancelRequest = async (id: string) => {
    try {
      await axios.put(`/api/adoption/status/${id}`, { status: 4 });
      setRequestsMade((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 4 } : r))
      );
      toast.success("Request cancelled");
    } catch {
      toast.error("Failed to cancel request");
    }
  };

  const handleDecision = async (id: string, newStatus: number) => {
    try {
      await axios.put(`/api/adoption/status/${id}`, { status: newStatus });
      setRequestsReceived((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      toast.success(newStatus === 2 ? "Request approved" : "Request rejected");
    } catch {
      toast.error("Failed to update request status");
    }
  };

  if (loading || loadingData) return <Loader />;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
      {/* Requests Made */}
      <div>
        <h2 className="text-xl font-bold mb-4">Adoption requests sent</h2>
        {requestsMade.length === 0 ? (
          <p className="text-gray-400">No requests made yet.</p>
        ) : (
          <ul className="space-y-4">
            {requestsMade.map((req) => (
              <li key={req.id} className="p-4 rounded color-section shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-lg font-semibold">
                    Pet name: {req.animal.name}
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  Adoption request sent to: {req.requestedTo.email}
                </p>
                <div className="flex gap-3 mt-2 justify-end">
                  <Link
                    href={`/animals/edit/${req.animal.id}`}
                    className="px-3 py-1 text-sm rounded color-button"
                  >
                    View Pet
                  </Link>
                  {req.status != 4 && (
                    <button
                      onClick={() => cancelRequest(req.id)}
                      className="px-3 py-1 text-sm rounded bg-red-800 text-white"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Requests Received */}
      <div>
        <h2 className="text-xl font-bold mb-4">Adoption requests received</h2>
        {requestsReceived.length === 0 ? (
          <p className="text-gray-400">No adoption requests received.</p>
        ) : (
          <ul className="space-y-4">
            {requestsReceived.map((req) => (
              <li key={req.id} className="p-4 rounded color-section shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-lg font-semibold">
                    Pet name: {req.animal.name}
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  Adoption request received from: {req.requestedBy.email}
                </p>
                <div className="flex gap-3 mt-2 justify-end flex-wrap">
                  <Link
                    href={`/animals/edit/${req.animal.id}`}
                    className="px-3 py-1 text-sm rounded color-button"
                  >
                    View Pet
                  </Link>
                  {req.status === 1 && (
                    <>
                      <button
                        onClick={() => handleDecision(req.id, 2)}
                        className="px-3 py-1 text-sm rounded bg-green-800 text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecision(req.id, 3)}
                        className="px-3 py-1 text-sm rounded bg-red-800 text-white"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: number }) {
  const common = "flex items-center gap-1 text-sm font-medium";

  switch (status) {
    case 1:
      return (
        <span className={`${common} text-yellow-900`}>
          <Clock className="w-4 h-4" />
          Pending
        </span>
      );
    case 2:
      return (
        <span className={`${common} text-green-900`}>
          <CheckCircle className="w-4 h-4" />
          Approved
        </span>
      );
    case 3:
      return (
        <span className={`${common} text-red-900`}>
          <XCircle className="w-4 h-4" />
          Rejected
        </span>
      );
    case 4:
      return (
        <span className={`${common} text-gray-400`}>
          <Ban className="w-4 h-4" />
          Cancelled
        </span>
      );
    default:
      return <span className={`${common} text-white`}>Unknown</span>;
  }
}
