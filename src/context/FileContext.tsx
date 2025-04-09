
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type FileType = {
  id: string;
  name: string;
  size: number;
  type: string;
  modified: Date;
  creator: string;
  versions: VersionType[];
  isEncrypted: boolean;
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
  uploadFile: (file: FileType) => void;
  deleteFile: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addVersion: (fileId: string, version: VersionType) => void;
  isLoading: boolean;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

// Sample data
const mockFiles: FileType[] = [
  {
    id: '1',
    name: 'Project Requirements.pdf',
    size: 1024 * 1024 * 2.5, // 2.5 MB
    type: 'application/pdf',
    modified: new Date('2023-11-15'),
    creator: 'John Doe',
    isEncrypted: true,
    shared: true,
    favorite: true,
    tags: ['important', 'project'],
    versions: [
      {
        id: 'v1',
        number: 1,
        date: new Date('2023-11-10'),
        author: 'John Doe',
        changes: 'Initial version',
      },
      {
        id: 'v2',
        number: 2,
        date: new Date('2023-11-15'),
        author: 'John Doe',
        changes: 'Updated requirements section',
      },
    ],
  },
  {
    id: '2',
    name: 'Financial Report Q3.xlsx',
    size: 1024 * 1024 * 4.2, // 4.2 MB
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    modified: new Date('2023-11-20'),
    creator: 'Jane Smith',
    isEncrypted: true,
    shared: false,
    favorite: false,
    tags: ['finance', 'quarterly'],
    versions: [
      {
        id: 'v1',
        number: 1,
        date: new Date('2023-11-20'),
        author: 'Jane Smith',
        changes: 'Initial version',
      },
    ],
  },
  {
    id: '3',
    name: 'Website Mockup.png',
    size: 1024 * 1024 * 1.8, // 1.8 MB
    type: 'image/png',
    modified: new Date('2023-11-22'),
    creator: 'Design Team',
    isEncrypted: false,
    shared: true,
    favorite: true,
    tags: ['design', 'website'],
    versions: [
      {
        id: 'v1',
        number: 1,
        date: new Date('2023-11-18'),
        author: 'Design Team',
        changes: 'Initial mockup',
      },
      {
        id: 'v2',
        number: 2,
        date: new Date('2023-11-22'),
        author: 'Design Team',
        changes: 'Updated color scheme',
      },
    ],
  },
  {
    id: '4',
    name: 'Client Presentation.pptx',
    size: 1024 * 1024 * 6.7, // 6.7 MB
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    modified: new Date('2023-11-24'),
    creator: 'Marketing Team',
    isEncrypted: true,
    shared: true,
    favorite: false,
    tags: ['presentation', 'client'],
    versions: [
      {
        id: 'v1',
        number: 1,
        date: new Date('2023-11-21'),
        author: 'Marketing Team',
        changes: 'Draft version',
      },
      {
        id: 'v2',
        number: 2,
        date: new Date('2023-11-23'),
        author: 'Marketing Team',
        changes: 'Added executive summary',
      },
      {
        id: 'v3',
        number: 3,
        date: new Date('2023-11-24'),
        author: 'Marketing Team',
        changes: 'Final review updates',
      },
    ],
  },
  {
    id: '5',
    name: 'Project Source Code.zip',
    size: 1024 * 1024 * 15.3, // 15.3 MB
    type: 'application/zip',
    modified: new Date('2023-11-25'),
    creator: 'Development Team',
    isEncrypted: true,
    shared: false,
    favorite: false,
    tags: ['development', 'code'],
    versions: [
      {
        id: 'v1',
        number: 1,
        date: new Date('2023-11-15'),
        author: 'Development Team',
        changes: 'Initial codebase',
      },
      {
        id: 'v2',
        number: 2,
        date: new Date('2023-11-20'),
        author: 'Development Team',
        changes: 'Feature implementation',
      },
      {
        id: 'v3',
        number: 3,
        date: new Date('2023-11-25'),
        author: 'Development Team',
        changes: 'Bug fixes and optimizations',
      },
    ],
  },
];

export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileType[]>(mockFiles);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectFile = (file: FileType | null) => {
    setSelectedFile(file);
  };

  const uploadFile = (file: FileType) => {
    setIsLoading(true);
    // Simulate upload delay
    setTimeout(() => {
      setFiles([...files, file]);
      setIsLoading(false);
    }, 1500);
  };

  const deleteFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
    if (selectedFile && selectedFile.id === id) {
      setSelectedFile(null);
    }
  };

  const toggleFavorite = (id: string) => {
    setFiles(files.map(file => 
      file.id === id ? { ...file, favorite: !file.favorite } : file
    ));
    
    if (selectedFile && selectedFile.id === id) {
      setSelectedFile({ ...selectedFile, favorite: !selectedFile.favorite });
    }
  };

  const addVersion = (fileId: string, version: VersionType) => {
    setFiles(files.map(file => 
      file.id === fileId 
        ? { ...file, versions: [...file.versions, version], modified: version.date } 
        : file
    ));
    
    if (selectedFile && selectedFile.id === fileId) {
      setSelectedFile({ 
        ...selectedFile, 
        versions: [...selectedFile.versions, version],
        modified: version.date 
      });
    }
  };

  return (
    <FileContext.Provider 
      value={{ 
        files, 
        selectedFile, 
        selectFile, 
        uploadFile, 
        deleteFile, 
        toggleFavorite, 
        addVersion,
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
