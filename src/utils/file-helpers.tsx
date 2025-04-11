
/**
 * Utility functions for file-related operations
 */

/**
 * Get appropriate icon based on file type
 */
import { File, FileText, Image, FileArchive } from 'lucide-react';
import React from 'react';

export const getFileIcon = (fileType: string) => {
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

/**
 * Format file size to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  else return (bytes / 1073741824).toFixed(2) + ' GB';
};

/**
 * Format date to readable format
 */
export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
