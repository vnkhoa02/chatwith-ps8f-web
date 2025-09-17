"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Circle, Square, UploadCloud, Play, RotateCcw } from "lucide-react";
import { useChatSession } from "@/hooks/useChatSession";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  setTitle(v: string): void;
  onRecorded(base64: string, durationSec: number): void;
  creating: boolean;
}

export function QuickRecord({ title, setTitle, onRecorded, creating }: Props) {
  const { isRecording, start, stop, base64, durationSec, reset } =
    useAudioRecorder();
  const [pendingAudio, setPendingAudio] = useState<string | null>(null); // pure base64 audio
  const [uploadedDuration, setUploadedDuration] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { sendMessage } = useChatSession();
  const router = useRouter();

  // capture recording result
  useEffect(() => {
    if (base64) {
      setPendingAudio(base64);
      setUploadedDuration(durationSec);
    }
  }, [base64, durationSec]);

  const clearRecording = useCallback(() => {
    setPendingAudio(null);
    setUploadedDuration(null);
    reset();
  }, [reset]);

  const handleSave = useCallback(() => {
    if (!pendingAudio) return;
    const dur = uploadedDuration ?? durationSec;
    onRecorded(pendingAudio, dur);
    // Forward to chat and redirect
    void (async () => {
      try {
        await sendMessage(pendingAudio, { isAudio: true, attachments: [] });
        router.push("/chat");
      } catch (e) {
        console.error("sendMessage audio failed", e);
      } finally {
        clearRecording();
      }
    })();
  }, [
    pendingAudio,
    uploadedDuration,
    durationSec,
    onRecorded,
    sendMessage,
    router,
    clearRecording,
  ]);

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        resolve(res.split(",", 2)[1] || res);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFilePick = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (isRecording) stop();
      clearRecording();
      try {
        const pure = await toBase64(file);
        setPendingAudio(pure);
        // derive duration
        const url = URL.createObjectURL(file);
        const temp = new Audio(url);
        temp.addEventListener("loadedmetadata", () => {
          setUploadedDuration(temp.duration ? Math.round(temp.duration) : null);
          URL.revokeObjectURL(url);
        });
      } catch (err) {
        console.error("file read failed", err);
      } finally {
        // reset input value so same file can be selected again
        if (e.target) e.target.value = "";
      }
    },
    [isRecording, stop, clearRecording],
  );

  const dataUrl = pendingAudio
    ? `data:audio/webm;base64,${pendingAudio}`
    : undefined;

  return (
    <div className="bg-card rounded-md border p-4">
      <h3 className="font-medium">Quick Record</h3>
      <div className="mt-4 flex flex-col items-center justify-center gap-3">
        <div className="flex flex-col items-center">
          <Button
            type="button"
            onClick={() => (isRecording ? stop() : start())}
            variant={
              isRecording
                ? "destructive"
                : pendingAudio
                  ? "outline"
                  : "secondary"
            }
            size="lg"
            className="h-16 w-16 rounded-full p-0 text-xl"
          >
            {isRecording ? (
              <Square className="h-6 w-6" />
            ) : (
              <Circle className="h-6 w-6" />
            )}
          </Button>
          <div className="text-muted-foreground mt-2 text-xs tabular-nums">
            {isRecording || pendingAudio
              ? `${(uploadedDuration ?? durationSec).toString().padStart(2, "0")}s`
              : "00:00"}
          </div>
        </div>

        <Input
          placeholder="Add a title for your memo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="max-w-md"
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1"
          >
            <UploadCloud className="h-4 w-4" /> Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFilePick}
          />
        </div>

        {pendingAudio && (
          <div className="flex w-full flex-col items-center gap-2">
            <audio
              ref={audioRef}
              controls
              src={dataUrl}
              className="w-full max-w-md"
            />
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={creating || !title.trim()}
              >
                {creating ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearRecording}
                className="text-muted-foreground"
              >
                <RotateCcw className="mr-1 h-4 w-4" /> Reset
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
