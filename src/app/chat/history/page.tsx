import ChatLayout from "@/components/Chat/ChatLayout";
import ChatHistoryIndex from "@/components/ChatHistory/ChatHistoryIndex";

export default async function ChatHistoryPage() {
  return (
    <ChatLayout>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ChatHistoryIndex />
      </div>
    </ChatLayout>
  );
}
