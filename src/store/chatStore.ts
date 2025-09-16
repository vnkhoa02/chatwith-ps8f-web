"use client";
import { create } from "zustand";
import type { ChatMessage, AttachmentBase } from "@/types/chat";

interface ChatState {
  messages: ChatMessage[];
  pendingId?: string;
  addUserMessage: (
    content: string,
    attachments?: AttachmentBase[],
  ) => ChatMessage;
  startAssistantStream: () => string; // returns message id
  appendAssistantChunk: (id: string, chunk: string) => void;
  finalizeAssistant: (id: string) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      id: "sys-1",
      role: "system",
      content: "You are an AI assistant.",
      createdAt: Date.now(),
    },
  ],
  addUserMessage: (content, attachments) => {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: Date.now(),
      attachments,
    };
    set((s) => ({ messages: [...s.messages, msg] }));
    return msg;
  },
  startAssistantStream: () => {
    const id = crypto.randomUUID();
    const msg: ChatMessage = {
      id,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
      pending: true,
    };
    set((s) => ({ messages: [...s.messages, msg], pendingId: id }));
    return id;
  },
  appendAssistantChunk: (id, chunk) => {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + chunk } : m,
      ),
    }));
  },
  finalizeAssistant: (id) => {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, pending: false } : m,
      ),
      pendingId: undefined,
    }));
  },
  reset: () => set({ messages: [] }),
}));
