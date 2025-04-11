
import React, { useState } from 'react';
import { Upload, Check } from 'lucide-react';
import { useFileContext } from '@/context/FileContext';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const FileUploadZone: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadFile } = useFileContext();
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prevProgress => {
        const newProgress = prevProgress + 5;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          // Actual upload happens here
          uploadFile(file)
            .then(() => {
              setTimeout(() => {
                setIsUploading(false);
                toast({
                  title: "File uploaded successfully",
                  description: `${file.name} has been added to your files`,
                  variant: "default",
                });
              }, 500);
            })
            .catch(error => {
              setIsUploading(false);
              toast({
                title: "Upload failed",
                description: error.message || "An error occurred during upload",
                variant: "destructive",
              });
            });
        }
        
        return newProgress;
      });
    }, 100);
  };

  return (
    <div 
      className={`
        upload-zone h-full flex flex-col items-center justify-center
        ${isDragging ? 'border-fileflow-400 bg-fileflow-50 dark:bg-fileflow-900/20' : ''}
        ${isUploading ? 'bg-fileflow-50 dark:bg-fileflow-900/10' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isUploading ? (
        <div className="w-full max-w-md text-center">
          <div className="mb-2">
            <Check className={`mx-auto h-8 w-8 ${uploadProgress === 100 ? 'text-green-500' : 'text-fileflow-500 animate-pulse-slow'}`} />
          </div>
          <h3 className="text-lg font-medium mb-3">
            {uploadProgress < 100 ? 'Uploading...' : 'Upload Complete!'}
          </h3>
          <Progress value={uploadProgress} className="h-2 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {uploadProgress === 100 ? 'Processing file...' : `${uploadProgress}% complete`}
          </p>
        </div>
      ) : (
        <>
          <Upload className="upload-icon h-12 w-12 mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Drop files to upload</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-sm">
            Drop files here or click to browse from your computer.
          </p>
          
          <label htmlFor="file-upload">
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button 
              variant="outline" 
              className="hover:bg-fileflow-50 border-fileflow-300 text-fileflow-700 dark:text-fileflow-400 hover:text-fileflow-800"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Select Files
            </Button>
          </label>
        </>
      )}
    </div>
  );
};

export default FileUploadZone;
