import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Camera, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const { t } = useTranslation();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={cn(
          "drop-zone cursor-pointer group",
          isDragActive && "active",
          preview ? "p-2" : "p-8 sm:p-12"
        )}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="relative aspect-square rounded-xl overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover animate-fadeIn"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 text-sm font-medium">
                <Camera className="w-4 h-4" />
                Click to change image
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            {/* Upload Icon */}
            <div className="relative mx-auto w-20 h-20">
              <div className={cn(
                "absolute inset-0 rounded-2xl transition-all duration-500",
                isDragActive 
                  ? "bg-primary/20 border-2 border-primary scale-110" 
                  : "bg-secondary/50 border border-border group-hover:border-primary/50 group-hover:bg-primary/5"
              )}>
                <div className="absolute inset-0 flex items-center justify-center">
                  {isDragActive ? (
                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                  ) : (
                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  )}
                </div>
              </div>
              {/* Decorative rings */}
              <div className={cn(
                "absolute -inset-2 rounded-2xl border border-dashed transition-all duration-500",
                isDragActive ? "border-primary/50 animate-pulse" : "border-border/50 group-hover:border-primary/30"
              )} />
              <div className={cn(
                "absolute -inset-4 rounded-3xl border border-dashed transition-all duration-500",
                isDragActive ? "border-primary/30" : "border-transparent group-hover:border-border/30"
              )} />
            </div>

            {/* Text Content */}
            <div className="space-y-2">
              {isDragActive ? (
                <>
                  <p className="text-xl font-serif font-semibold text-primary">
                    {t('dropImage')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Release to upload your image
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-serif font-semibold group-hover:text-primary transition-colors duration-300">
                    {t('dragOrClick')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('orClickToSelect')}
                  </p>
                </>
              )}
            </div>

            {/* Supported Formats */}
            <div className="flex items-center justify-center gap-4 pt-2">
              {['JPG', 'PNG', 'JPEG'].map((format) => (
                <span 
                  key={format}
                  className="px-3 py-1 rounded-lg bg-secondary/50 text-xs font-medium text-muted-foreground"
                >
                  {format}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
