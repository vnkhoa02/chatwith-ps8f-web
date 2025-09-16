"use client";
import { AUTH_CONFIG } from "@/config/auth";
import { useChatStore } from "@/store/chatStore";
import type { AttachmentBase } from "@/types/chat";
import Cookies from "js-cookie";
import { useCallback } from "react";

interface SendOptions {
  attachments?: AttachmentBase[];
  model?: string; // custom model id if different
  abortController?: AbortController; // optional external abort
}

export function useChatSession() {
  const {
    messages,
    addUserMessage,
    startAssistantStream,
    appendAssistantChunk,
    finalizeAssistant,
  } = useChatStore();

  const sendMessage = useCallback(
    async (content: string, opts?: SendOptions) => {
      const trimmed = content.trim();
      if (!trimmed && !opts?.attachments?.length) return;
      addUserMessage(trimmed, opts?.attachments);
      const msgId = startAssistantStream();
      const token = Cookies.get(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        appendAssistantChunk(
          msgId,
          "\n[Auth missing: access token cookie not found]",
        );
        finalizeAssistant(msgId);
        return;
      }
      try {
        const controller = opts?.abortController || new AbortController();
        const bodyPayload = {
          model: opts?.model,
          stream: true,
          messages: [
            ...messages
              .slice(-15)
              .map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: trimmed },
          ],
        };
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_P8_FS_API}/api/v1/chat/completions`,
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(bodyPayload),
          },
        );
        if (!res.ok || !res.body) {
          appendAssistantChunk(msgId, `\n[Request failed: ${res.status}]`);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          // Parse Server-Sent Events style: lines starting with 'data:'
          let lineBreakIndex;
          while ((lineBreakIndex = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, lineBreakIndex).trim();
            buffer = buffer.slice(lineBreakIndex + 1);
            if (!line) continue;
            if (line === "data: [DONE]") {
              buffer = "";
              break;
            }
            if (line.startsWith("data:")) {
              const jsonStr = line.slice(5).trim();
              try {
                const evt = JSON.parse(jsonStr);
                const delta = evt?.choices?.[0]?.delta?.content;
                if (delta) appendAssistantChunk(msgId, delta);
              } catch (e) {
                // swallow parse errors for partial lines
              }
            }
          }
        }
      } catch (err: any) {
        if (err?.name === "AbortError") {
          appendAssistantChunk(msgId, "\n[Aborted]");
        } else {
          appendAssistantChunk(msgId, "\n[Streaming error]");
          console.error("stream error", err);
        }
      } finally {
        finalizeAssistant(msgId);
      }
    },
    [
      messages,
      addUserMessage,
      startAssistantStream,
      appendAssistantChunk,
      finalizeAssistant,
    ],
  );

  return { messages, sendMessage };
}
