"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  helpText: string;
  buttonText: string;
  loadingText: string;
}

export function FileUpload({
  onUpload,
  isLoading,
  helpText,
  buttonText,
  loadingText,
  className,
  ...props
}: FileUploadProps) {
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await onUpload(file);
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg", className)}>
      <input
        type="file"
        onChange={handleChange}
        className="hidden"
        id="file-upload"
        disabled={isLoading}
        {...props}
      />
      <label htmlFor="file-upload">
        <Button asChild disabled={isLoading}>
          <span>
            {isLoading ? loadingText : buttonText}
          </span>
        </Button>
      </label>
      <p className="mt-2 text-sm text-muted-foreground">
        {helpText}
      </p>
    </div>
  );
}