
import { connectDB, collections, UserDocument } from './mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// This should be in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const JWT_EXPIRY = '7d';

// Cache for user data to reduce database queries
const userCache = new Map<string, {user: UserDocument, expiry: number}>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export const registerUser = async (email: string, password: string, fullName: string): Promise<UserDocument> => {
  const db = await connectDB();
  const usersCollection = db.collection<UserDocument>(collections.users);
  
  // Check if user exists with case-insensitive email comparison
  const existingUser = await usersCollection.findOne({ 
    email: { $regex: new RegExp(`^${email}$`, 'i') } 
  });
  
  if (existingUser) {
    throw new Error("User already exists");
  }
  
  // Hash password with optimal work factor
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const newUser: UserDocument = {
    email: email.toLowerCase(), // Store emails in lowercase for consistency
    password: hashedPassword,
    fullName,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Insert user
  const result = await usersCollection.insertOne(newUser);
  
  // Return user (without password)
  const createdUser = { ...newUser, _id: result.insertedId.toString() };
  delete createdUser.password;
  
  return createdUser;
};

export const loginUser = async (email: string, password: string): Promise<{ user: UserDocument, token: string }> => {
  const db = await connectDB();
  const usersCollection = db.collection<UserDocument>(collections.users);
  
  // Find user with case-insensitive search
  const user = await usersCollection.findOne({ 
    email: { $regex: new RegExp(`^${email}$`, 'i') } 
  });
  
  if (!user) {
    throw new Error("Invalid email or password");
  }
  
  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }
  
  // Create token with appropriate claims
  const token = jwt.sign(
    { 
      userId: user._id, 
      email: user.email,
      fullName: user.fullName
    }, 
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
  
  // Return user (without password) and token
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;
  
  // Cache the user
  if (user._id) {
    userCache.set(user._id.toString(), {
      user: userWithoutPassword,
      expiry: Date.now() + CACHE_TTL
    });
  }
  
  return { user: userWithoutPassword, token };
};

export const getUserById = async (id: string): Promise<UserDocument | null> => {
  // Check cache first
  const cachedUser = userCache.get(id);
  if (cachedUser && cachedUser.expiry > Date.now()) {
    return cachedUser.user;
  }
  
  // If not in cache or expired, fetch from DB
  const db = await connectDB();
  const usersCollection = db.collection<UserDocument>(collections.users);
  
  // Find user
  const user = await usersCollection.findOne({ _id: id });
  if (!user) {
    return null;
  }
  
  // Return user (without password)
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;
  
  // Update cache
  userCache.set(id, {
    user: userWithoutPassword,
    expiry: Date.now() + CACHE_TTL
  });
  
  return userWithoutPassword;
};

export const verifyToken = (token: string): { userId: string, email: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, email: string };
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Clear expired entries from cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of userCache.entries()) {
    if (value.expiry < now) {
      userCache.delete(key);
    }
  }
}, CACHE_TTL);
