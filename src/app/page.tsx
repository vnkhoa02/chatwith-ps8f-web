import ChatLayout from "@/components/Chat/ChatLayout";
import { ChatList } from "@/components/Chat/ChatList";
import ChatWindow from "@/components/Chat/ChatWindow";
import OauthAuth from "@/components/Login/OauthAuth";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { code, state } = await searchParams;
  return (
    <ChatLayout>
      {code && state && <OauthAuth code={code} state={state} />}
      <div className="grid grid-cols-[320px_1fr]">
        <ChatList />
        <ChatWindow />
      </div>
    </ChatLayout>
  );
}
