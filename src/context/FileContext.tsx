
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the file type
export interface FileType {
  id: string;
  name: string;
  size: number;
  type: string;
  modified: Date;
  creator: string;
  favorite: boolean;
  shared: boolean;
  tags: string[];
  versions: {
    id: string;
    versionNumber: number;
    createdAt: Date;
    createdBy: string;
    changes: string;
  }[];
}

// Define the file context type
interface FileContextType {
  files: FileType[];
  selectedFile: FileType | null;
  selectFile: (file: FileType | null) => void;
  toggleFavorite: (id: string) => void;
  deleteFile: (id: string) => void;
}

// Create the context
const FileContext = createContext<FileContextType | undefined>(undefined);

// Sample data
const sampleFiles: FileType[] = [
  {
    id: "1",
    name: "ProjectProposal.docx",
    size: 1250000,
    type: "application/msword",
    modified: new Date('2025-04-01T10:30:00'),
    creator: "John Doe",
    favorite: true,
    shared: true,
    tags: ["work", "proposal"],
    versions: [
      { id: "v1", versionNumber: 2, createdAt: new Date('2025-04-01T10:30:00'), createdBy: "John Doe", changes: "Updated financial projections" },
      { id: "v2", versionNumber: 1, createdAt: new Date('2025-03-28T15:20:00'), createdBy: "John Doe", changes: "Initial draft" }
    ]
  },
  {
    id: "2",
    name: "Vacation_Photo.jpg",
    size: 3450000,
    type: "image/jpeg",
    modified: new Date('2025-03-29T14:15:00'),
    creator: "John Doe",
    favorite: false,
    shared: false,
    tags: ["personal", "vacation"],
    versions: [
      { id: "v3", versionNumber: 1, createdAt: new Date('2025-03-29T14:15:00'), createdBy: "John Doe", changes: "Original upload" }
    ]
  },
  {
    id: "3",
    name: "QuarterlyReport.pdf",
    size: 5250000,
    type: "application/pdf",
    modified: new Date('2025-03-25T09:45:00'),
    creator: "Jane Smith",
    favorite: true,
    shared: true,
    tags: ["work", "report", "finance"],
    versions: [
      { id: "v4", versionNumber: 3, createdAt: new Date('2025-03-25T09:45:00'), createdBy: "Jane Smith", changes: "Final review changes" },
      { id: "v5", versionNumber: 2, createdAt: new Date('2025-03-24T16:30:00'), createdBy: "John Doe", changes: "Added executive summary" },
      { id: "v6", versionNumber: 1, createdAt: new Date('2025-03-23T11:20:00'), createdBy: "John Doe", changes: "Initial draft" }
    ]
  },
  {
    id: "4",
    name: "CompanyBrochure.pdf",
    size: 8750000,
    type: "application/pdf",
    modified: new Date('2025-03-22T13:10:00'),
    creator: "Jane Smith",
    favorite: false,
    shared: true,
    tags: ["marketing", "brochure"],
    versions: [
      { id: "v7", versionNumber: 1, createdAt: new Date('2025-03-22T13:10:00'), createdBy: "Jane Smith", changes: "Initial upload" }
    ]
  },
  {
    id: "5",
    name: "ClientData.xlsx",
    size: 2150000,
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    modified: new Date('2025-03-20T11:05:00'),
    creator: "John Doe",
    favorite: false,
    shared: false,
    tags: ["work", "client", "data"],
    versions: [
      { id: "v8", versionNumber: 2, createdAt: new Date('2025-03-20T11:05:00'), createdBy: "John Doe", changes: "Updated client contact information" },
      { id: "v9", versionNumber: 1, createdAt: new Date('2025-03-19T09:30:00'), createdBy: "John Doe", changes: "Initial data entry" }
    ]
  }
];

// Create the provider
export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileType[]>(sampleFiles);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  const selectFile = (file: FileType | null) => {
    setSelectedFile(file);
  };

  const toggleFavorite = (id: string) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === id 
          ? { ...file, favorite: !file.favorite } 
          : file
      )
    );

    // Update selected file if it's the one being toggled
    if (selectedFile && selectedFile.id === id) {
      setSelectedFile({ ...selectedFile, favorite: !selectedFile.favorite });
    }
  };

  const deleteFile = (id: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
    
    // Clear selected file if it's the one being deleted
    if (selectedFile && selectedFile.id === id) {
      setSelectedFile(null);
    }
  };

  return (
    <FileContext.Provider
      value={{
        files,
        selectedFile,
        selectFile,
        toggleFavorite,
        deleteFile
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
