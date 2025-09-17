"use client";
import { useChatSession } from "@/hooks/useChatSession";
import type { AttachmentBase } from "@/types/chat";
import { useCallback, useRef, useState } from "react";
import Composer from "./Composer";
import { MessageList } from "./MessageList";

async function blobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function ChatWindow() {
  const { sendMessage } = useChatSession();
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<AttachmentBase[]>([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Pick a supported mime type (Safari may not support webm)
      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/mpeg",
      ];
      const mimeType = preferredTypes.find((t) =>
        window.MediaRecorder?.isTypeSupported?.(t),
      );
      const mr = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch (err) {
      console.error("mic error", err);
    }
  }, []);

  const onSendWithAudio = useCallback(
    async (content: string) => {
      if (!content && attachments.length === 0) return;
      setInput("");
      setAttachments([]);
      await sendMessage(content, { attachments, isAudio: true });
    },
    [attachments, sendMessage],
  );

  const stopRecording = useCallback(async () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;

    // If the recorder is already inactive just bail
    if (mr.state === "inactive") {
      setRecording(false);
      return;
    }

    // Wrap in a promise so we wait for the final dataavailable after stop()
    await new Promise<void>((resolve) => {
      const handleStop = async () => {
        try {
          // Some browsers add a final chunk only after stop
          const mime = mr.mimeType || "audio/webm";
          const blob = new Blob(audioChunksRef.current, { type: mime });
          const base64DataUrl = await blobToBase64(blob);
          if (typeof base64DataUrl === "string") {
            // Extract only the base64 payload (after the comma) if user expects pure base64
            const pureBase64 = base64DataUrl.split(",", 2)[1] || base64DataUrl;
            onSendWithAudio(pureBase64);
          }
        } catch (e) {
          console.error("Error processing recorded audio", e);
        } finally {
          mediaRecorderRef.current = null;
          setRecording(false);
          resolve();
        }
      };

      mr.onstop = handleStop;
      try {
        if (mr.state !== "inactive") {
          // Request the last timeslice data if supported
          if (typeof mr.requestData === "function") {
            try {
              mr.requestData();
            } catch {}
          }
          mr.stop();
        }
      } catch (err) {
        console.error("Failed to stop recorder", err);
        handleStop();
      }
    });
  }, [onSendWithAudio]);

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
