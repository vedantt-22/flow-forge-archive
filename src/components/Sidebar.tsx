
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { 
  Folder, 
  FolderOpen, 
  Star, 
  Upload, 
  Share, 
  Archive, 
  Trash, 
  ChevronLeft, 
  PlusCircle,
  Lock
} from 'lucide-react';

const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: number;
}> = ({ icon, label, active, onClick, badge }) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "flex items-center justify-start w-full py-2 px-3 mb-1 text-left",
        active 
          ? "bg-fileflow-50 text-fileflow-700 dark:bg-fileflow-900/20 dark:text-fileflow-400"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
    >
      <div className="mr-3 text-gray-500">{icon}</div>
      <span className="flex-grow text-sm font-medium">{label}</span>
      {badge && (
        <div className="bg-fileflow-100 text-fileflow-600 dark:bg-fileflow-900/30 dark:text-fileflow-300 text-xs font-medium rounded-full px-2 py-0.5">
          {badge}
        </div>
      )}
    </Button>
  );
};

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('my-files');

  return (
    <div 
      className={cn(
        "h-screen flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && <h2 className="font-semibold">Files</h2>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {!collapsed && (
            <Button 
              variant="default" 
              className="w-full justify-start mb-4 bg-fileflow-600 hover:bg-fileflow-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Upload
            </Button>
          )}
          {collapsed && (
            <Button 
              variant="default" 
              size="icon" 
              className="w-full mb-4 bg-fileflow-600 hover:bg-fileflow-700"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          )}

          <SidebarItem
            icon={collapsed ? <Folder className="h-5 w-5" /> : <FolderOpen className="h-5 w-5" />}
            label="My Files"
            active={activeItem === 'my-files'}
            onClick={() => setActiveItem('my-files')}
            badge={12}
          />
          <SidebarItem
            icon={<Star className="h-5 w-5" />}
            label="Favorites"
            active={activeItem === 'favorites'}
            onClick={() => setActiveItem('favorites')}
            badge={3}
          />
          <SidebarItem
            icon={<Share className="h-5 w-5" />}
            label="Shared"
            active={activeItem === 'shared'}
            onClick={() => setActiveItem('shared')}
            badge={5}
          />
          <SidebarItem
            icon={<Lock className="h-5 w-5" />}
            label="Encrypted"
            active={activeItem === 'encrypted'}
            onClick={() => setActiveItem('encrypted')}
            badge={8}
          />
          <SidebarItem
            icon={<Upload className="h-5 w-5" />}
            label="Uploads"
            active={activeItem === 'uploads'}
            onClick={() => setActiveItem('uploads')}
          />
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <SidebarItem
            icon={<Archive className="h-5 w-5" />}
            label="Archive"
            active={activeItem === 'archive'}
            onClick={() => setActiveItem('archive')}
          />
          <SidebarItem
            icon={<Trash className="h-5 w-5" />}
            label="Trash"
            active={activeItem === 'trash'}
            onClick={() => setActiveItem('trash')}
          />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="bg-fileflow-100 dark:bg-fileflow-900/30 rounded-md p-2">
            <Lock className="h-5 w-5 text-fileflow-600 dark:text-fileflow-400" />
          </div>
          {!collapsed && (
            <div className="ml-3">
              <div className="text-sm font-medium">Files Protected</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">End-to-end encryption</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
