"use client";

import { useState, useRef } from "react";
import { API_URL } from "@/lib/api";
import AgentActivityPanel from "./AgentActivityPanel";

type AgentStatus = "pending" | "active" | "complete";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
  const [criticNotes, setCriticNotes] = useState<string | null>(null);
  const conversationId = useRef<string | null>(null);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const question = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    setStatuses({ router: "active" });
    setCriticNotes(null);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          conversation_id: conversationId.current,
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
            conversationId.current = event.output.conversation_id;
          } else if (event.node === "router") {
            setStatuses({ router: "complete", researcher: "active" });
          } else if (event.node === "researcher") {
            setStatuses((prev) => ({ ...prev, researcher: "complete", critic: "active" }));
          } else if (event.node === "critic") {
            setStatuses((prev) => ({ ...prev, critic: "complete", synthesizer: "active" }));
            setCriticNotes(event.output.critic_notes);
          } else if (event.node === "synthesizer") {
            setStatuses((prev) => ({ ...prev, synthesizer: "complete" }));
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: event.output.final_answer },
            ]);
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
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
                msg.role === "user"
                  ? "self-end bg-ink text-paper"
                  : "self-start bg-hairline/40"
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