
import React from 'react';
import { Search, User, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Navbar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <div className="text-xl font-bold text-fileflow-800 dark:text-fileflow-400">
          <span className="text-fileflow-600">File</span>
          <span>Flow</span>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search files..."
            className="w-full pl-8 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-fileflow-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="relative rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-fileflow-500 rounded-full"></span>
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
