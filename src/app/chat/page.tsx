import ChatLayout from "@/components/Chat/ChatLayout";
import ChatWindow from "@/components/Chat/ChatWindow";

export default async function ChatPage() {
  return (
    <ChatLayout>
      <div>
        <ChatWindow />
      </div>
    </ChatLayout>
  );
}
