
import React from 'react';
import { Download, Share, Trash } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { FileDocument } from '@/lib/types';
import { getFileIcon, formatFileSize, formatDate } from '@/utils/file-helpers';
import { useToast } from "@/hooks/use-toast";

interface FileHeaderProps {
  file: FileDocument;
  onClose: () => void;
}

const FileHeader: React.FC<FileHeaderProps> = ({ file, onClose }) => {
  const { toast } = useToast();

  const handleShareClick = () => {
    toast({
      title: "Link copied to clipboard",
      description: `Share link for ${file.name} has been copied to your clipboard`,
      variant: "default",
    });
  };

  return (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-start">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mr-4">
          {getFileIcon(file.type)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">{file.name}</h2>
          </div>
          
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <span>{formatFileSize(file.size)}</span>
            <span className="mx-2">•</span>
            <span>Last modified {formatDate(file.modified || file.updatedAt)}</span>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <Button variant="default" size="sm" className="bg-fileflow-600 hover:bg-fileflow-700">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareClick}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="hover:bg-gray-100 dark:hover:bg-gray-800 ml-2"
        >
          <span className="sr-only">Close</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </Button>
      </div>
    </div>
  );
};

export default FileHeader;
