
import React from 'react';
import { useFileContext, FileType } from '@/context/FileContext';
import { 
  MoreHorizontal, 
  Star, 
  File, 
  FileText, 
  Image, 
  FileArchive,
  Users,
  Calendar
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getFileIcon = (fileType: string) => {
  if (fileType.includes('image')) {
    return <Image className="h-8 w-8 text-blue-500" />;
  } else if (fileType.includes('pdf')) {
    return <FileText className="h-8 w-8 text-red-500" />;
  } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
    return <FileText className="h-8 w-8 text-green-500" />;
  } else if (fileType.includes('zip') || fileType.includes('compressed')) {
    return <FileArchive className="h-8 w-8 text-orange-500" />;
  } else if (fileType.includes('presentation')) {
    return <FileText className="h-8 w-8 text-yellow-500" />;
  } else {
    return <File className="h-8 w-8 text-gray-500" />;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  else return (bytes / 1073741824).toFixed(2) + ' GB';
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const FileListItem: React.FC<{ file: FileType }> = ({ file }) => {
  const { selectFile, toggleFavorite, deleteFile } = useFileContext();

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(file.id);
  };

  return (
    <div 
      className="file-card p-3 mb-3 cursor-pointer animate-fade-in"
      onClick={() => selectFile(file)}
    >
      <div className="flex items-center">
        <div className="mr-3">
          {getFileIcon(file.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h3 className="text-sm font-medium truncate">{file.name}</h3>
          </div>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <span>{formatFileSize(file.size)}</span>
            <span className="mx-1.5">•</span>
            <Calendar className="h-3 w-3 mr-1" />
            <span>{formatDate(file.modified)}</span>
            {file.shared && (
              <>
                <span className="mx-1.5">•</span>
                <Users className="h-3 w-3 mr-1 text-fileflow-400" />
                <span className="text-fileflow-500">Shared</span>
              </>
            )}
          </div>
        </div>
        
        <div className="ml-2 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleFavoriteToggle}
          >
            <Star 
              className={`h-4 w-4 ${file.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
            />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => window.open('#')}>
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(file.id);
              }}>
                {file.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                window.open('#');
              }}>
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFile(file.id);
                }}
                className="text-red-600 focus:text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

const FileList: React.FC = () => {
  const { files } = useFileContext();

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Recent Files</h2>
      <div className="space-y-1">
        {files.map(file => (
          <FileListItem key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
};

export default FileList;
