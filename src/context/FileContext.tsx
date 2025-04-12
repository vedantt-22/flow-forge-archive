
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import * as fileService from '@/lib/file-service-browser';
import { FileDocument, VersionDocument } from '@/lib/types';
import { useAuth } from './AuthContext';

// Define the file context type
interface FileContextType {
  files: FileDocument[];
  selectedFile: FileDocument | null;
  isLoading: boolean;
  selectFile: (file: FileDocument | null) => void;
  toggleFavorite: (id: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  refreshFiles: () => Promise<void>;
}

// Create the context
const FileContext = createContext<FileContextType | undefined>(undefined);

// Create the provider
export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileDocument[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileDocument | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Load files when the user changes
  useEffect(() => {
    if (user?._id) {
      refreshFiles();
    }
  }, [user]);

  // Refresh files from the service
  const refreshFiles = async () => {
    if (!user?._id) return;
    
    setIsLoading(true);
    try {
      const result = await fileService.getFilesByUserId(user._id);
      setFiles(result.files);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectFile = (file: FileDocument | null) => {
    setSelectedFile(file);
  };

  const toggleFavorite = async (id: string) => {
    try {
      const updatedFile = await fileService.toggleFileFavorite(id);
      
      if (updatedFile) {
        // Update files list
        setFiles(prevFiles => 
          prevFiles.map(file => 
            file._id === id ? updatedFile : file
          )
        );

        // Update selected file if it's the one being toggled
        if (selectedFile && selectedFile._id === id) {
          setSelectedFile(updatedFile);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const deleteFile = async (id: string) => {
    try {
      const success = await fileService.deleteFile(id);
      
      if (success) {
        // Remove file from files list
        setFiles(prevFiles => prevFiles.filter(file => file._id !== id));
        
        // Clear selected file if it's the one being deleted
        if (selectedFile && selectedFile._id === id) {
          setSelectedFile(null);
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const uploadFile = async (file: File): Promise<void> => {
    if (!user?._id) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Create ArrayBuffer from File
      const buffer = await file.arrayBuffer();
      
      // Upload file
      await fileService.uploadFile({
        name: file.name,
        size: file.size,
        type: file.type,
        content: buffer,
        ownerId: user._id,
      });
      
      // Refresh files list
      await refreshFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  return (
    <FileContext.Provider
      value={{
        files,
        selectedFile,
        isLoading,
        selectFile,
        toggleFavorite,
        deleteFile,
        uploadFile,
        refreshFiles
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

// Create the hook
export const useFileContext = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};
