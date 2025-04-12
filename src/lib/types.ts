
// Define the document types for consistency across the application
export type UserDocument = {
  _id?: string;
  email: string;
  password: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FileDocument = {
  _id?: string;
  name: string;
  size: number;
  type: string;
  path: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  shared: boolean;
  sharedWith: string[];
  favorite: boolean;
  tags: string[];
  // Additional properties needed by components
  versions?: VersionDocument[];
  creator?: string;
  modified?: Date;
};

export type VersionDocument = {
  _id?: string;
  fileId: string;
  versionNumber: number;
  createdAt: Date;
  createdBy: string;
  changes: string;
  storagePath: string;
  // Additional properties needed by components
  date?: Date;
  author?: string;
  id?: string;
};

// Define collection names as constants
export const collections = {
  users: "users",
  files: "files",
  versions: "versions"
} as const;

// Export the collections type for type safety
export type CollectionKey = keyof typeof collections;
