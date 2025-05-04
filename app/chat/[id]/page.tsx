"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { useFirebaseUser } from "@/contexts/FirebaseUserContext";
import Image from "next/image";

export default function ChatPage() {
  const { id } = useParams(); // conversation id
  const { user } = useFirebaseUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiver, setReceiver] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Get conversation partner
  useEffect(() => {
    const fetchReceiver = async () => {
      const convRef = doc(db, "conversations", id as string);
      const convSnap = await getDoc(convRef);
      const convData = convSnap.data();
      const partnerId =
        convData?.participants[0] === user?.id
          ? convData?.participants[1]
          : convData?.participants[0];
      console.log("receiver");
      if (partnerId) {
        console.log("receiver2");
        const res = await fetch(`/api/get-user/${partnerId}`);
        const data = await res.json();
        console.log(data);
        setReceiver(data.data);
      }
    };

    if (user?.id) fetchReceiver();
    console.log(receiver);
  }, [id, user?.id]);

  // Listen to messages
  useEffect(() => {
    const messagesRef = collection(
      db,
      "conversations",
      id as string,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => unsubscribe();
  }, [id]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    await addDoc(collection(db, "conversations", id as string, "messages"), {
      senderId: user?.id,
      text: newMessage.trim(),
      timestamp: serverTimestamp(),
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[90vh] max-w-3xl mx-auto bg-gray-900 text-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-700 bg-gray-800">
        {receiver?.picture ? (
          <img
            src={receiver.picture}
            alt="Avatar"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-600" />
        )}
        <div>
          <p className="font-semibold">{receiver?.fullName || "Loading..."}</p>
          <p className="text-sm text-gray-400">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              {!isMe && receiver?.picture && (
                <img
                  src={receiver.picture}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}

              <div
                className={`max-w-sm px-4 py-2 rounded-2xl text-sm shadow ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-700 text-white rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 bg-gray-700 rounded-lg focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
