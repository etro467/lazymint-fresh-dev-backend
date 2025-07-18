import {CampaignCreateRequest, CampaignUpdateRequest} from "../types/campaign/index";
import {ClaimRequest} from "../types/claim";
import {validateUserData} from "../utils/auth"; // Import existing validation

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates campaign creation data
 */
export const validateCampaignData = (data: CampaignCreateRequest | CampaignUpdateRequest): ValidationResult => {
  // Title validation
  if (data.title !== undefined) {
    if (!data.title || data.title.trim().length < 3) {
      return {isValid: false, error: "Campaign title must be at least 3 characters"};
    }
    if (data.title.length > 100) {
      return {isValid: false, error: "Campaign title must be less than 100 characters"};
    }
  }

  // Description validation
  if (data.description !== undefined) {
    if (!data.description || data.description.trim().length < 10) {
      return {isValid: false, error: "Campaign description must be at least 10 characters"};
    }
    if (data.description.length > 1000) {
      return {isValid: false, error: "Campaign description must be less than 1000 characters"};
    }
  }

  // Max claims validation
  if (data.maxClaims !== undefined) {
    if (data.maxClaims < 1) {
      return {isValid: false, error: "Max claims must be at least 1"};
    }
    if (data.maxClaims > 10000) {
      return {isValid: false, error: "Max claims cannot exceed 10,000"};
    }
  }

  // URL validation (if provided)
  if (data.logoUrl && !isValidUrl(data.logoUrl)) {
    return {isValid: false, error: "Invalid logo URL format"};
  }
  if (data.ticketBackgroundUrl && !isValidUrl(data.ticketBackgroundUrl)) {
    return {isValid: false, error: "Invalid ticket background URL format"};
  }

  return {isValid: true};
};

/**
 * Validates claim request data
 */
export const validateClaimData = (data: ClaimRequest): ValidationResult => {
  // Campaign ID validation
  if (!data.campaignId || data.campaignId.trim().length === 0) {
    return {isValid: false, error: "Campaign ID is required"};
  }

  // Email validation (reuse existing pattern from auth.ts)
  const emailValidation = validateUserData({email: data.email, displayName: "temp"});
  if (!emailValidation.isValid) {
    return {isValid: false, error: "Invalid email format"};
  }

  return {isValid: true};
};

/**
 * Helper function to validate URLs
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates Firebase document ID format
 */
export const isValidDocumentId = (id: string): boolean => {
  // Firebase document IDs must be non-empty and not contain certain characters
  const invalidChars = /[\/\x00-\x1f\x7f]/;
  return id.length > 0 && id.length <= 1500 && !invalidChars.test(id);
};
