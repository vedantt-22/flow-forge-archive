
import { browserDb } from './browser-storage';
import { FileDocument, VersionDocument, collections } from './types';

// Default pagination values
const DEFAULT_PAGE_SIZE = 20;

export const uploadFile = async (file: {
  name: string;
  size: number;
  type: string;
  content: ArrayBuffer | string;
  ownerId: string;
  tags?: string[];
}): Promise<FileDocument> => {
  try {
    // Create new file document with sanitized filename
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileId = browserDb.generateId();
    
    const newFile: FileDocument = {
      _id: fileId,
      name: safeName,
      size: file.size,
      type: file.type,
      path: `/${safeName}`,
      ownerId: file.ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      shared: false,
      sharedWith: [],
      favorite: false,
      tags: file.tags || [],
    };
    
    // Get current files and add the new one
    const files = browserDb.getCollection<FileDocument>(collections.files);
    files.push(newFile);
    browserDb.saveCollection(collections.files, files);
    
    // Create initial version
    const newVersion: VersionDocument = {
      _id: browserDb.generateId(),
      fileId,
      versionNumber: 1,
      createdAt: new Date(),
      createdBy: file.ownerId,
      changes: "Initial upload",
      storagePath: `/${fileId}/1`,
    };
    
    // Save version
    const versions = browserDb.getCollection<VersionDocument>(collections.versions);
    versions.push(newVersion);
    browserDb.saveCollection(collections.versions, versions);
    
    return newFile;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getFilesByUserId = async (
  userId: string, 
  page = 1, 
  pageSize = DEFAULT_PAGE_SIZE,
  sortBy = 'updatedAt',
  sortOrder = -1
): Promise<{ files: FileDocument[], total: number }> => {
  try {
    const files = browserDb.getCollection<FileDocument>(collections.files);
    
    // Filter files owned by user or shared with user
    const userFiles = files.filter(file => 
      file.ownerId === userId || file.sharedWith.includes(userId)
    );
    
    // Sort files
    const sortedFiles = [...userFiles].sort((a, b) => {
      const aValue = a[sortBy as keyof FileDocument];
      const bValue = b[sortBy as keyof FileDocument];
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortOrder === -1 
          ? bValue.getTime() - aValue.getTime() 
          : aValue.getTime() - bValue.getTime();
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === -1 
          ? bValue.localeCompare(aValue) 
          : aValue.localeCompare(bValue);
      }
      
      return 0;
    });
    
    // Apply pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedFiles = sortedFiles.slice(start, end);
    
    return { files: paginatedFiles, total: userFiles.length };
  } catch (error) {
    console.error('Error getting files by user ID:', error);
    return { files: [], total: 0 };
  }
};

export const getFileById = async (fileId: string): Promise<FileDocument | null> => {
  try {
    const files = browserDb.getCollection<FileDocument>(collections.files);
    return files.find(file => file._id === fileId) || null;
  } catch (error) {
    console.error('Error getting file by ID:', error);
    return null;
  }
};

export const getFileVersions = async (fileId: string): Promise<VersionDocument[]> => {
  try {
    const versions = browserDb.getCollection<VersionDocument>(collections.versions);
    return versions
      .filter(version => version.fileId === fileId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  } catch (error) {
    console.error('Error getting file versions:', error);
    return [];
  }
};

export const addFileVersion = async (
  fileId: string, 
  ownerId: string, 
  content: ArrayBuffer | string,
  changes: string
): Promise<VersionDocument> => {
  try {
    const versions = browserDb.getCollection<VersionDocument>(collections.versions);
    
    // Get latest version number
    const fileVersions = versions.filter(v => v.fileId === fileId);
    const latestVersion = fileVersions.length > 0 
      ? Math.max(...fileVersions.map(v => v.versionNumber)) 
      : 0;
      
    const newVersionNumber = latestVersion + 1;
    
    // Create new version
    const newVersion: VersionDocument = {
      _id: browserDb.generateId(),
      fileId,
      versionNumber: newVersionNumber,
      createdAt: new Date(),
      createdBy: ownerId,
      changes,
      storagePath: `/${fileId}/${newVersionNumber}`,
    };
    
    // Add to versions collection
    versions.push(newVersion);
    browserDb.saveCollection(collections.versions, versions);
    
    // Update file's updatedAt
    const files = browserDb.getCollection<FileDocument>(collections.files);
    const fileIndex = files.findIndex(f => f._id === fileId);
    
    if (fileIndex !== -1) {
      files[fileIndex].updatedAt = new Date();
      browserDb.saveCollection(collections.files, files);
    }
    
    return newVersion;
  } catch (error) {
    console.error('Error adding file version:', error);
    throw error;
  }
};

export const toggleFileFavorite = async (fileId: string): Promise<FileDocument | null> => {
  try {
    const files = browserDb.getCollection<FileDocument>(collections.files);
    const fileIndex = files.findIndex(f => f._id === fileId);
    
    if (fileIndex === -1) {
      return null;
    }
    
    // Toggle favorite status
    const currentStatus = files[fileIndex].favorite;
    files[fileIndex].favorite = !currentStatus;
    
    // Save changes
    browserDb.saveCollection(collections.files, files);
    
    return files[fileIndex];
  } catch (error) {
    console.error('Error toggling file favorite:', error);
    return null;
  }
};

export const deleteFile = async (fileId: string): Promise<boolean> => {
  try {
    // Delete file
    const files = browserDb.getCollection<FileDocument>(collections.files);
    const newFiles = files.filter(f => f._id !== fileId);
    browserDb.saveCollection(collections.files, newFiles);
    
    // Delete versions
    const versions = browserDb.getCollection<VersionDocument>(collections.versions);
    const newVersions = versions.filter(v => v.fileId !== fileId);
    browserDb.saveCollection(collections.versions, newVersions);
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Bulk operations
export const bulkDeleteFiles = async (fileIds: string[]): Promise<number> => {
  try {
    // Delete files
    const files = browserDb.getCollection<FileDocument>(collections.files);
    const newFiles = files.filter(f => !fileIds.includes(f._id || ''));
    browserDb.saveCollection(collections.files, newFiles);
    
    // Delete versions
    const versions = browserDb.getCollection<VersionDocument>(collections.versions);
    const newVersions = versions.filter(v => !fileIds.includes(v.fileId));
    browserDb.saveCollection(collections.versions, newVersions);
    
    return files.length - newFiles.length;
  } catch (error) {
    console.error('Error bulk deleting files:', error);
    return 0;
  }
};

// Search files
export const searchFiles = async (
  userId: string,
  searchTerm: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<{ files: FileDocument[], total: number }> => {
  try {
    const files = browserDb.getCollection<FileDocument>(collections.files);
    const searchTermLower = searchTerm.toLowerCase();
    
    // Filter by user and search term
    const filteredFiles = files.filter(file => 
      (file.ownerId === userId || file.sharedWith.includes(userId)) &&
      (
        file.name.toLowerCase().includes(searchTermLower) ||
        file.type.toLowerCase().includes(searchTermLower) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
      )
    );
    
    // Apply pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedFiles = filteredFiles.slice(start, end);
    
    return { files: paginatedFiles, total: filteredFiles.length };
  } catch (error) {
    console.error('Error searching files:', error);
    return { files: [], total: 0 };
  }
};

// Initialize storage on module load
browserDb.initializeStorage();
