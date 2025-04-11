
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  getFilesByUserId, 
  getFileById, 
  getFileVersions, 
  uploadFile, 
  addFileVersion, 
  toggleFileFavorite, 
  deleteFile 
} from '@/lib/file-service';
import { FileDocument, VersionDocument } from '@/lib/mongodb';

export type FileType = {
  id: string;
  name: string;
  size: number;
  type: string;
  modified: Date;
  creator: string;
  versions: VersionType[];
  shared: boolean;
  favorite: boolean;
  tags: string[];
};

export type VersionType = {
  id: string;
  number: number;
  date: Date;
  author: string;
  changes: string;
};

interface FileContextType {
  files: FileType[];
  selectedFile: FileType | null;
  selectFile: (file: FileType | null) => void;
  uploadFile: (file: File) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  addVersion: (fileId: string, fileContent: File, changes: string) => Promise<void>;
  isLoading: boolean;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

// Helper function to convert MongoDB documents to our app's FileType
const convertToFileType = (file: FileDocument, versions: VersionDocument[] = []): FileType => {
  return {
    id: file._id || '',
    name: file.name,
    size: file.size,
    type: file.type,
    modified: file.updatedAt,
    creator: file.ownerId, // In a real app, you'd fetch the user's name
    shared: file.shared,
    favorite: file.favorite,
    tags: file.tags,
    versions: versions.map(v => ({
      id: v._id || '',
      number: v.versionNumber,
      date: v.createdAt,
      author: v.createdBy, // In a real app, you'd fetch the user's name
      changes: v.changes,
    })),
  };
};

export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileType[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();

  // Load user's files when user changes
  useEffect(() => {
    const loadFiles = async () => {
      if (!user?._id) return;
      
      setIsLoading(true);
      try {
        // Get user's files
        const userFiles = await getFilesByUserId(user._id);
        
        // Convert to app's FileType and load versions for each file
        const filesWithVersions = await Promise.all(
          userFiles.map(async (file) => {
            const versions = await getFileVersions(file._id || '');
            return convertToFileType(file, versions);
          })
        );
        
        setFiles(filesWithVersions);
      } catch (error) {
        console.error('Error loading files:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFiles();
  }, [user]);

  const selectFile = (file: FileType | null) => {
    setSelectedFile(file);
  };

  const handleUploadFile = async (file: File) => {
    if (!user?._id) return;
    
    setIsLoading(true);
    try {
      // Read file content
      const fileContent = await file.arrayBuffer();
      
      // Upload file
      const newFile = await uploadFile({
        name: file.name,
        size: file.size,
        type: file.type,
        content: fileContent,
        ownerId: user._id,
      });
      
      // Get versions
      const versions = await getFileVersions(newFile._id || '');
      
      // Convert to app's FileType
      const fileWithVersions = convertToFileType(newFile, versions);
      
      // Add to files list
      setFiles([...files, fileWithVersions]);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (id: string) => {
    setIsLoading(true);
    try {
      // Delete file
      await deleteFile(id);
      
      // Remove from files list
      setFiles(files.filter(file => file.id !== id));
      
      // Deselect if deleted
      if (selectedFile && selectedFile.id === id) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      // Toggle favorite
      await toggleFileFavorite(id);
      
      // Update in files list
      setFiles(files.map(file => 
        file.id === id ? { ...file, favorite: !file.favorite } : file
      ));
      
      // Update selected file if needed
      if (selectedFile && selectedFile.id === id) {
        setSelectedFile({ ...selectedFile, favorite: !selectedFile.favorite });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  };

  const handleAddVersion = async (fileId: string, fileContent: File, changes: string) => {
    if (!user?._id) return;
    
    setIsLoading(true);
    try {
      // Read file content
      const content = await fileContent.arrayBuffer();
      
      // Add version
      await addFileVersion(fileId, user._id, content, changes);
      
      // Get updated file and versions
      const file = await getFileById(fileId);
      const versions = await getFileVersions(fileId);
      
      if (file) {
        const updatedFile = convertToFileType(file, versions);
        
        // Update in files list
        setFiles(files.map(f => f.id === fileId ? updatedFile : f));
        
        // Update selected file if needed
        if (selectedFile && selectedFile.id === fileId) {
          setSelectedFile(updatedFile);
        }
      }
    } catch (error) {
      console.error('Error adding version:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FileContext.Provider 
      value={{ 
        files, 
        selectedFile, 
        selectFile, 
        uploadFile: handleUploadFile, 
        deleteFile: handleDeleteFile, 
        toggleFavorite: handleToggleFavorite, 
        addVersion: handleAddVersion,
        isLoading 
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export const useFileContext = (): FileContextType => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};
