"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";

type ConversationSummary = {
  id: string;
  title: string;
  created_at: string;
};

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  refreshKey: number;
};

export default function ConversationSidebar({ selectedId, onSelect, onNewChat, refreshKey }: Props) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch(`${API_URL}/conversations`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setConversations(data);
      } catch {
        
      }
    }
    fetchConversations();
  }, [refreshKey]);

  return (
    <div className="flex flex-col max-h-[45%]">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-xs text-teal">CHATS</p>
        <button onClick={onNewChat} className="text-xs text-ink/50 hover:text-saffron transition-colors">
          + new
        </button>
      </div>
      <div className="flex flex-col gap-1 overflow-y-auto">
        {conversations.length === 0 && <p className="text-sm text-ink/50">No conversations yet</p>}
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`text-left text-sm px-2 py-1.5 rounded-sm truncate transition-colors ${
              c.id === selectedId ? "bg-hairline/50" : "hover:bg-hairline/30"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>
    </div>
  );
}