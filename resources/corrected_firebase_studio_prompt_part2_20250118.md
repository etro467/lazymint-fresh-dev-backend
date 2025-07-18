# Corrected Firebase Studio Prompt for LazyMint Backend - Part 2
## Project Structure Extension and Shared Utilities

**Continuation from Part 1** - Assumes Phase 0 and Phase 1 validations have passed.

---

### **Phase 2: Project Structure Extension**

**CRITICAL**: Extend existing project structure without disrupting current organization.

#### **2.1 Extend Existing Directory Structure**

**Action:** Add new directories to existing `functions/src` structure (preserve existing):

```bash
# Navigate to functions source
cd functions/src

# Verify existing structure is intact
ls -la  # Should show: handlers/, types/, utils/, config/, index.ts

# Create additional directories for new features
mkdir -p shared
mkdir -p functions
mkdir -p types/campaign
mkdir -p types/claim

# Verify extended structure
tree src/  # Should show existing + new directories
```

**Final Structure Should Be:**
```
src/
├── handlers/           # EXISTING - userHandlers.ts
├── utils/             # EXISTING - auth.ts
├── config/            # EXISTING - environment.ts (if exists)
├── types/             # EXISTING - user.ts
│   ├── campaign/      # NEW - campaign-related types
│   └── claim/         # NEW - claim-related types
├── shared/            # NEW - shared utilities
├── functions/         # NEW - new feature functions
└── index.ts           # EXISTING - main entry point
```

#### **2.2 Create Extended Type Definitions**

**Action:** Create new type definitions that integrate with existing User types:

**File: `src/types/campaign/index.ts`**
```typescript
import {Timestamp} from "firebase-admin/firestore";
import {User} from "../user"; // Import existing User type

export interface Campaign {
  id: string;
  creatorId: string; // References User.uid
  title: string;
  description: string;
  logoUrl?: string;
  ticketBackgroundUrl?: string;
  qrCodeUrl?: string;
  maxClaims: number;
  currentClaims: number;
  status: CampaignStatus;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "archived";

export interface CampaignCreateRequest {
  title: string;
  description: string;
  maxClaims: number;
  isPublic: boolean;
  logoUrl?: string;
  ticketBackgroundUrl?: string;
}

export interface CampaignUpdateRequest {
  title?: string;
  description?: string;
  maxClaims?: number;
  isPublic?: boolean;
  status?: CampaignStatus;
  logoUrl?: string;
  ticketBackgroundUrl?: string;
}
```

**File: `src/types/claim/index.ts`**
```typescript
import {Timestamp} from "firebase-admin/firestore";

export interface Claim {
  id: string;
  campaignId: string; // References Campaign.id
  userId: string; // References User.uid
  creatorId: string; // References User.uid (campaign creator)
  claimNumber: number; // Unique sequential number for this campaign
  email: string;
  status: ClaimStatus;
  verificationToken?: string;
  verifiedAt?: Timestamp;
  ticketUrl?: string;
  downloadCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ClaimStatus = "pending" | "verified" | "completed" | "expired";

export interface ClaimRequest {
  campaignId: string;
  email: string;
}

export interface ClaimVerification {
  claimId: string;
  verificationToken: string;
}
```

#### **2.3 Create Shared Utilities (Extending Existing Patterns)**

**Action:** Create shared utilities that build upon existing auth.ts patterns:

**File: `src/shared/validation.ts`**
```typescript
import {User} from "../types/user";
import {Campaign, CampaignCreateRequest, CampaignUpdateRequest} from "../types/campaign";
import {ClaimRequest} from "../types/claim";
import {validateUserData} from "../utils/auth"; // Import existing validation

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates campaign creation data
 */
export const validateCampaignData = (data: CampaignCreateRequest): ValidationResult => {
  // Title validation
  if (!data.title || data.title.trim().length < 3) {
    return {isValid: false, error: "Campaign title must be at least 3 characters"};
  }
  if (data.title.length > 100) {
    return {isValid: false, error: "Campaign title must be less than 100 characters"};
  }

  // Description validation
  if (!data.description || data.description.trim().length < 10) {
    return {isValid: false, error: "Campaign description must be at least 10 characters"};
  }
  if (data.description.length > 1000) {
    return {isValid: false, error: "Campaign description must be less than 1000 characters"};
  }

  // Max claims validation
  if (!data.maxClaims || data.maxClaims < 1) {
    return {isValid: false, error: "Max claims must be at least 1"};
  }
  if (data.maxClaims > 10000) {
    return {isValid: false, error: "Max claims cannot exceed 10,000"};
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
```

**File: `src/shared/errors.ts`**
```typescript
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
```

#### **2.4 Create Authentication Middleware (Extending Existing Auth)**

**Action:** Create middleware that builds upon existing auth utilities:

**File: `src/shared/middleware.ts`**
```typescript
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
```

#### **Validation Checkpoint 2 (Manual Verification)**

**Manual Verification Required:**
- [ ] Extended directory structure created without disrupting existing
- [ ] New type definitions import existing User types correctly
- [ ] Shared utilities build upon existing auth patterns
- [ ] Middleware follows existing authentication approach
- [ ] Existing User Management functionality still works

**Test Commands:**
```bash
# Verify structure
tree functions/src/

# Test TypeScript compilation
cd functions && npm run build

# Test existing functionality still works
curl -X GET "https://us-central1-lazymint-fresh-dev.cloudfunctions.net/api/health"
```

**STOP**: Do not proceed to Phase 3 until all Checkpoint 2 validations pass.

---

**END OF PART 2**

**Next:** Part 3 will cover Campaign Management Implementation