
import { MongoClient, ServerApiVersion } from 'mongodb';

// Connection URI should come from environment variables
const uri = process.env.MONGODB_URI || "mongodb+srv://username:password@cluster0.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object
export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connection promise cache
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve connection across hot-reloads
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  clientPromise = client.connect();
}

// Database connection handler with connection pooling
export const connectDB = async () => {
  await clientPromise;
  return client.db("fileflow");
};

// Collection names as constants to avoid typos
export const collections = {
  users: "users",
  files: "files",
  versions: "versions"
};

// Document type definitions
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
