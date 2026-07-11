"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import ConfirmDialog from "./ConfirmDialog";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  async function fetchConversations() {
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data);
    } catch {
      // non-critical, fail silently
    }
  }

  useEffect(() => {
    fetchConversations();
  }, [refreshKey]);

  function startEditing(c: ConversationSummary, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(c.id);
    setEditValue(c.title);
  }

  async function submitRename(id: string) {
    const title = editValue.trim();
    setEditingId(null);
    if (!title) return;

    try {
      await fetch(`${API_URL}/conversations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ title }),
      });
      await fetchConversations();
    } catch {
      // non-critical
    }
  }

  async function requestDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleteTarget(id);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);

    try {
      await fetch(`${API_URL}/conversations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (id === selectedId) onNewChat();
      await fetchConversations();
    } catch {
      // non-critical
    }
  }

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
          <div
            key={c.id}
            onClick={() => editingId !== c.id && onSelect(c.id)}
            className={`group flex items-center gap-1 text-sm px-2 py-1.5 rounded-sm cursor-pointer transition-colors ${
              c.id === selectedId ? "bg-hairline/50" : "hover:bg-hairline/30"
            }`}
          >
            {editingId === c.id ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => submitRename(c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitRename(c.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-paper border border-teal rounded-sm px-1 text-sm outline-none"
              />
            ) : (
              <>
                <span className="flex-1 truncate">{c.title}</span>
                <button
                  onClick={(e) => startEditing(c, e)}
                  className="opacity-0 group-hover:opacity-100 text-ink/40 hover:text-saffron text-xs shrink-0 transition-opacity"
                >
                  edit
                </button>
                <button
                  onClick={(e) => requestDelete(c.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-ink/40 hover:text-critic text-xs shrink-0 transition-opacity"
                >
                  delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete conversation?"
        message="This will permanently delete this conversation and all its messages."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}