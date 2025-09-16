import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AttachmentBase } from "@/types/chat";
import { Mic, Paperclip, Send, StopCircle } from "lucide-react";

interface ComposerProps {
  input: string;
  setInput: (v: string) => void;
  attachments: AttachmentBase[];
  onFiles: (fl: FileList | null) => void;
  onSend: () => void;
  recording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  removeAttachment: (id: string) => void;
}

export default function Composer({
  input,
  setInput,
  attachments,
  onFiles,
  onSend,
  recording,
  startRecording,
  stopRecording,
  removeAttachment,
}: ComposerProps) {
  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/70 border-t p-4 backdrop-blur">
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="group bg-card relative flex items-center gap-2 rounded-md border px-2 py-1 text-xs"
            >
              {att.kind === "image" && att.previewUrl && (
                <img
                  src={att.previewUrl}
                  alt={att.name}
                  className="h-8 w-8 rounded object-cover"
                />
              )}
              {att.kind === "audio" && (
                <span className="bg-muted rounded px-2 py-1 text-[10px]">
                  Audio
                </span>
              )}
              {att.kind === "file" && (
                <span className="bg-muted rounded px-2 py-1 text-[10px]">
                  File
                </span>
              )}
              <span className="max-w-[120px] truncate">{att.name}</span>
              <button
                onClick={() => removeAttachment(att.id)}
                className="text-muted-foreground hover:text-foreground ml-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <label
          className="bg-card hover:bg-accent/50 cursor-pointer rounded-md border p-2"
          aria-label="Attach files"
        >
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
          <Paperclip className="h-4 w-4" />
        </label>
        <div className="flex-1">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message the AI..."
            className="min-h-[60px] resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          {!recording && (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={startRecording}
              aria-label="Start recording"
              className="h-9 w-9"
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
          {recording && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={stopRecording}
              aria-label="Stop recording"
              className="h-9 w-9"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            onClick={onSend}
            disabled={!input.trim() && attachments.length === 0}
            className="gap-1"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </div>
      {recording && (
        <div className="text-muted-foreground mt-2 animate-pulse text-xs">
          Recording... tap stop to attach.
        </div>
      )}
    </div>
  );
}
