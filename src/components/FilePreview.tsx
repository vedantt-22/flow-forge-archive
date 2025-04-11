
import React from 'react';
import { useFileContext } from '@/context/FileContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VersionHistory from './VersionHistory';
import FileHeader from './file-preview/FileHeader';
import FileDetails from './file-preview/FileDetails';
import FileContentPreview from './file-preview/FileContentPreview';
import EmptyFilePreview from './file-preview/EmptyFilePreview';

const FilePreview: React.FC = () => {
  const { selectedFile, selectFile } = useFileContext();
  
  if (!selectedFile) {
    return <EmptyFilePreview />;
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <FileHeader file={selectedFile} onClose={() => selectFile(null)} />
      
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
            <FileDetails file={selectedFile} />
          </TabsContent>
          
          <TabsContent value="versions" className="p-6">
            <VersionHistory versions={selectedFile.versions} fileName={selectedFile.name} />
          </TabsContent>
          
          <TabsContent value="preview">
            <FileContentPreview fileType={selectedFile.type} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FilePreview;
