"use client";

import { useState, useRef, useEffect } from "react";
import { API_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import AgentActivityPanel from "./AgentActivityPanel";

type AgentStatus = "pending" | "active" | "complete";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
};

export default function ChatPanel({ conversationId, onConversationCreated }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
  const [criticNotes, setCriticNotes] = useState<string | null>(null);
  const activeConversationId = useRef<string | null>(conversationId);
  const isSending = useRef(false);

  useEffect(() => {
    activeConversationId.current = conversationId;

    async function loadMessages() {
      if (!conversationId) {
        setMessages([]);
        setCriticNotes(null);
        setStatuses({});
        return;
      }
      try {
        const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.map((m: { role: "user" | "assistant"; content: string }) => ({
          role: m.role,
          content: m.content,
        })));
        setStatuses({});
        setCriticNotes(null);
      } catch {
        // non-critical
      }
    }

    loadMessages();
  }, [conversationId]);

  async function handleSend() {
    if (!input.trim() || isSending.current) return;
    isSending.current = true;

    const question = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    setStatuses({ router: "active" });
    setCriticNotes(null);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          question,
          conversation_id: activeConversationId.current,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const eventText of events) {
          if (!eventText.startsWith("data: ")) continue;
          const json = eventText.slice(6);
          const event = JSON.parse(json);

          if (event.node === "conversation") {
            const newId = event.output.conversation_id;
            if (activeConversationId.current !== newId) {
              activeConversationId.current = newId;
              onConversationCreated(newId);
            }
          } else if (event.node === "router") {
            setStatuses({ router: "complete", researcher: "active" });
          } else if (event.node === "researcher") {
            setStatuses((prev) => ({ ...prev, researcher: "complete", critic: "active" }));
          } else if (event.node === "critic") {
            setStatuses((prev) => ({ ...prev, critic: "complete", synthesizer: "active" }));
            setCriticNotes(event.output.critic_notes);
          } else if (event.node === "synthesizer") {
            setStatuses((prev) => ({ ...prev, synthesizer: "complete" }));
            setMessages((prev) => [...prev, { role: "assistant", content: event.output.final_answer }]);
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
      isSending.current = false;
    }
  }

  return (
    <div className="grid grid-cols-[1fr_220px] gap-6 h-full">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`text-sm max-w-[80%] px-4 py-2 rounded-sm ${
                msg.role === "user" ? "self-end bg-ink text-paper" : "self-start bg-hairline/40"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your documents"
            disabled={loading}
            className="flex-1 border border-hairline rounded-sm px-3 py-2 text-sm bg-paper"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-ink text-paper px-4 py-2 rounded-sm text-sm disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      <AgentActivityPanel statuses={statuses} criticNotes={criticNotes} />
    </div>
  );
}