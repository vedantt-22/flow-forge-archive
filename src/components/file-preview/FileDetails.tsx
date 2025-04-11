
import React from 'react';
import { formatFileSize, formatDate } from '@/utils/file-helpers';
import { User, Calendar } from 'lucide-react';
import { FileType } from '@/context/FileContext';

interface FileDetailsProps {
  file: FileType;
}

const FileDetails: React.FC<FileDetailsProps> = ({ file }) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">File Information</h3>
        <div className="space-y-3">
          <div className="flex">
            <div className="w-1/3 text-sm text-gray-500">Type</div>
            <div className="w-2/3 text-sm">{file.type.split('/').pop()?.toUpperCase()}</div>
          </div>
          <div className="flex">
            <div className="w-1/3 text-sm text-gray-500">Size</div>
            <div className="w-2/3 text-sm">{formatFileSize(file.size)}</div>
          </div>
          <div className="flex">
            <div className="w-1/3 text-sm text-gray-500">Created By</div>
            <div className="w-2/3 text-sm flex items-center">
              <User className="h-4 w-4 mr-1 text-gray-400" />
              {file.creator}
            </div>
          </div>
          <div className="flex">
            <div className="w-1/3 text-sm text-gray-500">Modified</div>
            <div className="w-2/3 text-sm flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
              {formatDate(file.modified)}
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
              {file.shared ? (
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
          {file.tags.length > 0 ? (
            file.tags.map(tag => (
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
  );
};

export default FileDetails;
