import { useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Upload } from "lucide-react";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept: string;
  maxSize: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  file: File | null;
  className?: string;
}

export function FileDropzone({
  onFileSelect,
  accept,
  maxSize,
  icon,
  title,
  subtitle,
  file,
  className,
  ...props
}: FileDropzoneProps & React.HTMLAttributes<HTMLDivElement>) {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.size <= maxSize && accept.includes(file.type)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, maxSize, accept]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);
  
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size <= maxSize) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, maxSize]);
  
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Create empty file to trigger reset
    const input = document.createElement('input');
    input.type = 'file';
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, []);
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className={cn("relative", className)} {...props}>
      {!file ? (
        <div
          className={cn(
            "border-2 border-dashed border-border bg-muted/50 p-8 text-center transition-all duration-200 hover:bg-muted/80 cursor-pointer",
            isDragOver && "drag-over"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.onchange = handleFileInput;
            input.click();
          }}
        >
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-3">
              {icon}
            </div>
            <p className="text-card-foreground font-medium mb-1">{title}</p>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>
        </div>
      ) : (
        <Card className="p-3 bg-muted border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="w-12 h-12 object-cover border border-border"
              />
              <div>
                <p className="text-sm font-medium text-card-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-destructive hover:text-destructive/80"
              data-testid="button-remove-file"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
