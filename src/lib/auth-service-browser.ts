
import { browserDb } from './browser-storage';
import { UserDocument, collections, CollectionKey } from './types';
import bcryptjs from 'bcryptjs';

// Simple token expiry time in milliseconds (7 days)
const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

// Cache for user data to reduce storage queries
const userCache = new Map<string, {user: UserDocument, expiry: number}>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Simple browser-compatible JWT alternative
const createToken = (payload: any): string => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const now = Date.now();
  const expiresAt = now + TOKEN_EXPIRY;
  
  const tokenPayload = {
    ...payload,
    iat: Math.floor(now / 1000),
    exp: Math.floor(expiresAt / 1000)
  };

  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(tokenPayload));
  
  // We're using a simplified approach here without actual signing
  // In production, you would use Web Crypto API for proper signing
  const signature = btoa(JSON.stringify({ 
    header: base64Header, 
    payload: base64Payload, 
    secret: "your_jwt_secret_key" 
  }));
  
  return `${base64Header}.${base64Payload}.${signature}`;
};

const verifyToken = (token: string): any => {
  try {
    const [headerBase64, payloadBase64] = token.split('.');
    
    if (!headerBase64 || !payloadBase64) {
      throw new Error('Invalid token format');
    }
    
    const payload = JSON.parse(atob(payloadBase64));
    
    // Check if token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      throw new Error('Token expired');
    }
    
    return payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const registerUser = async (email: string, password: string, fullName: string): Promise<UserDocument> => {
  // Get current users
  const users = browserDb.getCollection<UserDocument>('users' as CollectionKey);
  
  // Check if user exists with case-insensitive email comparison
  const existingUser = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase()
  );
  
  if (existingUser) {
    throw new Error("User already exists");
  }
  
  // Hash password
  const hashedPassword = await bcryptjs.hash(password, 12);
  
  const newUser: UserDocument = {
    _id: browserDb.generateId(),
    email: email.toLowerCase(), // Store emails in lowercase for consistency
    password: hashedPassword,
    fullName,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Add user to collection
  users.push(newUser);
  browserDb.saveCollection('users' as CollectionKey, users);
  
  // Return user (without password)
  const userWithoutPassword = { ...newUser };
  delete userWithoutPassword.password;
  
  return userWithoutPassword;
};

export const loginUser = async (email: string, password: string): Promise<{ user: UserDocument, token: string }> => {
  // Get users
  const users = browserDb.getCollection<UserDocument>('users' as CollectionKey);
  
  // Find user with case-insensitive search
  const user = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase()
  );
  
  if (!user) {
    throw new Error("Invalid email or password");
  }
  
  // Check password
  const isPasswordValid = await bcryptjs.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }
  
  // Create token with appropriate claims
  const token = createToken({ 
    userId: user._id, 
    email: user.email,
    fullName: user.fullName
  });
  
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
  
  // If not in cache or expired, fetch from storage
  const users = browserDb.getCollection<UserDocument>('users' as CollectionKey);
  
  // Find user
  const user = users.find(u => u._id === id);
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

// Export verifyToken to be used in other parts of the app
export { verifyToken };

// Clear expired entries from cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of userCache.entries()) {
    if (value.expiry < now) {
      userCache.delete(key);
    }
  }
}, CACHE_TTL);
