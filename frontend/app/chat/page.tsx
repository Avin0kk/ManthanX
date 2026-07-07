import DocumentPanel from "@/components/DocumentPanel";
import ChatPanel from "@/components/ChatPanel";

export default function ChatPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-8 h-[calc(100vh-73px)]">
      <div className="grid grid-cols-[200px_1fr] gap-6 h-full">
        <DocumentPanel />
        <ChatPanel />
      </div>
    </main>
  );
}