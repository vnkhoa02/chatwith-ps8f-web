import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpload } from "@/hooks/useUpload";
import type { AttachmentBase } from "@/types/chat";
import { Mic, Paperclip, StopCircle } from "lucide-react";
import { useState } from "react";

interface ComposerProps {
  input: string;
  setInput: (v: string) => void;
  attachments: AttachmentBase[];
  onFiles: (atts: AttachmentBase[]) => void;
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
  const { startAsync } = useUpload();
  const [localError, setLocalError] = useState<string | null>(null);

  // Helper to safely update single attachment by id
  const patchAttachment = (
    id: string,
    atts: AttachmentBase[],
    patch: Partial<AttachmentBase>,
  ) => {
    const next = atts.map((a) => {
      if (a.id === id) {
        return { ...a, ...patch };
      }
      return a;
    });
    onFiles(next);
    return next;
  };

  const handleRemove = (id: string) => {
    const target = attachments.find((a) => a.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    onFiles(attachments.filter((a) => a.id !== id));
    removeAttachment(id);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLocalError(null);
    // Stage attachments with 0% progress
    const staged: AttachmentBase[] = Array.from(files).map((file) => {
      let kind: AttachmentBase["kind"] = "file";
      if (file.type.startsWith("image/")) kind = "image";
      else if (file.type.startsWith("audio/")) kind = "audio";
      return {
        id:
          globalThis.crypto?.randomUUID() ||
          Math.random().toString(36).slice(2),
        kind,
        name: file.name,
        size: file.size,
        file,
        previewUrl:
          kind === "image" || kind === "audio"
            ? URL.createObjectURL(file)
            : undefined,
        mimeType: file.type,
        progress: 0,
        uploading: true,
      } as AttachmentBase;
    });
    let newFiles = [...attachments, ...staged];
    for (const att of staged) {
      try {
        const result = await startAsync(att.file as File, (pct) => {
          patchAttachment(att.id, newFiles, {
            progress: pct,
            uploading: pct < 100,
          });
        });
        console.log("Upload result", result);
        newFiles = patchAttachment(att.id, newFiles, {
          progress: 100,
          uploading: false,
          remoteKey: result.key,
          remoteUrl: result.url,
        });
      } catch (e: any) {
        patchAttachment(att.id, newFiles, { uploading: false });
        setLocalError(e.message || "Upload failed");
      } finally {
        onFiles(newFiles);
      }
    }
  };

  return (
    <div className="p-3.5">
      <div
        className={`bg-background/70 supports-[backdrop-filter]:bg-background/60 relative mx-auto w-full max-w-4xl rounded-3xl border px-4 pb-3 shadow-sm backdrop-blur ${attachments.length ? "pt-4" : "pt-3"}`}
      >
        {attachments.length > 0 && (
          <div className="-mt-1 mb-2 flex flex-wrap gap-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="group bg-background/60 relative flex w-40 flex-col gap-1 rounded-md border p-2 text-xs"
              >
                <div className="flex items-center gap-2">
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
                  <span className="max-w-[110px] truncate" title={att.name}>
                    {att.name}
                  </span>
                  <button
                    onClick={() => handleRemove(att.id)}
                    className="text-muted-foreground hover:text-foreground ml-auto"
                  >
                    ×
                  </button>
                </div>
                {att.uploading && Number(att.progress) > 0 && (
                  <div className="bg-secondary/40 h-1.5 w-full overflow-hidden rounded">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${att.progress ?? 0}%` }}
                    />
                  </div>
                )}
                {!att.uploading && att.remoteKey && (
                  <div className="text-muted-foreground/70 text-[10px]">
                    Uploaded
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-3">
          <label
            className="bg-background/60 hover:bg-accent/40 relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border"
            aria-label="Attach files"
          >
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Paperclip className="h-5 w-5" />
          </label>
          <div className="flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="max-h-40 min-h-[40px] resize-none border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
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
            <Button
              type="button"
              variant={recording ? "destructive" : "secondary"}
              size="icon"
              aria-label={recording ? "Stop recording" : "Start recording"}
              className="h-10 w-10 cursor-pointer rounded-full"
              onClick={recording ? stopRecording : startRecording}
            >
              {recording ? (
                <StopCircle className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        {localError && (
          <div className="mt-2 px-1 text-xs text-red-500">{localError}</div>
        )}
        {recording && (
          <div className="text-muted-foreground mt-2 animate-pulse px-1 text-xs">
            Recording... tap stop to attach.
          </div>
        )}
      </div>
    </div>
  );
}
