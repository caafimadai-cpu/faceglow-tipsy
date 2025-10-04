import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);

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
    <div className="w-full max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={cn(
          "drop-zone",
          isDragActive && "active",
          preview && "border-none"
        )}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative w-full aspect-square rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover animate-fadeIn"
            />
          </div>
        ) : (
          <div className="text-center">
            {isDragActive ? (
              <div className="space-y-4">
                <ImageIcon className="w-12 h-12 mx-auto text-primary animate-pulse" />
                <p className="text-lg font-medium text-primary">Halkan dhig sawirkaaga</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">Sawirkaaga halkan soo jiid ama riix</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ama guji si aad u doorato faylka
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};