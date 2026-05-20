'use client';

import { useState, useEffect, useRef, type JSX, type ChangeEvent } from 'react';
import Image from 'next/image';
import { UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Comma-separated MIME types passed to the file input's accept attribute. */
  accept: string;
  maxSizeMb?: number;
  /** Show an image preview when a file is selected. Defaults to 'none'. */
  preview?: 'image' | 'none';
  /** Called with the selected File. Should throw on failure so the dialog shows an error. */
  onUpload: (file: File) => Promise<void>;
}

export default function UploadDialog({
  open,
  onOpenChange,
  title,
  description,
  accept,
  maxSizeMb = 5,
  preview = 'none',
  onUpload,
}: Props): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function reset(): void {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setIsUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleOpenChange(next: boolean): void {
    if (isUploading) return;
    reset();
    onOpenChange(next);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>): void {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) return;

    if (selected.size > maxSizeMb * 1024 * 1024) {
      setError(`File must be smaller than ${maxSizeMb} MB`);
      return;
    }

    setError(null);
    setFile(selected);

    if (preview === 'image') {
      const url = URL.createObjectURL(selected);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
    }
  }

  async function handleUpload(): Promise<void> {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      await onUpload(file);
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            'flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:border-muted-foreground/60 hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          {preview === 'image' && previewUrl ? (
            <Image
              src={previewUrl}
              alt="Preview"
              width={320}
              height={160}
              unoptimized
              className="max-h-40 max-w-full rounded object-contain"
            />
          ) : file ? (
            <p className="break-all px-4 text-center text-sm text-muted-foreground">
              {file.name}
            </p>
          ) : (
            <>
              <UploadIcon className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to browse</p>
            </>
          )}
        </button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isUploading}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
