
// Mock database using localStorage for client-side storage
import { FileDocument, VersionDocument, UserDocument, collections } from './types';

// Generate a random ID to mimic MongoDB ObjectId
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Collection type for our storage
type Collections = {
  users: UserDocument[];
  files: FileDocument[];
  versions: VersionDocument[];
};

// Initialize storage
const initializeStorage = (): Collections => {
  try {
    const existingData = localStorage.getItem('fileflow-data');
    
    if (existingData) {
      return JSON.parse(existingData);
    }
    
    // Create empty collections
    const initialData: Collections = {
      users: [],
      files: [],
      versions: []
    };
    
    localStorage.setItem('fileflow-data', JSON.stringify(initialData));
    return initialData;
  } catch (error) {
    console.error('Error initializing storage', error);
    // Return empty collections if localStorage fails
    return { users: [], files: [], versions: [] };
  }
};

// Get collection data
const getCollection = <T>(collectionName: keyof Collections): T[] => {
  try {
    const data = localStorage.getItem('fileflow-data');
    if (!data) {
      return [];
    }
    
    const parsedData = JSON.parse(data) as Collections;
    return parsedData[collectionName] as unknown as T[];
  } catch (error) {
    console.error(`Error getting collection ${collectionName}`, error);
    return [];
  }
};

// Save collection data
const saveCollection = <T>(collectionName: keyof Collections, items: T[]): void => {
  try {
    const data = localStorage.getItem('fileflow-data');
    if (!data) {
      const newData: Partial<Collections> = {};
      newData[collectionName] = items as any;
      localStorage.setItem('fileflow-data', JSON.stringify(newData));
      return;
    }
    
    const parsedData = JSON.parse(data) as Collections;
    parsedData[collectionName] = items as any;
    localStorage.setItem('fileflow-data', JSON.stringify(parsedData));
  } catch (error) {
    console.error(`Error saving collection ${collectionName}`, error);
  }
};

export const browserDb = {
  generateId,
  initializeStorage,
  getCollection,
  saveCollection,
};
