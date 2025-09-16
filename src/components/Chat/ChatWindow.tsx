"use client";
import { useChatSession } from "@/hooks/useChatSession";
import type { AttachmentBase } from "@/types/chat";
import { useCallback, useRef, useState } from "react";
import Composer from "./Composer";
import { MessageList } from "./MessageList";

export default function ChatWindow() {
  const { sendMessage } = useChatSession();
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<AttachmentBase[]>([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newOnes: AttachmentBase[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      kind: f.type.startsWith("image") ? "image" : "file",
      name: f.name,
      size: f.size,
      file: f,
      mimeType: f.type,
      previewUrl: f.type.startsWith("image")
        ? URL.createObjectURL(f)
        : undefined,
    }));
    setAttachments((prev) => [...prev, ...newOnes]);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const att: AttachmentBase = {
          id: crypto.randomUUID(),
          kind: "audio",
          name: "recording.webm",
          size: blob.size,
          file: blob,
          mimeType: "audio/webm",
          previewUrl: URL.createObjectURL(blob),
        };
        setAttachments((a) => [...a, att]);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch (err) {
      console.error("mic error", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
  }, []);

  const onSend = useCallback(async () => {
    const content = input.trim();
    if (!content && attachments.length === 0) return;
    setInput("");
    setAttachments([]);
    await sendMessage(content, { attachments });
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
          onFiles={handleFiles}
          onSend={onSend}
          recording={recording}
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
