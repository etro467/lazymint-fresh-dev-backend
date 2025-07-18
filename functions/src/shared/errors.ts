import {Response} from "express";

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}

/**
 * Standardized error response handler (extends existing pattern from userHandlers.ts)
 */
export const sendErrorResponse = (res: Response, error: any, statusCode?: number): void => {
  console.error('Function error:', error);
  
  // Handle specific Firebase errors (following existing pattern)
  if (error instanceof Error) {
    if (error.message.includes('email-already-exists')) {
      res.status(409).send({error: 'Email already exists', code: 'EMAIL_EXISTS'});
      return;
    }
    if (error.message.includes('user-not-found')) {
      res.status(404).send({error: 'User not found', code: 'USER_NOT_FOUND'});
      return;
    }
    if (error.message.includes('permission-denied')) {
      res.status(403).send({error: 'Permission denied', code: 'PERMISSION_DENIED'});
      return;
    }
    if (error.message.includes('not-found')) {
      res.status(404).send({error: 'Resource not found', code: 'NOT_FOUND'});
      return;
    }
    if (error.message.includes('Campaign not found')) {
      res.status(404).send({error: "Campaign not found", code: "CAMPAIGN_NOT_FOUND"});
      return;
    }
    if (error.message.includes('Campaign is not active')) {
      res.status(400).send({error: "Campaign is not active", code: "CAMPAIGN_NOT_ACTIVE"});
      return;
    }
    if (error.message.includes('Campaign has reached maximum claims')) {
      res.status(400).send({error: "Campaign has reached maximum claims", code: "MAX_CLAIMS_REACHED"});
      return;
    }
    if (error.message.includes('Email has already claimed this campaign')) {
      res.status(409).send({error: "Email has already claimed this campaign", code: "ALREADY_CLAIMED"});
      return;
    }
    if (error.message.includes('Claim not found')) {
      res.status(404).send({error: "Claim not found", code: "CLAIM_NOT_FOUND"});
      return;
    }
    if (error.message.includes('Invalid verification token')) {
      res.status(400).send({error: "Invalid verification token", code: "INVALID_VERIFICATION_TOKEN"});
      return;
    }
    if (error.message.includes('Claim already verified')) {
      res.status(400).send({error: "Claim has already been verified", code: "ALREADY_VERIFIED"});
      return;
    }
    if (error.message.includes('Verification token expired')) {
      res.status(400).send({error: "Verification token has expired", code: "TOKEN_EXPIRED"});
      return;
    }
    if (error.message.includes('Claim not completed')) {
      res.status(400).send({error: "Claim verification not completed", code: "CLAIM_NOT_COMPLETED"});
      return;
    }
    if (error.message.includes('Ticket not available')) {
      res.status(400).send({error: "Ticket not yet generated", code: "TICKET_NOT_AVAILABLE"});
      return;
    }
    if (error.message.includes('No file uploaded')) {
      res.status(400).send({error: "No file uploaded", code: "NO_FILE_UPLOADED"});
      return;
    }
    if (error.message.includes('File must be an image')) {
      res.status(400).send({error: "File must be an image", code: "INVALID_FILE_TYPE"});
      return;
    }
  }

  // Default error response (following existing pattern)
  const status = statusCode || 500;
  res.status(status).send({
    error: statusCode === 500 ? 'Something went wrong' : error.message || 'An error occurred',
    code: 'INTERNAL_ERROR'
  });
};

/**
 * Validation error response
 */
export const sendValidationError = (res: Response, message: string): void => {
  res.status(400).send({error: message, code: 'VALIDATION_ERROR'});
};

/**
 * Authentication error response
 */
export const sendAuthError = (res: Response, message: string = 'Authentication required'): void => {
  res.status(401).send({error: message, code: 'AUTH_REQUIRED'});
};

/**
 * Permission error response
 */
export const sendPermissionError = (res: Response, message: string = 'Permission denied'): void => {
  res.status(403).send({error: message, code: 'PERMISSION_DENIED'});
};
