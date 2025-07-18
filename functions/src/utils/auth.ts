import {User} from "../types/user";

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
