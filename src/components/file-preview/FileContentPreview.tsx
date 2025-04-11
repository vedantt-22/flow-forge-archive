
import React from 'react';
import { Download, Image } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { getFileIcon } from '@/utils/file-helpers';

interface FileContentPreviewProps {
  fileType: string;
}

const FileContentPreview: React.FC<FileContentPreviewProps> = ({ fileType }) => {
  return (
    <div className="p-6 text-center">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 flex flex-col items-center justify-center">
        {fileType.includes('image') ? (
          <div className="border rounded-lg p-2 shadow-sm">
            <Image className="h-24 w-24 text-blue-500 mb-4" />
            <p className="text-sm text-gray-500">Image preview not available in this demo</p>
          </div>
        ) : (
          <>
            {getFileIcon(fileType)}
            <p className="mt-4 text-gray-500">Preview not available for this file type</p>
            <Button variant="outline" className="mt-4">
              <Download className="mr-2 h-4 w-4" />
              Download to view
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default FileContentPreview;
