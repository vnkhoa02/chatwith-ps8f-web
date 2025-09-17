"use client";
import { useChatSession } from "@/hooks/useChatSession";
import type { AttachmentBase } from "@/types/chat";
import { useCallback, useEffect, useState } from "react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import Composer from "./Composer";
import { MessageList } from "./MessageList";

export default function ChatWindow() {
  const { sendMessage } = useChatSession();
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<AttachmentBase[]>([]);
  const {
    isRecording,
    start: startRecording,
    stop: stopRecording,
    base64,
    reset,
  } = useAudioRecorder();

  const onSendWithAudio = useCallback(
    async (content: string) => {
      if (!content && attachments.length === 0) return;
      setInput("");
      setAttachments([]);
      await sendMessage(content, { attachments, isAudio: true });
    },
    [attachments, sendMessage],
  );

  // When base64 becomes available after stopping recording, send it automatically
  useEffect(() => {
    if (base64) {
      onSendWithAudio(base64);
      reset();
    }
  }, [base64, onSendWithAudio, reset]);

  const onSend = useCallback(async () => {
    const content = input.trim();
    if (!content && attachments.length === 0) return;
    setInput("");
    setAttachments([]);
    await sendMessage(content, { attachments, isAudio: false });
  }, [input, attachments, sendMessage]);

  return (
    <div className="flex h-screen flex-col">
      <div className="min-h-0 flex-1 overflow-auto">
        <MessageList />
      </div>

      <div className="mb-14 border-t">
        <Composer
          input={input}
          setInput={setInput}
          attachments={attachments}
          onFiles={(atts) => setAttachments(atts)}
          onSend={onSend}
          recording={isRecording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          removeAttachment={(id) =>
            setAttachments((a) => a.filter((x) => x.id !== id))
          }
        />
      </div>
    </div>
  );
}
