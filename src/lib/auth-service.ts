
import { connectDB, collections, UserDocument } from './mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// This should be in an environment variable
const JWT_SECRET = "your_jwt_secret_key";

export const registerUser = async (email: string, password: string, fullName: string): Promise<UserDocument> => {
  const db = await connectDB();
  const usersCollection = db.collection<UserDocument>(collections.users);
  
  // Check if user exists
  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser: UserDocument = {
    email,
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
  
  // Find user
  const user = await usersCollection.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }
  
  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }
  
  // Create token
  const token = jwt.sign(
    { userId: user._id, email: user.email }, 
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // Return user (without password) and token
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;
  
  return { user: userWithoutPassword, token };
};

export const getUserById = async (id: string): Promise<UserDocument | null> => {
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
