import {User} from "../types/user";
import { Campaign } from "../types/campaign";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates user data for creation and updates
 */
export const validateUserData = (data: Partial<User>): ValidationResult => {
  // Email validation
  if (data.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {isValid: false, error: "Invalid email format"};
    }
  }

  // Display name validation
  if (data.displayName !== undefined) {
    if (data.displayName.trim().length < 2) {
      return {isValid: false, error: "Display name must be at least 2 characters"};
    }
    if (data.displayName.length > 50) {
      return {isValid: false, error: "Display name must be less than 50 characters"};
    }
  }

  // Subscription tier validation
  if (data.subscriptionTier !== undefined) {
    const validTiers = ["free", "basic", "pro"];
    if (!validTiers.includes(data.subscriptionTier)) {
      return {isValid: false, error: "Invalid subscription tier"};
    }
  }

  // Subscription status validation
  if (data.subscriptionStatus !== undefined) {
    const validStatuses = ["active", "canceled", "past_due"];
    if (!validStatuses.includes(data.subscriptionStatus)) {
      return {isValid: false, error: "Invalid subscription status"};
    }
  }

  return {isValid: true};
};

/**
 * Validates campaign data for creation and updates
 */
export const validateCampaignData = (data: Partial<Campaign>): ValidationResult => {
  if (data.title !== undefined) {
    if (data.title.trim().length < 3) {
      return { isValid: false, error: "Campaign title must be at least 3 characters" };
    }
    if (data.title.length > 100) {
      return { isValid: false, error: "Campaign title must be less than 100 characters" };
    }
  }

  if (data.description !== undefined) {
    if (data.description.trim().length < 10) {
      return { isValid: false, error: "Campaign description must be at least 10 characters" };
    }
    if (data.description.length > 500) {
      return { isValid: false, error: "Campaign description must be less than 500 characters" };
    }
  }

  if (data.maxClaims !== undefined) {
    if (typeof data.maxClaims !== "number" || data.maxClaims <= 0) {
      return { isValid: false, error: "Max claims must be a positive number" };
    }
  }

  if (data.status !== undefined) {
    const validStatuses = ["active", "inactive", "completed"];
    if (!validStatuses.includes(data.status)) {
      return { isValid: false, error: "Invalid campaign status" };
    }
  }

  return { isValid: true };
};

/**
 * Sanitizes user data for API responses (removes sensitive fields)
 */
export const sanitizeUserForResponse = (user: User): Omit<User, "stripeCustomerId"> => {
  const {stripeCustomerId, ...sanitizedUser} = user;
  return sanitizedUser;
};

/**
 * Validates if a string is a valid Firebase UID
 */
export const isValidFirebaseUID = (uid: string): boolean => {
  // Firebase UIDs are typically 28 characters long and alphanumeric
  const uidRegex = /^[a-zA-Z0-9]{20,}$/;
  return uidRegex.test(uid);
};
