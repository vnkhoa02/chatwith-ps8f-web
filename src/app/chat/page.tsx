import ChatLayout from "@/components/Chat/ChatLayout";
import { ChatList } from "@/components/Chat/ChatList";
import ChatWindow from "@/components/Chat/ChatWindow";

export default async function ChatPage() {
  return (
    <ChatLayout>
      <div className="grid grid-cols-[320px_1fr]">
        <ChatList />
        <ChatWindow />
      </div>
    </ChatLayout>
  );
}
