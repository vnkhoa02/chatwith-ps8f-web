import ChatLayout from "@/components/Chat/ChatLayout";
import { MemosScreen } from "@/components/Memos/MemosScreen";

export default function MemosPage() {
  return (
    <ChatLayout>
      <div>
        <MemosScreen />
      </div>
    </ChatLayout>
  );
}
