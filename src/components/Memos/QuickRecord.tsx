"use client";
import { useEffect } from "react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Circle, Square, UploadCloud } from "lucide-react";

interface Props {
  title: string;
  setTitle(v: string): void;
  onRecorded(base64: string, durationSec: number): void;
  creating: boolean;
}

export function QuickRecord({ title, setTitle, onRecorded, creating }: Props) {
  const { isRecording, start, stop, base64, durationSec, reset } =
    useAudioRecorder();

  useEffect(() => {
    if (base64) {
      onRecorded(base64, durationSec);
      reset();
    }
  }, [base64, durationSec, onRecorded, reset]);

  return (
    <div className="bg-card rounded-md border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Quick Record</h3>
        <div className="text-muted-foreground text-xs tabular-nums">
          {isRecording
            ? `${durationSec.toString().padStart(2, "0")}s`
            : "00:00"}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button
          type="button"
          onClick={() => (isRecording ? stop() : start())}
          variant={isRecording ? "destructive" : "secondary"}
        >
          {isRecording ? (
            <Square className="h-4 w-4" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </Button>
        <Input
          placeholder="Add a title for your memo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button disabled className="gap-1" variant="outline" size="sm">
          <UploadCloud className="h-4 w-4" /> Upload Memo
        </Button>
        <Button disabled={creating} size="sm" variant="default">
          Save
        </Button>
      </div>
    </div>
  );
}
