"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chatStore";
import type { ChatMessage } from "@/types/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

export function MessageList() {
  const { messages } = useChatStore();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    // auto-scroll only if user is near bottom
    const el = viewportRef.current;
    if (!el) return;
    const threshold = 120; // px from bottom
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    if (nearBottom) scrollToBottom("smooth");
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
      setShowScrollBtn(!atBottom);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={containerRef}>
      <ScrollArea>
        <div className="mx-auto flex flex-col gap-5 p-6 pb-6">
          {/* bottom padding for composer spacing */}
          {messages
            .filter((m) => m.role != "system")
            .map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>
      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom("smooth")}
          className="bg-background/80 hover:bg-accent absolute right-4 bottom-4 rounded-md border px-3 py-1.5 text-xs shadow backdrop-blur transition"
          aria-label="Scroll to bottom"
        >
          ↓ New Messages
        </button>
      )}
    </div>
  );
}

const isBase64Audio = (str: string) =>
  /^[A-Za-z0-9+/=]+$/.test(str) && str.length > 100;

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";
  const isBase64 = isBase64Audio(msg.content);

  if (isBase64) {
    return (
      <div
        className={cn(
          "flex gap-3",
          isUser && "justify-end",
          isSystem && "opacity-70",
        )}
      >
        {!isUser && !isSystem && (
          <Button size="icon" className="h-8 w-8 flex-shrink-0">
            AI
          </Button>
        )}
        <div
          className={cn(
            "max-w-full rounded-md border px-4 py-3 text-sm break-words whitespace-pre-wrap shadow-xs",
            isUser && "bg-primary text-primary-foreground border-primary",
            !isUser && !isSystem && "bg-card",
            isSystem && "bg-muted text-muted-foreground border-muted",
          )}
          style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
        >
          <audio controls>
            <source
              src={`data:audio/wav;base64,${msg.content}`}
              type="audio/wav"
            />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser && "justify-end",
        isSystem && "opacity-70",
      )}
    >
      {!isUser && !isSystem && (
        <Button size="icon" className="h-8 w-8 flex-shrink-0">
          AI
        </Button>
      )}
      <div
        className={cn(
          "max-w-full rounded-md border px-4 py-3 text-sm break-words whitespace-pre-wrap shadow-xs",
          isUser && "bg-primary text-primary-foreground border-primary",
          !isUser && !isSystem && "bg-card",
          isSystem && "bg-muted text-muted-foreground border-muted",
        )}
        style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
      >
        {msg.content}
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {msg.attachments.map((att) => (
              <AttachmentPreview
                key={att.id}
                name={att.name}
                kind={att.kind}
                previewUrl={att.previewUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AttachmentPreview({
  name,
  kind,
  previewUrl,
}: {
  name: string;
  kind: string;
  previewUrl?: string;
}) {
  return (
    <div className="group bg-background/80 relative flex max-w-[140px] items-center gap-2 overflow-hidden rounded-md border p-2 text-[11px]">
      {kind === "image" && previewUrl && (
        <img
          src={previewUrl}
          alt={name}
          className="h-10 w-10 rounded object-cover"
        />
      )}
      {kind === "audio" && (
        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded text-[10px]">
          AUDIO
        </div>
      )}
      {kind === "file" && (
        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded text-[10px]">
          FILE
        </div>
      )}
      <span className="flex-1 truncate">{name}</span>
    </div>
  );
}
