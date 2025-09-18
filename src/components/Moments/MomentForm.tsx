"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useUpload } from "@/hooks/useUpload";
import { Mic, Square, Upload as UploadIcon, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export interface MomentFormValues {
  title: string;
  description: string;
  tags?: string[];
  label?: string;
  // For web, we'll return base64 audio if recorded
  audioBase64?: string;
  images?: string[]; // uploaded URLs
}

export default function MomentForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<MomentFormValues>;
  onSubmit: (payload: MomentFormValues) => void | Promise<void>;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tagsText, setTagsText] = useState(initial?.tags?.join(", ") ?? "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(initial?.images ?? []);

  // Audio
  const { isRecording, durationSec, start, stop, base64, reset } =
    useAudioRecorder();
  const [audioBase64, setAudioBase64] = useState<string | undefined>(
    initial?.audioBase64,
  );
  useEffect(() => {
    if (base64) setAudioBase64(base64);
  }, [base64]);
  // Ensure initial audio/images rehydrate on prop change (e.g., edit modal opens for a new item)
  useEffect(() => {
    if (initial?.audioBase64) setAudioBase64(initial.audioBase64);
    if (initial?.images) setImageUrls(initial.images);
    if (initial?.title !== undefined) setTitle(initial.title);
    if (initial?.description !== undefined) setDescription(initial.description);
    if (initial?.tags) setTagsText(initial.tags.join(", "));
    if (initial?.label !== undefined) setLabel(initial.label);
  }, [
    initial?.audioBase64,
    initial?.images,
    initial?.title,
    initial?.description,
  ]);

  // Image upload (optional): demonstrate using existing useUpload hook
  const uploader = useUpload();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const tags = useMemo(
    () =>
      tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [tagsText],
  );

  const canSubmit = title.trim().length > 0 && description.trim().length > 0;

  const onPickImages = (files?: FileList | null) => {
    if (!files || !files.length) return;
    const arr = Array.from(files);
    setImageFiles((prev) => [...prev, ...arr]);
    const locals = arr.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...locals]);
  };

  const uploadImages = async () => {
    const urls: string[] = [];
    for (const f of imageFiles) {
      try {
        const res = await uploader.startAsync(f);
        urls.push(res.url);
      } catch (e) {
        console.error("upload error", e);
      }
    }
    setImageUrls((prev) => [...prev, ...urls]);
    setImageFiles([]);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    // Upload any pending images first
    if (imageFiles.length) await uploadImages();
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      tags,
      label: label.trim() || undefined,
      audioBase64: audioBase64,
      images: imageUrls,
    });
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewUrls]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="col-span-1">
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Moment title"
          />
        </div>
        <div className="col-span-1">
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Label (optional)
          </label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Voice Memo"
          />
        </div>
      </div>

      <div>
        <label className="text-muted-foreground mb-1 block text-xs font-medium">
          Description
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Describe this moment"
        />
      </div>

      <div>
        <label className="text-muted-foreground mb-1 block text-xs font-medium">
          Tags (comma separated)
        </label>
        <Input
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="e.g. ideas, product"
        />
        {tags.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {/* Audio controls */}
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <Button size="sm" onClick={start} aria-label="Start recording">
            <Mic className="mr-2 h-4 w-4" /> Record
          </Button>
        ) : (
          <Button
            size="sm"
            variant="destructive"
            onClick={stop}
            aria-label="Stop recording"
          >
            <Square className="mr-2 h-4 w-4" /> Stop
          </Button>
        )}
        <div className="text-muted-foreground text-xs">
          {isRecording
            ? `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, "0")}`
            : audioBase64
              ? "Recorded audio ready"
              : "No recording"}
        </div>
        {audioBase64 && !isRecording ? (
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              reset();
              setAudioBase64(undefined);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {/* Playback (if recorded) */}
      {audioBase64 && !isRecording ? (
        <div className="-mt-2">
          <audio controls src={`data:audio/webm;base64,${audioBase64}`} />
        </div>
      ) : null}

      {/* Image picker + upload */}
      <div className="flex items-center gap-3">
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onPickImages(e.target.files)}
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={uploadImages}
          disabled={!imageFiles.length || uploader.uploading}
        >
          <UploadIcon className="mr-2 h-4 w-4" /> Upload Images
        </Button>
        {uploader.uploading ? (
          <div className="flex items-center gap-2">
            <Progress value={uploader.progress} className="w-32" />
            <span className="text-muted-foreground text-xs">
              {uploader.progress}%
            </span>
          </div>
        ) : null}
      </div>

      {previewUrls.length || imageUrls.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {previewUrls.map((u) => (
            <img
              key={u}
              src={u}
              alt="local preview"
              className="h-20 w-20 rounded object-cover"
            />
          ))}
          {imageUrls.map((u) => (
            <img
              key={u}
              src={u}
              alt="uploaded"
              className="h-20 w-20 rounded object-cover"
            />
          ))}
        </div>
      ) : null}

      {/* Revoke object URLs on unmount */}
      {/**/}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          Save
        </Button>
      </div>
    </div>
  );
}
