'use client';

import * as React from 'react';
import { FileIcon, UploadIcon, XIcon } from 'lucide-react';
import {
  useDropzone,
  type DropEvent,
  type DropzoneOptions,
  type FileRejection
} from 'react-dropzone';

import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

const ALLOWED_FILE_TYPES = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/zip': ['.zip']
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface FileDropzoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
  className?: string;
}

export function FileDropzone({
  onFileSelect,
  selectedFile,
  disabled = false,
  className
}: FileDropzoneProps): React.JSX.Element {
  const onDrop = React.useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        console.error('File rejected:', fileRejections[0].errors[0].message);
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const dropzoneOptions: DropzoneOptions = {
    accept: ALLOWED_FILE_TYPES,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    onDrop,
    disabled
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File): React.ReactNode => {
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="size-12 object-cover rounded"
        />
      );
    }
    return <FileIcon className="size-12 text-muted-foreground" />;
  };

  if (selectedFile) {
    return (
      <div className={cn(
        "flex items-center gap-4 p-4 border border-dashed rounded-lg bg-muted/50",
        className
      )}>
        <div className="flex-shrink-0">
          {getFileIcon(selectedFile)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{selectedFile.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(selectedFile.size)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleRemoveFile}
          disabled={disabled}
          className="flex-shrink-0"
        >
          <XIcon className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        "hover:border-primary hover:bg-accent/50",
        isDragActive && "border-primary bg-accent/50",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
          <UploadIcon className="size-6" />
        </div>

        <h3 className="text-sm font-medium mb-2">
          {isDragActive ? 'Drop your file here' : 'Upload your digital product'}
        </h3>

        <p className="text-xs text-muted-foreground mb-4">
          Drag & drop or click to select a file
        </p>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Supported formats: PDF, Images, TXT, DOC, DOCX, ZIP</p>
          <p>Maximum file size: 50MB</p>
        </div>
      </div>
    </div>
  );
}
