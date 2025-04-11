
import { connectDB, collections, FileDocument, VersionDocument } from './mongodb';

export const uploadFile = async (file: {
  name: string;
  size: number;
  type: string;
  content: ArrayBuffer | string; // File content
  ownerId: string;
  tags?: string[];
}): Promise<FileDocument> => {
  const db = await connectDB();
  const filesCollection = db.collection<FileDocument>(collections.files);
  const versionsCollection = db.collection<VersionDocument>(collections.versions);
  
  // Create new file document
  const newFile: FileDocument = {
    name: file.name,
    size: file.size,
    type: file.type,
    path: `/${file.name}`, // Simple path for now
    ownerId: file.ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
    shared: false,
    sharedWith: [],
    favorite: false,
    tags: file.tags || [],
  };
  
  // Insert file
  const result = await filesCollection.insertOne(newFile);
  const fileId = result.insertedId.toString();
  
  // Create initial version
  const newVersion: VersionDocument = {
    fileId,
    versionNumber: 1,
    createdAt: new Date(),
    createdBy: file.ownerId,
    changes: "Initial upload",
    storagePath: `/${fileId}/1`, // Simple path format: /fileId/versionNumber
  };
  
  // Store file content (in a production app, you'd use GridFS or external storage)
  // For this demo, we'll just assume the content is stored
  
  // Insert version
  await versionsCollection.insertOne(newVersion);
  
  return { ...newFile, _id: fileId };
};

export const getFilesByUserId = async (userId: string): Promise<FileDocument[]> => {
  const db = await connectDB();
  const filesCollection = db.collection<FileDocument>(collections.files);
  
  // Find files owned by user, or shared with user
  const files = await filesCollection.find({
    $or: [
      { ownerId: userId },
      { sharedWith: { $in: [userId] } }
    ]
  }).toArray();
  
  return files;
};

export const getFileById = async (fileId: string): Promise<FileDocument | null> => {
  const db = await connectDB();
  const filesCollection = db.collection<FileDocument>(collections.files);
  
  // Find file by string ID
  const file = await filesCollection.findOne({ _id: fileId });
  return file;
};

export const getFileVersions = async (fileId: string): Promise<VersionDocument[]> => {
  const db = await connectDB();
  const versionsCollection = db.collection<VersionDocument>(collections.versions);
  
  // Find versions for file
  const versions = await versionsCollection.find({ fileId }).sort({ versionNumber: -1 }).toArray();
  return versions;
};

export const addFileVersion = async (
  fileId: string, 
  ownerId: string, 
  content: ArrayBuffer | string,
  changes: string
): Promise<VersionDocument> => {
  const db = await connectDB();
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
    storagePath: `/${fileId}/${newVersionNumber}`, // Simple path format: /fileId/versionNumber
  };
  
  // Store file content (in a production app, you'd use GridFS or external storage)
  // For this demo, we'll just assume the content is stored
  
  // Insert version
  const result = await versionsCollection.insertOne(newVersion);
  
  // Update file's updatedAt
  await filesCollection.updateOne(
    { _id: fileId },
    { $set: { updatedAt: new Date() } }
  );
  
  return { ...newVersion, _id: result.insertedId.toString() };
};

export const toggleFileFavorite = async (fileId: string): Promise<FileDocument | null> => {
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
  const db = await connectDB();
  const filesCollection = db.collection<FileDocument>(collections.files);
  const versionsCollection = db.collection<VersionDocument>(collections.versions);
  
  // Delete file
  const result = await filesCollection.deleteOne({ _id: fileId });
  
  // Delete all versions
  await versionsCollection.deleteMany({ fileId });
  
  return result.deletedCount === 1;
};
