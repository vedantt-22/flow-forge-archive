
import React from 'react';
import { File } from 'lucide-react';

const EmptyFilePreview: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <File className="h-16 w-16 text-gray-300 mb-4" />
      <h2 className="text-xl font-semibold mb-2">No File Selected</h2>
      <p className="text-gray-500 max-w-md">
        Select a file from the list to view details, or upload a new file to get started.
      </p>
    </div>
  );
};

export default EmptyFilePreview;
