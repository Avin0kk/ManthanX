"use client";

import { useState } from "react";
import ConversationSidebar from "@/components/ConversationSidebar";
import DocumentPanel from "@/components/DocumentPanel";
import ChatPanel from "@/components/ChatPanel";

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleConversationCreated(id: string) {
    setConversationId(id);
    setRefreshKey((k) => k + 1);
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 h-[calc(100vh-73px)]">
      <div className="grid grid-cols-[200px_1fr] gap-6 h-full">
        <div className="flex flex-col gap-6 h-full overflow-hidden">
          <ConversationSidebar
            selectedId={conversationId}
            onSelect={setConversationId}
            onNewChat={() => setConversationId(null)}
            refreshKey={refreshKey}
          />
          <DocumentPanel />
        </div>
        <ChatPanel conversationId={conversationId} onConversationCreated={handleConversationCreated} />
      </div>
    </main>
  );
}