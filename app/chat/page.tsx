"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useFirebaseUser } from "@/contexts/FirebaseUserContext"; // Use Firebase User context
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ConversationsPage() {
  const { user } = useFirebaseUser(); // Get current user from Firebase User Context
  const [conversations, setConversations] = useState<any[]>([]);
  const router = useRouter();

  // Fetch user conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return;

      // Query conversations where the user is a participant
      const q = query(
        collection(db, "conversations"),
        where("participants", "array-contains", user?.id)
      );
      const querySnapshot = await getDocs(q);

      const convs = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const convData = doc.data();
          const receiverId =
            convData.participants[0] === user?.id
              ? convData.participants[1]
              : convData.participants[0];

          const res = await fetch(`/api/get-user/${receiverId}`);
          const data = await res.json();

          return {
            id: doc.id,
            participants: convData.participants,
            lastMessage: convData.lastMessage,
            timestamp: convData.timestamp,
            user: data.data,
          };
        })
      );
      console.log(convs);
      setConversations(convs);
    };

    fetchConversations();
  }, [user?.id]); // Re-fetch if user id changes

  const handleConversationClick = (convId: string) => {
    // Navigate to the chat page for the selected conversation
    router.push(`/chat/${convId}`);
  };

  return (
    <div className="flex flex-col h-[90vh] max-w-3xl mx-auto bg-gray-900 text-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <h1 className="text-xl font-semibold">My Conversations</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversations.map((conv) => {
          // Get the partner's ID
          return (
            <div
              key={conv.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer"
              onClick={() => handleConversationClick(conv.id)}
            >
              <div className="w-12 h-12 rounded-full bg-gray-600">
                <img
                  src={conv.user.picture}
                  alt="User Avatar"
                  className="h-12 w-12 rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  Conversation with {conv.user.fullName}
                </p>
                <p className="text-sm text-gray-400">{conv.lastMessage}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
