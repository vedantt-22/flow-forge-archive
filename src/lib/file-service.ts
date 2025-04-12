
import { connectDB, collections, FileDocument, VersionDocument } from './mongodb';
import { ObjectId, MongoClient } from 'mongodb';

// Get MongoDB client for transactions
let client: MongoClient;
// Initialize the client
(async () => {
  const { client: mongoClient } = await import('./mongodb');
  client = mongoClient;
})();

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
  const db = await connectDB();
  const session = client.startSession();
  
  try {
    // Use transactions for data integrity
    await session.withTransaction(async () => {
      const filesCollection = db.collection<FileDocument>(collections.files);
      const versionsCollection = db.collection<VersionDocument>(collections.versions);
      
      // Create new file document with sanitized filename
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const newFile: FileDocument = {
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
      
      // Insert file
      const result = await filesCollection.insertOne(newFile, { session });
      const fileId = result.insertedId.toString();
      
      // Create initial version
      const newVersion: VersionDocument = {
        fileId,
        versionNumber: 1,
        createdAt: new Date(),
        createdBy: file.ownerId,
        changes: "Initial upload",
        storagePath: `/${fileId}/1`,
      };
      
      // Insert version
      await versionsCollection.insertOne(newVersion, { session });
      
      // Return the new file with its ID
      return { ...newFile, _id: fileId };
    });
  } finally {
    await session.endSession();
  }
};

export const getFilesByUserId = async (
  userId: string, 
  page = 1, 
  pageSize = DEFAULT_PAGE_SIZE,
  sortBy = 'updatedAt',
  sortOrder = -1
): Promise<{ files: FileDocument[], total: number }> => {
  const db = await connectDB();
  const filesCollection = db.collection<FileDocument>(collections.files);
  
  // Query for files owned by user or shared with user
  const query = {
    $or: [
      { ownerId: userId },
      { sharedWith: { $in: [userId] } }
    ]
  };
  
  // Count total documents for pagination info
  const total = await filesCollection.countDocuments(query);
  
  // Get paginated results
  const files = await filesCollection.find(query)
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();
  
  return { files, total };
};

export const getFileById = async (fileId: string): Promise<FileDocument | null> => {
  if (!ObjectId.isValid(fileId)) {
    return null;
  }
  
  const db = await connectDB();
  const filesCollection = db.collection<FileDocument>(collections.files);
  
  // Find file by ID
  return await filesCollection.findOne({ _id: fileId });
};

export const getFileVersions = async (fileId: string): Promise<VersionDocument[]> => {
  if (!ObjectId.isValid(fileId)) {
    return [];
  }
  
  const db = await connectDB();
  const versionsCollection = db.collection<VersionDocument>(collections.versions);
  
  // Find versions for file
  return await versionsCollection.find({ fileId })
    .sort({ versionNumber: -1 })
    .toArray();
};

export const addFileVersion = async (
  fileId: string, 
  ownerId: string, 
  content: ArrayBuffer | string,
  changes: string
): Promise<VersionDocument> => {
  const db = await connectDB();
  const session = client.startSession();
  
  try {
    return await session.withTransaction(async () => {
      const filesCollection = db.collection<FileDocument>(collections.files);
      const versionsCollection = db.collection<VersionDocument>(collections.versions);
      
      // Get latest version number
      const latestVersion = await versionsCollection.findOne(
        { fileId },
        { sort: { versionNumber: -1 } }
      );
      
      const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
      
      // Create new version
      const newVersion: VersionDocument = {
        fileId,
        versionNumber: newVersionNumber,
        createdAt: new Date(),
        createdBy: ownerId,
        changes,
        storagePath: `/${fileId}/${newVersionNumber}`,
      };
      
      // Insert version
      const result = await versionsCollection.insertOne(newVersion, { session });
      
      // Update file's updatedAt
      await filesCollection.updateOne(
        { _id: fileId },
        { $set: { updatedAt: new Date() } },
        { session }
      );
      
      return { ...newVersion, _id: result.insertedId.toString() };
    });
  } finally {
    await session.endSession();
  }
};

export const toggleFileFavorite = async (fileId: string): Promise<FileDocument | null> => {
  if (!ObjectId.isValid(fileId)) {
    return null;
  }
  
  const db = await connectDB();
  const filesCollection = db.collection<FileDocument>(collections.files);
  
  // Get current file
  const file = await filesCollection.findOne({ _id: fileId });
  if (!file) return null;
  
  // Toggle favorite
  const newFavoriteStatus = !file.favorite;
  
  // Update file
  await filesCollection.updateOne(
    { _id: fileId },
    { $set: { favorite: newFavoriteStatus } }
  );
  
  return { ...file, favorite: newFavoriteStatus };
};

export const deleteFile = async (fileId: string): Promise<boolean> => {
  if (!ObjectId.isValid(fileId)) {
    return false;
  }
  
  const db = await connectDB();
  const session = client.startSession();
  
  try {
    return await session.withTransaction(async () => {
      const filesCollection = db.collection<FileDocument>(collections.files);
      const versionsCollection = db.collection<VersionDocument>(collections.versions);
      
      // Delete file and all versions atomically
      const fileResult = await filesCollection.deleteOne({ _id: fileId }, { session });
      await versionsCollection.deleteMany({ fileId }, { session });
      
      return fileResult.deletedCount === 1;
    });
  } finally {
    await session.endSession();
  }
};

// Bulk operations for better performance
export const bulkDeleteFiles = async (fileIds: string[]): Promise<number> => {
  const db = await connectDB();
  const session = client.startSession();
  
  try {
    return await session.withTransaction(async () => {
      const filesCollection = db.collection<FileDocument>(collections.files);
      const versionsCollection = db.collection<VersionDocument>(collections.versions);
      
      const validIds = fileIds.filter(id => ObjectId.isValid(id));
      
      // Delete files and their versions in bulk
      const fileResult = await filesCollection.deleteMany(
        { _id: { $in: validIds } },
        { session }
      );
      
      await versionsCollection.deleteMany(
        { fileId: { $in: validIds } },
        { session }
      );
      
      return fileResult.deletedCount;
    });
  } finally {
    await session.endSession();
  }
};

// Search files by name, type or tags
export const searchFiles = async (
  userId: string,
  searchTerm: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<{ files: FileDocument[], total: number }> => {
  const db = await connectDB();
  const filesCollection = db.collection<FileDocument>(collections.files);
  
  // Create search query
  const query = {
    $and: [
      {
        $or: [
          { ownerId: userId },
          { sharedWith: { $in: [userId] } }
        ]
      },
      {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { type: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      }
    ]
  };
  
  // Count total for pagination
  const total = await filesCollection.countDocuments(query);
  
  // Get paginated results
  const files = await filesCollection.find(query)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();
  
  return { files, total };
};
