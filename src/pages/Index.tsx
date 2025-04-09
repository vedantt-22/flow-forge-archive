
import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import FileList from '@/components/FileList';
import FileUploadZone from '@/components/FileUploadZone';
import FilePreview from '@/components/FilePreview';
import { FileProvider, useFileContext } from '@/context/FileContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardContent: React.FC = () => {
  const { selectedFile } = useFileContext();
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <div className="flex-1 flex overflow-hidden">
          <div className={`${selectedFile ? 'w-1/2 border-r border-gray-200 dark:border-gray-700' : 'w-full'} flex flex-col overflow-hidden transition-all duration-300`}>
            <Tabs defaultValue="files" className="flex-1 flex flex-col">
              <div className="px-4 pt-4 border-b border-gray-200 dark:border-gray-700">
                <TabsList>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="files" className="flex-1 overflow-auto">
                <FileList />
              </TabsContent>
              
              <TabsContent value="upload" className="flex-1 p-4">
                <FileUploadZone />
              </TabsContent>
            </Tabs>
          </div>
          
          {selectedFile && (
            <div className="w-1/2 flex flex-col overflow-hidden transition-all duration-300">
              <FilePreview />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <FileProvider>
      <DashboardContent />
    </FileProvider>
  );
};

export default Index;
