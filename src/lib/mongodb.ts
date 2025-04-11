
import { MongoClient, ServerApiVersion } from 'mongodb';

// Replace with your MongoDB connection string
// This should ideally be in an environment variable
const uri = "mongodb+srv://username:password@cluster0.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = client.connect();
}

export const connectDB = async () => {
  await clientPromise;
  return client.db("fileflow");
};

export const collections = {
  users: "users",
  files: "files",
  versions: "versions"
};

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
};

export type VersionDocument = {
  _id?: string;
  fileId: string;
  versionNumber: number;
  createdAt: Date;
  createdBy: string;
  changes: string;
  storagePath: string;
};
