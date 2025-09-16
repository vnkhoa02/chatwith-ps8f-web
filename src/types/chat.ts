export type AttachmentKind = 'image' | 'file' | 'audio';

export interface AttachmentBase {
  id: string;
  kind: AttachmentKind;
  name: string;
  size: number; // bytes
  file: File | Blob;
  previewUrl?: string; // object URL for images/audio
  mimeType?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  attachments?: AttachmentBase[];
  pending?: boolean; // for optimistic UI
  error?: boolean;
  streaming?: boolean; // currently streaming tokens
  model?: string; // model used for assistant response
}

export interface ChatSessionState {
  messages: ChatMessage[];
  append: (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  update: (id: string, patch: Partial<ChatMessage>) => void;
}
