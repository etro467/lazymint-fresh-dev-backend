import {Request, Response, NextFunction} from "express";
import * as admin from "firebase-admin";
import {sendAuthError, sendPermissionError} from "./errors";

// Extend Express Request to include user info
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    emailVerified?: boolean;
  };
  file?: Express.Multer.File; // Add file property for multer
}

/**
 * Authentication middleware that follows existing auth patterns
 */
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract authorization header (following existing pattern)
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      sendAuthError(res, 'Missing or invalid authorization header');
      return;
    }

    // Verify Firebase ID token
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add user info to request (following existing pattern)
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    sendAuthError(res, 'Invalid authentication token');
  }
};

/**
 * Optional authentication middleware (allows unauthenticated requests)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      };
    }
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

/**
 * Resource ownership validation
 */
export const validateOwnership = (resourceUserIdField: string = 'creatorId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendAuthError(res);
      return;
    }

    // This will be used in handlers to check if user owns the resource
    // Implementation depends on the specific resource being accessed
    next();
  };
};
