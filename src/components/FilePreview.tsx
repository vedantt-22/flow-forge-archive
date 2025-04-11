
import React from 'react';
import { useFileContext } from '@/context/FileContext';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Share, 
  Trash, 
  File, 
  FileText, 
  Image, 
  FileArchive,
  Calendar,
  User
} from 'lucide-react';
import VersionHistory from './VersionHistory';
import { useToast } from "@/hooks/use-toast";

const getFileIcon = (fileType: string) => {
  if (fileType.includes('image')) {
    return <Image className="h-12 w-12 text-blue-500" />;
  } else if (fileType.includes('pdf')) {
    return <FileText className="h-12 w-12 text-red-500" />;
  } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
    return <FileText className="h-12 w-12 text-green-500" />;
  } else if (fileType.includes('zip') || fileType.includes('compressed')) {
    return <FileArchive className="h-12 w-12 text-orange-500" />;
  } else if (fileType.includes('presentation')) {
    return <FileText className="h-12 w-12 text-yellow-500" />;
  } else {
    return <File className="h-12 w-12 text-gray-500" />;
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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const FilePreview: React.FC = () => {
  const { selectedFile, selectFile } = useFileContext();
  const { toast } = useToast();
  
  if (!selectedFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <File className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No File Selected</h2>
        <p className="text-gray-500 max-w-md">
          Select a file from the list to view details, or upload a new file to get started.
        </p>
      </div>
    );
  }

  const handleShareClick = () => {
    toast({
      title: "Link copied to clipboard",
      description: `Share link for ${selectedFile.name} has been copied to your clipboard`,
      variant: "default",
    });
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mr-4">
            {getFileIcon(selectedFile.type)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold">{selectedFile.name}</h2>
            </div>
            
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <span>{formatFileSize(selectedFile.size)}</span>
              <span className="mx-2">•</span>
              <span>Last modified {formatDate(selectedFile.modified)}</span>
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
            onClick={() => selectFile(null)}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 ml-2"
          >
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="details">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <TabsList className="bg-transparent border-b-0">
              <TabsTrigger value="details" className="rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-fileflow-600">Details</TabsTrigger>
              <TabsTrigger value="versions" className="rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-fileflow-600">Version History</TabsTrigger>
              <TabsTrigger value="preview" className="rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-fileflow-600">Preview</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="details" className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">File Information</h3>
                <div className="space-y-3">
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500">Type</div>
                    <div className="w-2/3 text-sm">{selectedFile.type.split('/').pop()?.toUpperCase()}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500">Size</div>
                    <div className="w-2/3 text-sm">{formatFileSize(selectedFile.size)}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500">Created By</div>
                    <div className="w-2/3 text-sm flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-400" />
                      {selectedFile.creator}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500">Modified</div>
                    <div className="w-2/3 text-sm flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(selectedFile.modified)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Security & Sharing</h3>
                <div className="space-y-3">
                  <div className="flex">
                    <div className="w-1/3 text-sm text-gray-500">Sharing</div>
                    <div className="w-2/3 text-sm">
                      {selectedFile.shared ? (
                        <span className="flex items-center text-fileflow-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                          Shared with team
                        </span>
                      ) : (
                        <span className="text-gray-600">Not shared</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-sm font-medium text-gray-500 mt-6 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedFile.tags.length > 0 ? (
                    selectedFile.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center rounded-full bg-fileflow-50 px-2 py-1 text-xs font-medium text-fileflow-700 ring-1 ring-inset ring-fileflow-200"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="versions" className="p-6">
            <VersionHistory versions={selectedFile.versions} fileName={selectedFile.name} />
          </TabsContent>
          
          <TabsContent value="preview" className="p-6 text-center">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 flex flex-col items-center justify-center">
              {selectedFile.type.includes('image') ? (
                <div className="border rounded-lg p-2 shadow-sm">
                  <Image className="h-24 w-24 text-blue-500 mb-4" />
                  <p className="text-sm text-gray-500">Image preview not available in this demo</p>
                </div>
              ) : (
                <>
                  {getFileIcon(selectedFile.type)}
                  <p className="mt-4 text-gray-500">Preview not available for this file type</p>
                  <Button variant="outline" className="mt-4">
                    <Download className="mr-2 h-4 w-4" />
                    Download to view
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FilePreview;
