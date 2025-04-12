
import React from 'react';
import { VersionDocument } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Download, FileText } from 'lucide-react';

interface VersionHistoryProps {
  versions: VersionDocument[];
  fileName: string;
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const VersionHistory: React.FC<VersionHistoryProps> = ({ versions, fileName }) => {
  // Sort versions by number in descending order
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Version History</h3>
        <span className="text-sm text-gray-500">
          {versions.length} {versions.length === 1 ? 'version' : 'versions'}
        </span>
      </div>
      
      <div className="space-y-4">
        {sortedVersions.map((version, index) => (
          <div 
            key={version._id} 
            className={`
              relative flex items-start p-4 rounded-lg border
              ${index === 0 ? 'bg-fileflow-50 border-fileflow-200 dark:bg-fileflow-900/10 dark:border-fileflow-800/30' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}
            `}
          >
            {/* Version indicator line */}
            {index !== sortedVersions.length - 1 && (
              <div className="absolute left-8 top-14 w-0.5 bg-gray-200 dark:bg-gray-700" style={{ height: 'calc(100% + 1rem)' }}></div>
            )}
            
            <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-fileflow-100 text-fileflow-600 dark:bg-fileflow-900/30 dark:text-fileflow-400 mr-4">
              <span className="text-xs font-medium">v{version.versionNumber}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-medium">
                    {index === 0 ? 'Current Version' : `Version ${version.versionNumber}`}
                  </h4>
                  <div className="mt-1 text-xs text-gray-500">
                    {formatDate(version.date || version.createdAt)} by {version.author || version.createdBy}
                  </div>
                </div>
                
                <div className="mt-2 sm:mt-0 flex">
                  {index === 0 && (
                    <div className="mr-2 bg-fileflow-100 text-fileflow-600 dark:bg-fileflow-900/30 dark:text-fileflow-400 text-xs px-2 py-1 rounded-full">
                      Latest
                    </div>
                  )}
                  
                  <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                    <FileText className="mr-1 h-3 w-3" />
                    View
                  </Button>
                  
                  <Button variant="outline" size="sm" className="ml-2 text-xs h-7 px-2">
                    <Download className="mr-1 h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
              
              <div className="mt-2 text-sm">
                <span className="text-gray-700 dark:text-gray-300">{version.changes}</span>
              </div>
              
              {index === 0 && (
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"></path><circle cx="17" cy="7" r="5"></circle></svg>
                  File: {fileName}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {versions.length > 3 && (
        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" className="text-fileflow-600 hover:text-fileflow-700 hover:bg-fileflow-50">
            Show all versions
          </Button>
        </div>
      )}
    </div>
  );
};

export default VersionHistory;
