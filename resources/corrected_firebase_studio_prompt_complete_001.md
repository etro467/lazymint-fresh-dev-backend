# Firebase Studio Consolidated Prompt - LazyMint Backend Extension
## Introduction and Context for AI Implementation

**For Firebase Studio Implementation:** Use this introduction followed by the 5-part Firebase Studio prompt (Parts 1-5) in sequence.

---

## **LazyMint: Concept, Purpose, and Value Proposition**

### **What is LazyMint?**

LazyMint is a revolutionary SaaS platform that empowers digital creators to launch limited-edition content campaigns without the complexity of blockchain or cryptocurrency. It bridges the gap between traditional digital marketing and the exclusivity appeal of limited editions, providing creators with a simple, secure, and engaging way to build their audience and monetize their content.

### **Core Value Proposition**

**For Creators:**
- **Effortless Campaign Creation**: Launch limited-edition digital content campaigns in minutes, not hours
- **Fan Engagement**: Create excitement and urgency through numbered, limited-edition digital tickets
- **Email List Building**: Grow authentic email lists through valuable, exclusive content offerings
- **Revenue Generation**: Monetize content through subscription tiers and premium campaign features
- **Brand Building**: Establish exclusivity and premium positioning in their market

**For Fans/Users:**
- **Exclusive Access**: Claim unique, numbered digital tickets for their favorite creators' content
- **Collectible Experience**: Own numbered editions that feel special and exclusive
- **Simple Process**: Scan QR code, verify email, receive digital ticket - no crypto wallets or complex setup
- **Authentic Connection**: Direct relationship with creators through exclusive content access

### **Business Model and Market Position**

LazyMint operates on a freemium SaaS model (with expected monetization through Stripe):
- **Free Tier**: Basic campaign creation with limited features
- **Basic Tier**: Enhanced campaigns with custom branding and analytics
- **Pro Tier**: Advanced features including AI-generated assets, priority support, and detailed analytics

**Market Differentiation:**
- **Non-Crypto Approach**: Eliminates barriers of blockchain complexity while maintaining exclusivity appeal
- **Creator-First Design**: Built specifically for digital creators' workflows and needs
- **Simplicity Focus**: One-click campaign creation vs. complex NFT minting processes
- **Email Integration**: Seamlessly builds valuable email lists for creators

### **Technical Innovation**

**Smart Simplicity:**
- QR codes replace complex wallet addresses
- Email verification replaces blockchain transactions
- Digital tickets provide collectible experience without crypto complexity
- Cloud-based infrastructure ensures reliability and scalability

**AI-Enhanced Features:**
- AI-generated QR code designs for brand consistency
- Automated ticket background generation
- Smart campaign optimization suggestions
- Intelligent analytics and insights

### **User Journey and Experience**

**Creator Workflow:**
1. **Campaign Setup**: Define title, description, max claims, upload branding
2. **QR Generation**: System creates branded QR code for sharing
3. **Distribution**: Share QR code across social media, websites, events
4. **Management**: Monitor claims, engage with fans, analyze performance
5. **Monetization**: Upgrade tiers for advanced features and higher limits

**Fan Experience:**
1. **Discovery**: Encounter QR code through creator's content or social media
2. **Claim**: Scan QR code, enter email address
3. **Verification**: Receive email, click verification link
4. **Collection**: Download unique, numbered digital ticket
5. **Ownership**: Keep ticket as collectible proof of early support

### **Strategic Context for Backend Development**

**Why This Backend Architecture Matters:**

**Scalability Requirements:**
- Support viral campaign growth (0 to 10,000 claims in hours)
- Handle concurrent QR code scans during creator announcements
- Process email verification at scale without delays

**Security Imperatives:**
- Protect creator intellectual property and campaign data
- Prevent claim fraud and duplicate submissions
- Secure email verification and ticket generation processes

**Performance Expectations:**
- Sub-second QR code scanning and claim submission
- Instant email delivery for verification
- Real-time campaign analytics and claim tracking

**Integration Needs:**
- Email service providers for verification and notifications
- Cloud storage for ticket images and creator assets
- Analytics platforms for creator insights and platform metrics
- Payment processing for subscription management

### **Business Impact of Technical Decisions**

**Creator Success Metrics:**
- Campaign completion rate (claims vs. max claims)
- Email verification conversion rate
- Creator retention and upgrade rates
- Average revenue per creator

**Platform Growth Indicators:**
- Total campaigns created
- Total claims processed
- Creator acquisition and retention
- Revenue growth across subscription tiers

**Technical Excellence Requirements:**
- 99.9% uptime during campaign launches
- <2 second response times for all user-facing operations
- Zero data loss for creator campaigns and fan claims
- Seamless scaling during viral campaign moments

### **Design Philosophy for AI Implementation**

When implementing LazyMint's backend, consider these guiding principles:

**Creator-Centric Design:**
- Every API endpoint should optimize for creator workflow efficiency
- Error messages should be creator-friendly and actionable
- Analytics should provide actionable insights for campaign optimization

**Fan Experience Priority:**
- Claim submission should be frictionless and fast
- Email verification should be immediate and clear
- Ticket download should feel rewarding and special

**Scalability by Design:**
- Architecture should handle 100x growth without major refactoring
- Database design should support complex analytics queries
- Caching strategies should optimize for read-heavy workloads

**Security as Foundation:**
- Every endpoint should validate permissions rigorously
- Data sanitization should prevent injection attacks
- Rate limiting should prevent abuse while allowing legitimate usage

---

## **Implementation Context**

### **Existing Firebase Infrastructure**

You are extending an existing, working LazyMint Firebase backend with the following established infrastructure:

**Firebase Projects (Already Configured):**
- ✅ **Production Environment**: `lazymint-fresh` - Live production system
- ✅ **Development Environment**: `lazymint-fresh-dev` - Active development and testing
- ✅ **Project Aliases**: Configured in `.firebaserc` with `dev` and `prod` aliases for easy switching
- ✅ **Firebase CLI Setup**: Use `firebase use dev` and `firebase use prod` for environment management

**Firebase Services (Already Enabled & Configured):**
- ✅ **Firestore Database**: Native mode, nam5 location, with production-ready security rules
- ✅ **Firebase Authentication**: User authentication system with email/password
- ✅ **Firebase Functions**: TypeScript environment with ESLint, deployed and operational
- ✅ **Firebase Storage**: File storage with security rules for user uploads
- ✅ **Firebase Hosting**: Web hosting configured for frontend deployment

**Deployed Backend Systems (Already Working):**
- ✅ **User Management API**: Complete CRUD operations deployed to `lazymint-fresh-dev`
  - `POST /users` - Create user (with Firebase Auth + Firestore integration)
  - `GET /users/:uid` - Get user by ID
  - `PUT /users/:uid` - Update user data
  - `DELETE /users/:uid` - Delete user
  - `GET /health` - System health check
- ✅ **Authentication Utilities**: `validateUserData`, `sanitizeUserForResponse`, error handling patterns
- ✅ **Express.js API Framework**: CORS enabled, JSON parsing, route structure established

**Security Rules (Production-Ready):**
- ✅ **Firestore Rules**: User data protection, campaign permissions, claims access patterns
- ✅ **Storage Rules**: User logos, ticket backgrounds, QR codes with proper access control
- ✅ **Authentication Integration**: Secure user-specific data access patterns

**Development Workflow (Established):**
- ✅ **Git Branching**: `main` (production) and `develop` (development) branches
- ✅ **Deployment Process**: `firebase use dev` → test → `firebase use prod` → deploy
- ✅ **Code Quality**: ESLint, Prettier, TypeScript configuration
- ✅ **Testing Environment**: Emulators configured for local development

**Configuration Files (Already Set Up):**
```json
// .firebaserc - Project aliases
{
  "projects": {
    "default": "lazymint-fresh-dev",
    "prod": "lazymint-fresh", 
    "dev": "lazymint-fresh-dev"
  }
}

// firebase.json - Service configuration
{
  "firestore": {"rules": "firestore.rules"},
  "functions": {"source": "functions"},
  "storage": {"rules": "storage.rules"},
  "hosting": {"public": "public"},
  "emulators": {/* configured */}
}
```

**CRITICAL IMPLEMENTATION REQUIREMENTS:**

1. **DO NOT run `firebase init`** - Project is already initialized and configured
2. **DO NOT replace existing security rules** - Extend existing `firestore.rules` and `storage.rules`
3. **DO NOT duplicate User Management** - Import and build upon existing patterns
4. **DO use existing deployment workflow** - `firebase use dev` for development, `firebase use prod` for production
5. **DO follow existing code patterns** - Use established error handling, validation, and response formatting
6. **DO preserve existing functionality** - All current User Management APIs must continue working

**Your Task:**
Build upon this solid, working foundation to add Campaign Management, Claims Processing, and Asset Management capabilities while preserving all existing functionality and following established patterns.

**Success means:** The extended backend integrates seamlessly with existing User Management, maintains our proven development workflow, and realizes the complete LazyMint vision described above.

**Success means:** Creators can launch campaigns, fans can claim tickets, and the platform scales to support thousands of creators and millions of claims while maintaining the simplicity and reliability that makes LazyMint special.

---

**Next:** Proceed with the 5-part corrected Firebase Studio prompt (Parts 1-5) to implement the complete LazyMint backend extension.





-------


# Firebase Studio Prompt for LazyMint Backend - Part 1
## Foundation Integration and Setup

**Objective:** You are Firebase Studio's AI agent. Your task is to extend the existing LazyMint Firebase backend by building upon the established foundation. You MUST follow these instructions precisely to ensure seamless integration with our working User Management system.

**Context: LazyMint Application**
LazyMint is a SaaS web application empowering digital creators to launch limited-edition content campaigns. It provides a simple, secure, and non-crypto solution for creators to generate fan engagement and build their email lists. Fans claim unique, numbered editions of symbolic digital tickets by scanning a custom QR code and verifying their email address.

**CRITICAL**: LazyMint already has a working Firebase backend with deployed User Management system. Your task is to EXTEND this foundation, not replace it.

---

### **Core Principles for Successful AI Prompt Execution (Your Guiding Directives):**

As Firebase Studio's AI agent, you are to adhere to the following meta-principles throughout this build process:

1.  **Preserve Existing Foundation**: Never overwrite existing configuration, security rules, or deployed functions
2.  **Import Existing Patterns**: Use established authentication, validation, and error handling patterns
3.  **Extend, Don't Replace**: Build upon working User Management system
4.  **Follow Existing Workflow**: Use established dev/prod deployment process
5.  **Be Imperative, Not Descriptive**: Transform specifications into executable instructions
6.  **Provide Complete Implementation Examples**: Show, don't just tell
7.  **Include Explicit Setup and Configuration**: Never assume anything is pre-configured
8.  **Implement Progressive Validation Checkpoints**: Build incrementally with validation
9.  **Mandate Shared Utilities and Consistency**: Use existing utilities consistently
10. **Address Operational Concerns Explicitly**: Deployment, testing, and security are first-class concerns

---

### **Phase 0: Foundation Integration and Pattern Establishment**

**CRITICAL**: Before implementing new features, establish integration with existing User Management System.

#### **0.1 Verify Existing LazyMint Configuration**

**Action:** Confirm existing setup is operational (DO NOT run firebase init):

```bash
# Verify we're in the correct project
firebase use dev  # Uses lazymint-fresh-dev
firebase projects:list

# Verify existing configuration
cat .firebaserc  # Should show dev/prod aliases
cat firebase.json  # Should show functions, firestore, storage config

# Confirm existing functions are deployed
firebase functions:list

# Test existing User Management API
curl -X GET "https://us-central1-lazymint-fresh-dev.cloudfunctions.net/api/health"
```

**Expected Results:**
- `.firebaserc` shows dev/prod aliases for lazymint-fresh-dev and lazymint-fresh
- `firebase.json` shows configured functions, firestore, storage, hosting
- Functions list shows deployed `api` function
- Health endpoint returns `{status: "OK", timestamp: "..."}`

#### **0.2 Import Existing Authentication Patterns**

**Action:** Review and adopt established patterns from Backend/functions/src/handlers/userHandlers.ts:

```typescript
// MANDATORY imports for all new functions
import { validateUserData, sanitizeUserForResponse } from '../utils/auth';

// Follow existing error handling pattern (MANDATORY)
const handleError = (res: Response, error: any) => {
  console.error('Function error:', error);
  if (error instanceof Error && error.message.includes('email-already-exists')) {
    res.status(409).send({error: 'Email already exists'});
  } else if (error instanceof Error && error.message.includes('user-not-found')) {
    res.status(404).send({error: 'User not found'});
  } else {
    res.status(500).send({error: 'Something went wrong'});
  }
};

// Use existing validation patterns (MANDATORY)
const validateInput = (data: any, requiredFields: string[]) => {
  for (const field of requiredFields) {
    if (!data[field]) {
      return {isValid: false, error: `Missing required field: ${field}`};
    }
  }
  
  // Use existing validation for user-related fields
  if (data.email || data.displayName) {
    const validation = validateUserData(data);
    if (!validation.isValid) {
      return validation;
    }
  }
  
  return {isValid: true};
};
```

#### **0.3 Extend Existing API Structure**

**Action:** Build upon current Express.js setup in Backend/functions/src/index.ts:

```typescript
// PRESERVE existing imports and middleware
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import {createUser, getUser, updateUser, deleteUser} from "./handlers/userHandlers";

// Initialize Firebase Admin SDK (already done)
admin.initializeApp();

// Initialize Express app (already configured)
const app = express();
app.use(cors({origin: true}));
app.use(express.json());

// PRESERVE existing health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send({status: "OK", timestamp: new Date().toISOString()});
});

// PRESERVE existing User Management routes
app.post("/users", createUser);
app.get("/users/:uid", getUser);
app.put("/users/:uid", updateUser);
app.delete("/users/:uid", deleteUser);

// ADD new routes (following existing patterns) - TO BE IMPLEMENTED
// app.post("/campaigns", createCampaign);
// app.get("/campaigns/:id", getCampaign);
// app.put("/campaigns/:id", updateCampaign);
// app.delete("/campaigns/:id", deleteCampaign);

// PRESERVE existing 404 handler
app.use("*", (req, res) => {
  res.status(404).send({error: "Route not found"});
});

// PRESERVE existing function export
export const api = functions.https.onRequest(app);
```

#### **0.4 Validation Checkpoint 0 (MANDATORY)**

**Manual Verification Required:**
- [ ] Existing User Management functions continue to work
- [ ] Health endpoint responds correctly
- [ ] Firebase aliases (dev/prod) are functional
- [ ] Existing authentication patterns are understood
- [ ] New code follows established error handling patterns

**Test Commands:**
```bash
# Test existing User Management
curl -X GET "https://us-central1-lazymint-fresh-dev.cloudfunctions.net/api/health"

# Verify project aliases work
firebase use dev
firebase use prod
firebase use dev  # Return to dev for development
```

**STOP**: Do not proceed to Phase 1 until all Checkpoint 0 validations pass.

---

### **Phase 1: Environment Validation and Dependency Management**

**CRITICAL**: Validate existing environment and add only necessary new dependencies.

#### **1.1 Validate Existing Firebase Services**

**Action:** Confirm all required services are already enabled:

```bash
# Verify APIs (should already be enabled from existing setup)
gcloud services list --enabled --filter="name:firestore OR name:cloudfunctions OR name:storage OR name:identitytoolkit"

# Enable additional APIs needed for new features
gcloud services enable aiplatform.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Verify all APIs are enabled
gcloud services list --enabled --filter="name:firestore OR name:cloudfunctions OR name:storage OR name:aiplatform OR name:secretmanager OR name:identitytoolkit"
```

#### **1.2 Install Additional Dependencies**

**Action:** Navigate to the `functions` directory and install new dependencies (preserve existing):

```bash
cd functions

# Verify existing dependencies are intact
npm list firebase-admin firebase-functions express cors

# Install additional dependencies for new features
npm install sharp qrcode @google-cloud/aiplatform axios joi uuid

# Install development dependencies
npm install --save-dev @types/uuid @types/sharp

# Verify installation
npm list
```

#### **1.3 Service Account Permissions Setup**

**Action:** Grant additional permissions for new features (preserve existing):

```bash
# Get your Cloud Functions service account
export PROJECT_ID=$(firebase use --project)
export FUNCTIONS_SA="firebase-functions@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant additional permissions for new features
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${FUNCTIONS_SA}" \
  --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${FUNCTIONS_SA}" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${FUNCTIONS_SA}" \
  --role="roles/storage.admin"
```

#### **1.4 Create Required Secrets**

**Action:** Create secrets for new integrations:

```bash
# Create placeholder secrets (replace with real values later)
echo "placeholder-genai-key" | gcloud secrets create GENAI_API_KEY --data-file=-

# Grant access to secrets
gcloud secrets add-iam-policy-binding GENAI_API_KEY \
  --member="serviceAccount:${FUNCTIONS_SA}" \
  --role="roles/secretmanager.secretAccessor"
```

#### **Validation Checkpoint 1 (Manual Verification)**

**Manual Verification Required:**
- [ ] All APIs are enabled (existing + new)
- [ ] New dependencies installed without breaking existing
- [ ] Service account has required permissions
- [ ] Secrets are created and accessible
- [ ] Existing User Management still functional

**Test Commands:**
```bash
# Test existing functionality still works
curl -X GET "https://us-central1-lazymint-fresh-dev.cloudfunctions.net/api/health"

# Verify new dependencies
cd functions && npm list sharp qrcode @google-cloud/aiplatform

# Test secret access (should not error)
gcloud secrets versions access latest --secret="GENAI_API_KEY"
```

**STOP**: Do not proceed to Phase 2 until all Checkpoint 1 validations pass.

---

**END OF PART 1**

**Next:** Part 2 will cover Project Structure Extension and Shared Utilities


-------





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


-------




# Corrected Firebase Studio Prompt for LazyMint Backend - Part 3
## Campaign Management Implementation

**Continuation from Part 2** - Assumes Phase 0, 1, and 2 validations have passed.

---

### **Phase 3: Campaign Management System Implementation**

**CRITICAL**: Implement campaign management that integrates seamlessly with existing User Management.

#### **3.1 Campaign Handlers Implementation**

**Action:** Create campaign handlers that follow existing userHandlers.ts patterns:

**File: `src/handlers/campaignHandlers.ts`**
```typescript
import {Request, Response} from "express";
import * as admin from "firebase-admin";
import {Campaign, CampaignCreateRequest, CampaignUpdateRequest, CampaignStatus} from "../types/campaign";
import {validateCampaignData} from "../shared/validation";
import {sendErrorResponse, sendValidationError, sendAuthError, sendPermissionError} from "../shared/errors";
import {AuthenticatedRequest} from "../shared/middleware";
import {sanitizeUserForResponse} from "../utils/auth"; // Import existing utility

/**
 * Create a new campaign (follows existing createUser pattern)
 */
export const createCampaign = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Authentication check (following existing pattern)
    if (!req.user) {
      sendAuthError(res);
      return;
    }

    const campaignData: CampaignCreateRequest = req.body;

    // Validation (following existing validation pattern)
    const validation = validateCampaignData(campaignData);
    if (!validation.isValid) {
      sendValidationError(res, validation.error!);
      return;
    }

    // Create campaign document (following existing Firestore pattern)
    const db = admin.firestore();
    const campaignRef = db.collection('campaigns').doc();
    
    const campaign: Campaign = {
      id: campaignRef.id,
      creatorId: req.user.uid,
      title: campaignData.title.trim(),
      description: campaignData.description.trim(),
      logoUrl: campaignData.logoUrl,
      ticketBackgroundUrl: campaignData.ticketBackgroundUrl,
      maxClaims: campaignData.maxClaims,
      currentClaims: 0,
      status: "draft" as CampaignStatus,
      isPublic: campaignData.isPublic,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    // Use transaction for data consistency (following existing pattern)
    await db.runTransaction(async (transaction) => {
      // Create campaign
      transaction.set(campaignRef, campaign);
      
      // Update user's campaign count (if user document exists)
      const userRef = db.collection('users').doc(req.user!.uid);
      const userDoc = await transaction.get(userRef);
      
      if (userDoc.exists) {
        const currentCount = userDoc.data()?.campaignCount || 0;
        transaction.update(userRef, {
          campaignCount: currentCount + 1,
          updatedAt: admin.firestore.Timestamp.now()
        });
      }
    });

    // Return sanitized response (following existing pattern)
    res.status(201).send({
      success: true,
      data: sanitizeCampaignForResponse(campaign)
    });

  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * Get campaign by ID (follows existing getUser pattern)
 */
export const getCampaign = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {id} = req.params;

    if (!id) {
      sendValidationError(res, "Campaign ID is required");
      return;
    }

    const db = admin.firestore();
    const campaignDoc = await db.collection('campaigns').doc(id).get();

    if (!campaignDoc.exists) {
      res.status(404).send({error: "Campaign not found"});
      return;
    }

    const campaign = campaignDoc.data() as Campaign;

    // Check permissions (public campaigns or owner can view)
    if (!campaign.isPublic && (!req.user || req.user.uid !== campaign.creatorId)) {
      sendPermissionError(res, "Cannot access private campaign");
      return;
    }

    res.status(200).send({
      success: true,
      data: sanitizeCampaignForResponse(campaign)
    });

  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * Update campaign (follows existing updateUser pattern)
 */
export const updateCampaign = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {id} = req.params;
    const updateData: CampaignUpdateRequest = req.body;

    // Authentication check
    if (!req.user) {
      sendAuthError(res);
      return;
    }

    if (!id) {
      sendValidationError(res, "Campaign ID is required");
      return;
    }

    // Validate update data
    if (Object.keys(updateData).length === 0) {
      sendValidationError(res, "No valid fields to update");
      return;
    }

    const db = admin.firestore();
    const campaignRef = db.collection('campaigns').doc(id);

    // Use transaction for consistency (following existing pattern)
    const updatedCampaign = await db.runTransaction(async (transaction) => {
      const campaignDoc = await transaction.get(campaignRef);
      
      if (!campaignDoc.exists) {
        throw new Error('Campaign not found');
      }

      const campaign = campaignDoc.data() as Campaign;

      // Check ownership
      if (campaign.creatorId !== req.user!.uid) {
        throw new Error('Permission denied');
      }

      // Validate update data if provided
      if (updateData.title || updateData.description || updateData.maxClaims) {
        const validationData = {
          title: updateData.title || campaign.title,
          description: updateData.description || campaign.description,
          maxClaims: updateData.maxClaims || campaign.maxClaims,
          isPublic: updateData.isPublic !== undefined ? updateData.isPublic : campaign.isPublic
        };
        
        const validation = validateCampaignData(validationData);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }
      }

      // Prepare update data
      const updates: Partial<Campaign> = {
        ...updateData,
        updatedAt: admin.firestore.Timestamp.now()
      };

      // Remove undefined values
      Object.keys(updates).forEach(key => {
        if (updates[key as keyof Campaign] === undefined) {
          delete updates[key as keyof Campaign];
        }
      });

      transaction.update(campaignRef, updates);

      return {...campaign, ...updates};
    });

    res.status(200).send({
      success: true,
      data: sanitizeCampaignForResponse(updatedCampaign)
    });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Campaign not found') {
        res.status(404).send({error: "Campaign not found"});
        return;
      }
      if (error.message === 'Permission denied') {
        sendPermissionError(res);
        return;
      }
      if (error.message.includes('validation')) {
        sendValidationError(res, error.message);
        return;
      }
    }
    sendErrorResponse(res, error);
  }
};

/**
 * Delete campaign (follows existing deleteUser pattern)
 */
export const deleteCampaign = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {id} = req.params;

    // Authentication check
    if (!req.user) {
      sendAuthError(res);
      return;
    }

    if (!id) {
      sendValidationError(res, "Campaign ID is required");
      return;
    }

    const db = admin.firestore();
    const campaignRef = db.collection('campaigns').doc(id);

    // Use transaction for consistency
    await db.runTransaction(async (transaction) => {
      const campaignDoc = await transaction.get(campaignRef);
      
      if (!campaignDoc.exists) {
        throw new Error('Campaign not found');
      }

      const campaign = campaignDoc.data() as Campaign;

      // Check ownership
      if (campaign.creatorId !== req.user!.uid) {
        throw new Error('Permission denied');
      }

      // Soft delete by updating status (preserve data for analytics)
      transaction.update(campaignRef, {
        status: "archived" as CampaignStatus,
        updatedAt: admin.firestore.Timestamp.now()
      });

      // Update user's campaign count
      const userRef = db.collection('users').doc(req.user!.uid);
      const userDoc = await transaction.get(userRef);
      
      if (userDoc.exists) {
        const currentCount = userDoc.data()?.campaignCount || 0;
        transaction.update(userRef, {
          campaignCount: Math.max(0, currentCount - 1),
          updatedAt: admin.firestore.Timestamp.now()
        });
      }
    });

    res.status(200).send({
      success: true,
      message: "Campaign archived successfully"
    });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Campaign not found') {
        res.status(404).send({error: "Campaign not found"});
        return;
      }
      if (error.message === 'Permission denied') {
        sendPermissionError(res);
        return;
      }
    }
    sendErrorResponse(res, error);
  }
};

/**
 * List user's campaigns (new functionality)
 */
export const listUserCampaigns = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Authentication check
    if (!req.user) {
      sendAuthError(res);
      return;
    }

    const db = admin.firestore();
    const campaignsQuery = db.collection('campaigns')
      .where('creatorId', '==', req.user.uid)
      .where('status', '!=', 'archived')
      .orderBy('status')
      .orderBy('createdAt', 'desc')
      .limit(50);

    const snapshot = await campaignsQuery.get();
    const campaigns = snapshot.docs.map(doc => sanitizeCampaignForResponse(doc.data() as Campaign));

    res.status(200).send({
      success: true,
      data: campaigns,
      count: campaigns.length
    });

  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * List public campaigns (new functionality)
 */
export const listPublicCampaigns = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const db = admin.firestore();
    const campaignsQuery = db.collection('campaigns')
      .where('isPublic', '==', true)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(20);

    const snapshot = await campaignsQuery.get();
    const campaigns = snapshot.docs.map(doc => sanitizeCampaignForResponse(doc.data() as Campaign));

    res.status(200).send({
      success: true,
      data: campaigns,
      count: campaigns.length
    });

  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * Sanitize campaign data for API responses (follows existing sanitizeUserForResponse pattern)
 */
const sanitizeCampaignForResponse = (campaign: Campaign): Omit<Campaign, 'never'> => {
  // For campaigns, we don't need to remove sensitive fields like we do for users
  // But we maintain the pattern for consistency
  return campaign;
};
```

#### **3.2 Update Main Index File to Include Campaign Routes**

**Action:** Extend existing index.ts to include campaign routes (preserve existing):

**File: `src/index.ts` (UPDATE - preserve existing content)**
```typescript
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";

// PRESERVE existing imports
import {createUser, getUser, updateUser, deleteUser} from "./handlers/userHandlers";

// ADD new imports
import {
  createCampaign,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  listUserCampaigns,
  listPublicCampaigns
} from "./handlers/campaignHandlers";
import {authenticateUser, optionalAuth} from "./shared/middleware";

// Initialize Firebase Admin SDK (already done)
admin.initializeApp();

// Initialize Express app (already configured)
const app = express();
app.use(cors({origin: true}));
app.use(express.json());

// PRESERVE existing health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send({status: "OK", timestamp: new Date().toISOString()});
});

// PRESERVE existing User Management routes
app.post("/users", createUser);
app.get("/users/:uid", getUser);
app.put("/users/:uid", updateUser);
app.delete("/users/:uid", deleteUser);

// ADD new Campaign Management routes
app.post("/campaigns", authenticateUser, createCampaign);
app.get("/campaigns/public", optionalAuth, listPublicCampaigns);
app.get("/campaigns/my", authenticateUser, listUserCampaigns);
app.get("/campaigns/:id", optionalAuth, getCampaign);
app.put("/campaigns/:id", authenticateUser, updateCampaign);
app.delete("/campaigns/:id", authenticateUser, deleteCampaign);

// PRESERVE existing 404 handler
app.use("*", (req, res) => {
  res.status(404).send({error: "Route not found"});
});

// PRESERVE existing function export
export const api = functions.https.onRequest(app);
```

#### **3.3 Extend Existing Firestore Security Rules**

**Action:** Add campaign rules to existing firestore.rules (PRESERVE existing rules):

**File: `firestore.rules` (UPDATE - preserve existing content)**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // PRESERVE existing default deny rule
    match /{document=**} {
      allow read, write: if false;
    }
    
    // PRESERVE existing users rules
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // PRESERVE existing campaigns rules (if any) and EXTEND
    match /campaigns/{campaignId} {
      // Public campaigns can be read by anyone
      allow read: if resource.data.isPublic == true && resource.data.status == 'active';
      
      // Campaign creators can read/write their own campaigns
      allow read, write: if request.auth != null && 
                         request.auth.uid == resource.data.creatorId;
      
      // Authenticated users can read campaigns they have access to
      allow read: if request.auth != null && 
                  (resource.data.isPublic == true || 
                   request.auth.uid == resource.data.creatorId);
      
      // Only authenticated users can create campaigns
      allow create: if request.auth != null && 
                    request.auth.uid == request.resource.data.creatorId &&
                    validateCampaignData(request.resource.data);
      
      // Only campaign creators can update their campaigns
      allow update: if request.auth != null && 
                    request.auth.uid == resource.data.creatorId &&
                    request.auth.uid == request.resource.data.creatorId &&
                    validateCampaignUpdate(request.resource.data, resource.data);
    }
    
    // PRESERVE existing claims rules (if any)
    match /claims/{claimId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
                  (request.auth.uid == resource.data.userId ||
                   request.auth.uid == resource.data.creatorId);
    }
    
    // PRESERVE existing analytics rules (if any)
    match /analytics/{analyticsId} {
      allow read, write: if request.auth != null && 
                         request.auth.uid == resource.data.creatorId;
    }
  }
  
  // Helper functions for campaign validation
  function validateCampaignData(data) {
    return data.keys().hasAll(['creatorId', 'title', 'description', 'maxClaims', 'isPublic']) &&
           data.title is string && data.title.size() >= 3 && data.title.size() <= 100 &&
           data.description is string && data.description.size() >= 10 && data.description.size() <= 1000 &&
           data.maxClaims is int && data.maxClaims >= 1 && data.maxClaims <= 10000 &&
           data.isPublic is bool &&
           data.status in ['draft', 'active', 'paused', 'completed', 'archived'] &&
           data.currentClaims is int && data.currentClaims >= 0;
  }
  
  function validateCampaignUpdate(newData, oldData) {
    return newData.creatorId == oldData.creatorId &&
           newData.id == oldData.id &&
           newData.createdAt == oldData.createdAt;
  }
}
```

#### **Validation Checkpoint 3 (Manual Verification)**

**Manual Verification Required:**
- [ ] Campaign handlers follow existing userHandlers patterns
- [ ] New routes added to index.ts without disrupting existing
- [ ] Firestore rules extended without replacing existing
- [ ] Authentication middleware works with existing auth
- [ ] Existing User Management functionality still works

**Test Commands:**
```bash
# Build and deploy
cd functions && npm run build
firebase use dev
firebase deploy --only functions

# Test existing functionality still works
curl -X GET "https://us-central1-lazymint-fresh-dev.cloudfunctions.net/api/health"

# Test new campaign endpoints (requires authentication)
curl -X GET "https://us-central1-lazymint-fresh-dev.cloudfunctions.net/api/campaigns/public"
```

**STOP**: Do not proceed to Phase 4 until all Checkpoint 3 validations pass.

---

**END OF PART 3**

**Next:** Part 4 will cover Claims Processing Implementation


-------




# Corrected Firebase Studio Prompt for LazyMint Backend - Part 4
## Claims Processing Implementation

**Continuation from Part 3** - Assumes Phase 0, 1, 2, and 3 validations have passed.

---

### **Phase 4: Claims Processing System Implementation**

**CRITICAL**: Implement claims processing that integrates with existing User Management and Campaign systems.

#### **4.1 Claims Handlers Implementation**

**Action:** Create claims handlers that follow existing patterns and integrate with campaigns:

**File: `src/handlers/claimHandlers.ts`**
```typescript
import {Request, Response} from "express";
import * as admin from "firebase-admin";
import {Claim, ClaimRequest, ClaimVerification, ClaimStatus} from "../types/claim";
import {Campaign} from "../types/campaign";
import {validateClaimData} from "../shared/validation";
import {sendErrorResponse, sendValidationError, sendAuthError, sendPermissionError} from "../shared/errors";
import {AuthenticatedRequest} from "../shared/middleware";
import {validateUserData} from "../utils/auth"; // Import existing validation
import * as crypto from "crypto";

/**
 * Process a new claim (follows existing handler patterns)
 */
export const processClaim = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const claimData: ClaimRequest = req.body;

    // Validation (following existing validation pattern)
    const validation = validateClaimData(claimData);
    if (!validation.isValid) {
      sendValidationError(res, validation.error!);
      return;
    }

    const db = admin.firestore();

    // Use transaction for data consistency (following existing pattern)
    const result = await db.runTransaction(async (transaction) => {
      // Get campaign
      const campaignRef = db.collection('campaigns').doc(claimData.campaignId);
      const campaignDoc = await transaction.get(campaignRef);
      
      if (!campaignDoc.exists) {
        throw new Error('Campaign not found');
      }

      const campaign = campaignDoc.data() as Campaign;

      // Validate campaign status
      if (campaign.status !== 'active') {
        throw new Error('Campaign is not active');
      }

      // Check if campaign has reached max claims
      if (campaign.currentClaims >= campaign.maxClaims) {
        throw new Error('Campaign has reached maximum claims');
      }

      // Check if email already claimed for this campaign
      const existingClaimQuery = await db.collection('claims')
        .where('campaignId', '==', claimData.campaignId)
        .where('email', '==', claimData.email.toLowerCase())
        .limit(1)
        .get();

      if (!existingClaimQuery.empty) {
        throw new Error('Email has already claimed this campaign');
      }

      // Create claim
      const claimRef = db.collection('claims').doc();
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      const claim: Claim = {
        id: claimRef.id,
        campaignId: claimData.campaignId,
        userId: '', // Will be set when user verifies email
        creatorId: campaign.creatorId,
        claimNumber: campaign.currentClaims + 1,
        email: claimData.email.toLowerCase(),
        status: 'pending' as ClaimStatus,
        verificationToken,
        downloadCount: 0,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      // Create claim document
      transaction.set(claimRef, claim);

      // Update campaign claim count
      transaction.update(campaignRef, {
        currentClaims: campaign.currentClaims + 1,
        updatedAt: admin.firestore.Timestamp.now()
      });

      return {claim, campaign};
    });

    // Send verification email (placeholder - implement email service)
    await sendVerificationEmail(result.claim, result.campaign);

    // Return response (following existing pattern)
    res.status(201).send({
      success: true,
      message: "Claim submitted successfully. Please check your email for verification.",
      data: {
        claimId: result.claim.id,
        claimNumber: result.claim.claimNumber,
        campaignTitle: result.campaign.title
      }
    });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Campaign not found') {
        res.status(404).send({error: "Campaign not found"});
        return;
      }
      if (error.message === 'Campaign is not active') {
        res.status(400).send({error: "Campaign is not currently accepting claims"});
        return;
      }
      if (error.message === 'Campaign has reached maximum claims') {
        res.status(400).send({error: "Campaign has reached maximum number of claims"});
        return;
      }
      if (error.message === 'Email has already claimed this campaign') {
        res.status(409).send({error: "This email has already claimed this campaign"});
        return;
      }
    }
    sendErrorResponse(res, error);
  }
};

/**
 * Verify claim with token (follows existing verification patterns)
 */
export const verifyClaim = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {claimId, verificationToken} = req.body as ClaimVerification;

    if (!claimId || !verificationToken) {
      sendValidationError(res, "Claim ID and verification token are required");
      return;
    }

    const db = admin.firestore();

    // Use transaction for consistency
    const result = await db.runTransaction(async (transaction) => {
      const claimRef = db.collection('claims').doc(claimId);
      const claimDoc = await transaction.get(claimRef);
      
      if (!claimDoc.exists) {
        throw new Error('Claim not found');
      }

      const claim = claimDoc.data() as Claim;

      // Validate verification token
      if (claim.verificationToken !== verificationToken) {
        throw new Error('Invalid verification token');
      }

      // Check if already verified
      if (claim.status === 'verified' || claim.status === 'completed') {
        throw new Error('Claim already verified');
      }

      // Check if expired (24 hours)
      const expirationTime = new Date(claim.createdAt.toDate().getTime() + 24 * 60 * 60 * 1000);
      if (new Date() > expirationTime) {
        throw new Error('Verification token expired');
      }

      // Update claim status
      const updates = {
        status: 'verified' as ClaimStatus,
        verifiedAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        verificationToken: admin.firestore.FieldValue.delete() // Remove token for security
      };

      transaction.update(claimRef, updates);

      return {...claim, ...updates};
    });

    // Generate ticket (placeholder - implement ticket generation)
    const ticketUrl = await generateTicket(result);

    // Update claim with ticket URL
    await admin.firestore().collection('claims').doc(claimId).update({
      ticketUrl,
      status: 'completed' as ClaimStatus,
      updatedAt: admin.firestore.Timestamp.now()
    });

    res.status(200).send({
      success: true,
      message: "Claim verified successfully",
      data: {
        claimId: result.id,
        claimNumber: result.claimNumber,
        ticketUrl,
        status: 'completed'
      }
    });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Claim not found') {
        res.status(404).send({error: "Claim not found"});
        return;
      }
      if (error.message === 'Invalid verification token') {
        res.status(400).send({error: "Invalid verification token"});
        return;
      }
      if (error.message === 'Claim already verified') {
        res.status(400).send({error: "Claim has already been verified"});
        return;
      }
      if (error.message === 'Verification token expired') {
        res.status(400).send({error: "Verification token has expired"});
        return;
      }
    }
    sendErrorResponse(res, error);
  }
};

/**
 * Get claim status (follows existing get patterns)
 */
export const getClaimStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {claimId} = req.params;

    if (!claimId) {
      sendValidationError(res, "Claim ID is required");
      return;
    }

    const db = admin.firestore();
    const claimDoc = await db.collection('claims').doc(claimId).get();

    if (!claimDoc.exists) {
      res.status(404).send({error: "Claim not found"});
      return;
    }

    const claim = claimDoc.data() as Claim;

    // Return sanitized claim data
    res.status(200).send({
      success: true,
      data: {
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        status: claim.status,
        createdAt: claim.createdAt,
        verifiedAt: claim.verifiedAt,
        ticketUrl: claim.ticketUrl
      }
    });

  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * List claims for a campaign (authenticated - campaign creator only)
 */
export const listCampaignClaims = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {campaignId} = req.params;

    if (!req.user) {
      sendAuthError(res);
      return;
    }

    if (!campaignId) {
      sendValidationError(res, "Campaign ID is required");
      return;
    }

    const db = admin.firestore();

    // Verify user owns the campaign
    const campaignDoc = await db.collection('campaigns').doc(campaignId).get();
    if (!campaignDoc.exists) {
      res.status(404).send({error: "Campaign not found"});
      return;
    }

    const campaign = campaignDoc.data() as Campaign;
    if (campaign.creatorId !== req.user.uid) {
      sendPermissionError(res, "Cannot access claims for this campaign");
      return;
    }

    // Get claims for the campaign
    const claimsQuery = db.collection('claims')
      .where('campaignId', '==', campaignId)
      .orderBy('claimNumber', 'asc')
      .limit(100);

    const snapshot = await claimsQuery.get();
    const claims = snapshot.docs.map(doc => {
      const claim = doc.data() as Claim;
      return {
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        email: claim.email,
        status: claim.status,
        createdAt: claim.createdAt,
        verifiedAt: claim.verifiedAt,
        downloadCount: claim.downloadCount
      };
    });

    res.status(200).send({
      success: true,
      data: claims,
      count: claims.length,
      campaignTitle: campaign.title
    });

  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * Download ticket (public endpoint with claim validation)
 */
export const downloadTicket = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {claimId} = req.params;

    if (!claimId) {
      sendValidationError(res, "Claim ID is required");
      return;
    }

    const db = admin.firestore();

    // Use transaction to update download count
    await db.runTransaction(async (transaction) => {
      const claimRef = db.collection('claims').doc(claimId);
      const claimDoc = await transaction.get(claimRef);
      
      if (!claimDoc.exists) {
        throw new Error('Claim not found');
      }

      const claim = claimDoc.data() as Claim;

      if (claim.status !== 'completed') {
        throw new Error('Claim not completed');
      }

      if (!claim.ticketUrl) {
        throw new Error('Ticket not available');
      }

      // Update download count
      transaction.update(claimRef, {
        downloadCount: claim.downloadCount + 1,
        updatedAt: admin.firestore.Timestamp.now()
      });

      // Redirect to ticket URL or return ticket data
      res.redirect(claim.ticketUrl);
    });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Claim not found') {
        res.status(404).send({error: "Claim not found"});
        return;
      }
      if (error.message === 'Claim not completed') {
        res.status(400).send({error: "Claim verification not completed"});
        return;
      }
      if (error.message === 'Ticket not available') {
        res.status(400).send({error: "Ticket not yet generated"});
        return;
      }
    }
    sendErrorResponse(res, error);
  }
};

/**
 * Send verification email (placeholder implementation)
 */
async function sendVerificationEmail(claim: Claim, campaign: Campaign): Promise<void> {
  // TODO: Implement email service integration
  // For now, log the verification details
  console.log('Verification email would be sent:', {
    to: claim.email,
    claimId: claim.id,
    verificationToken: claim.verificationToken,
    campaignTitle: campaign.title,
    claimNumber: claim.claimNumber
  });

  // In production, integrate with email service like SendGrid, Mailgun, etc.
  // Example verification URL: https://lazymint.com/verify?claimId=${claim.id}&token=${claim.verificationToken}
}

/**
 * Generate ticket (placeholder implementation)
 */
async function generateTicket(claim: Claim): Promise<string> {
  // TODO: Implement ticket generation with campaign branding
  // For now, return a placeholder URL
  const ticketUrl = `https://storage.googleapis.com/lazymint-tickets/claim-${claim.id}-ticket.png`;
  
  console.log('Ticket would be generated:', {
    claimId: claim.id,
    claimNumber: claim.claimNumber,
    ticketUrl
  });

  return ticketUrl;
}
```

#### **4.2 Update Main Index File to Include Claims Routes**

**Action:** Add claims routes to existing index.ts (preserve all existing content):

**File: `src/index.ts` (UPDATE - add to existing)**
```typescript
// ADD to existing imports
import {
  processClaim,
  verifyClaim,
  getClaimStatus,
  listCampaignClaims,
  downloadTicket
} from "./handlers/claimHandlers";

// ADD new Claims Processing routes (after existing campaign routes)
app.post("/claims", processClaim);
app.post("/claims/verify", verifyClaim);
app.get("/claims/:claimId/status", getClaimStatus);
app.get("/claims/:claimId/download", downloadTicket);
app.get("/campaigns/:campaignId/claims", authenticateUser, listCampaignClaims);
```

#### **4.3 Extend Firestore Security Rules for Claims**

**Action:** Add claims rules to existing firestore.rules (PRESERVE all existing):

**File: `firestore.rules` (UPDATE - add to existing)**
```javascript
// ADD to existing rules (after campaigns rules)

// Claims: Specific access patterns
match /claims/{claimId} {
  // Anyone can create claims (for public claim submission)
  allow create: if validateClaimData(request.resource.data);
  
  // Claim owners (by email) and campaign creators can read claims
  allow read: if request.auth != null && 
              (request.auth.token.email == resource.data.email ||
               request.auth.uid == resource.data.creatorId);
  
  // Only the system can update claims (through Cloud Functions)
  // Users cannot directly update claim status
  allow update: if false;
  
  // Campaign creators can read their campaign claims
  allow list: if request.auth != null && 
              request.auth.uid == resource.data.creatorId;
}

// ADD helper function for claim validation
function validateClaimData(data) {
  return data.keys().hasAll(['campaignId', 'email', 'status']) &&
         data.campaignId is string &&
         data.email is string &&
         data.email.matches('.*@.*\\..*') &&
         data.status in ['pending', 'verified', 'completed', 'expired'] &&
         data.claimNumber is int && data.claimNumber > 0;
}
```

#### **4.4 Create Email Templates (Placeholder Structure)**

**Action:** Create email template structure for verification emails:

**File: `src/shared/emailTemplates.ts`**
```typescript
import {Claim} from "../types/claim";
import {Campaign} from "../types/campaign";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Generate verification email template
 */
export const generateVerificationEmail = (
  claim: Claim, 
  campaign: Campaign, 
  verificationUrl: string
): EmailTemplate => {
  const subject = `Verify your claim for "${campaign.title}" - Claim #${claim.claimNumber}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your LazyMint Claim</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333;">LazyMint</h1>
      </div>
      
      <h2 style="color: #333;">Verify Your Claim</h2>
      
      <p>Congratulations! You've successfully claimed <strong>Claim #${claim.claimNumber}</strong> for the campaign:</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0; color: #333;">${campaign.title}</h3>
        <p style="margin: 10px 0 0 0; color: #666;">${campaign.description}</p>
      </div>
      
      <p>To complete your claim and receive your digital ticket, please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email & Get Ticket
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${verificationUrl}">${verificationUrl}</a>
      </p>
      
      <p style="color: #666; font-size: 14px;">
        This verification link will expire in 24 hours.
      </p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        This email was sent because you claimed a digital ticket on LazyMint.<br>
        If you didn't make this claim, you can safely ignore this email.
      </p>
    </body>
    </html>
  `;
  
  const text = `
LazyMint - Verify Your Claim

Congratulations! You've successfully claimed Claim #${claim.claimNumber} for: ${campaign.title}

To complete your claim and receive your digital ticket, please verify your email address by visiting:
${verificationUrl}

This verification link will expire in 24 hours.

If you didn't make this claim, you can safely ignore this email.
  `;

  return {subject, html, text};
};
```

#### **Validation Checkpoint 4 (Manual Verification)**

**Manual Verification Required:**
- [ ] Claims handlers follow existing patterns and integrate with campaigns
- [ ] Claims routes added to index.ts without disrupting existing
- [ ] Firestore rules extended for claims without replacing existing
- [ ] Email templates created with proper structure
- [ ] All existing functionality (users, campaigns) still works

**Test Commands:**
```bash
# Build and deploy
cd functions && npm run build
firebase use dev
firebase deploy --only functions

# Test existing functionality
curl -X GET "https://us-central1-lazymint-fresh-dev.cloudfunctions.net/api/health"
curl -X GET "https://us-central1-lazymint-fresh-dev.cloudfunctions.net/api/campaigns/public"

# Test new claims endpoint (should require campaign ID and email)
curl -X POST "https://us-central1-lazymint-fresh-dev.cloudfunctions.net/api/claims" \
  -H "Content-Type: application/json" \
  -d '{"campaignId":"test","email":"test@example.com"}'
```

**STOP**: Do not proceed to Phase 5 until all Checkpoint 4 validations pass.

---

**END OF PART 4**

**Next:** Part 5 will cover Asset Management and QR Code Generation



-------



# Corrected Firebase Studio Prompt for LazyMint Backend - Part 5
## Asset Management, QR Code Generation, and Deployment

**Continuation from Part 4** - Assumes Phase 0, 1, 2, 3, and 4 validations have passed.

---

### **Phase 5: Asset Management and QR Code Generation**

**CRITICAL**: Implement asset management that integrates with existing systems and follows established patterns.

#### **5.1 Asset Management Handlers**

**Action:** Create asset handlers for ticket generation and QR codes:

**File: `src/handlers/assetHandlers.ts`**
```typescript
import {Request, Response} from "express";
import * as admin from "firebase-admin";
import {AuthenticatedRequest} from "../shared/middleware";
import {sendErrorResponse, sendValidationError, sendAuthError, sendPermissionError} from "../shared/errors";
import {Campaign} from "../types/campaign";
import {Claim} from "../types/claim";
import * as sharp from "sharp";
import * as QRCode from "qrcode";

/**
 * Generate QR code for campaign (follows existing handler patterns)
 */
export const generateCampaignQR = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {campaignId} = req.params;

    if (!req.user) {
      sendAuthError(res);
      return;
    }

    if (!campaignId) {
      sendValidationError(res, "Campaign ID is required");
      return;
    }

    const db = admin.firestore();
    const campaignDoc = await db.collection('campaigns').doc(campaignId).get();

    if (!campaignDoc.exists) {
      res.status(404).send({error: "Campaign not found"});
      return;
    }

    const campaign = campaignDoc.data() as Campaign;

    // Check ownership
    if (campaign.creatorId !== req.user.uid) {
      sendPermissionError(res, "Cannot generate QR code for this campaign");
      return;
    }

    // Generate QR code data
    const qrData = {
      type: 'lazymint_campaign',
      campaignId: campaign.id,
      title: campaign.title,
      claimUrl: `https://lazymint.com/claim/${campaign.id}`
    };

    // Generate QR code image
    const qrCodeBuffer = await QRCode.toBuffer(JSON.stringify(qrData), {
      type: 'png',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const fileName = `qrcodes/${campaign.id}/campaign-qr.png`;
    const file = bucket.file(fileName);

    await file.save(qrCodeBuffer, {
      metadata: {
        contentType: 'image/png',
        metadata: {
          campaignId: campaign.id,
          createdBy: req.user.uid,
          createdAt: new Date().toISOString()
        }
      }
    });

    // Make file publicly readable
    await file.makePublic();

    const qrCodeUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    // Update campaign with QR code URL
    await db.collection('campaigns').doc(campaignId).update({
      qrCodeUrl,
      updatedAt: admin.firestore.Timestamp.now()
    });

    res.status(200).send({
      success: true,
      data: {
        qrCodeUrl,
        qrData
      }
    });

  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * Generate ticket image for completed claim
 */
export const generateTicketImage = async (
  claimId: string,
  campaign: Campaign,
  claim: Claim
): Promise<string> => {
  try {
    // Create base ticket image (800x600)
    const ticketWidth = 800;
    const ticketHeight = 600;

    // Create base ticket with campaign branding
    let ticketImage = sharp({
      create: {
        width: ticketWidth,
        height: ticketHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    });

    // Add campaign logo if available
    if (campaign.logoUrl) {
      try {
        const logoResponse = await fetch(campaign.logoUrl);
        const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
        const resizedLogo = await sharp(logoBuffer)
          .resize(150, 150, { fit: 'inside', withoutEnlargement: true })
          .png()
          .toBuffer();

        ticketImage = ticketImage.composite([{
          input: resizedLogo,
          top: 50,
          left: 50
        }]);
      } catch (logoError) {
        console.warn('Could not load campaign logo:', logoError);
      }
    }

    // Add text overlay with campaign and claim info
    const textSvg = `
      <svg width="${ticketWidth}" height="${ticketHeight}">
        <style>
          .title { fill: #333; font-size: 36px; font-family: Arial, sans-serif; font-weight: bold; }
          .claim-number { fill: #007bff; font-size: 48px; font-family: Arial, sans-serif; font-weight: bold; }
          .description { fill: #666; font-size: 18px; font-family: Arial, sans-serif; }
          .footer { fill: #999; font-size: 14px; font-family: Arial, sans-serif; }
        </style>
        <text x="250" y="100" class="title">${escapeXml(campaign.title)}</text>
        <text x="250" y="200" class="claim-number">Claim #${claim.claimNumber}</text>
        <text x="250" y="250" class="description">${escapeXml(campaign.description.substring(0, 100))}${campaign.description.length > 100 ? '...' : ''}</text>
        <text x="250" y="500" class="footer">Claimed: ${claim.createdAt.toDate().toLocaleDateString()}</text>
        <text x="250" y="530" class="footer">LazyMint Digital Ticket</text>
      </svg>
    `;

    ticketImage = ticketImage.composite([{
      input: Buffer.from(textSvg),
      top: 0,
      left: 0
    }]);

    // Generate QR code for claim verification
    const verificationData = {
      type: 'lazymint_ticket',
      claimId: claim.id,
      campaignId: campaign.id,
      claimNumber: claim.claimNumber,
      verifyUrl: `https://lazymint.com/verify/${claim.id}`
    };

    const qrCodeBuffer = await QRCode.toBuffer(JSON.stringify(verificationData), {
      type: 'png',
      width: 150,
      margin: 1
    });

    // Add QR code to ticket
    ticketImage = ticketImage.composite([{
      input: qrCodeBuffer,
      top: 400,
      left: 600
    }]);

    // Convert to final PNG
    const finalTicketBuffer = await ticketImage.png().toBuffer();

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const fileName = `tickets/${campaign.id}/claim-${claim.id}-ticket.png`;
    const file = bucket.file(fileName);

    await file.save(finalTicketBuffer, {
      metadata: {
        contentType: 'image/png',
        metadata: {
          campaignId: campaign.id,
          claimId: claim.id,
          claimNumber: claim.claimNumber.toString(),
          createdAt: new Date().toISOString()
        }
      }
    });

    // Make file publicly readable
    await file.makePublic();

    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;

  } catch (error) {
    console.error('Error generating ticket image:', error);
    throw error;
  }
};

/**
 * Upload campaign logo
 */
export const uploadCampaignLogo = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {campaignId} = req.params;

    if (!req.user) {
      sendAuthError(res);
      return;
    }

    if (!campaignId) {
      sendValidationError(res, "Campaign ID is required");
      return;
    }

    // Check if file was uploaded
    if (!req.file) {
      sendValidationError(res, "No file uploaded");
      return;
    }

    const db = admin.firestore();
    const campaignDoc = await db.collection('campaigns').doc(campaignId).get();

    if (!campaignDoc.exists) {
      res.status(404).send({error: "Campaign not found"});
      return;
    }

    const campaign = campaignDoc.data() as Campaign;

    // Check ownership
    if (campaign.creatorId !== req.user.uid) {
      sendPermissionError(res, "Cannot upload logo for this campaign");
      return;
    }

    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      sendValidationError(res, "File must be an image");
      return;
    }

    // Resize and optimize image
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const fileName = `logos/${req.user.uid}/${campaignId}-logo.jpg`;
    const file = bucket.file(fileName);

    await file.save(optimizedBuffer, {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          campaignId: campaignId,
          uploadedBy: req.user.uid,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    // Make file publicly readable
    await file.makePublic();

    const logoUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    // Update campaign with logo URL
    await db.collection('campaigns').doc(campaignId).update({
      logoUrl,
      updatedAt: admin.firestore.Timestamp.now()
    });

    res.status(200).send({
      success: true,
      data: {
        logoUrl
      }
    });

  } catch (error) {
    sendErrorResponse(res, error);
  }
};

/**
 * Helper function to escape XML characters
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
```

#### **5.2 Update Claims Handler to Use Ticket Generation**

**Action:** Update the generateTicket function in claimHandlers.ts:

**File: `src/handlers/claimHandlers.ts` (UPDATE existing generateTicket function)**
```typescript
// REPLACE the existing generateTicket function with:
import {generateTicketImage} from "./assetHandlers";

/**
 * Generate ticket (updated implementation)
 */
async function generateTicket(claim: Claim): Promise<string> {
  try {
    const db = admin.firestore();
    
    // Get campaign data
    const campaignDoc = await db.collection('campaigns').doc(claim.campaignId).get();
    if (!campaignDoc.exists) {
      throw new Error('Campaign not found');
    }
    
    const campaign = campaignDoc.data() as Campaign;
    
    // Generate ticket image
    const ticketUrl = await generateTicketImage(claim.id, campaign, claim);
    
    console.log('Ticket generated:', {
      claimId: claim.id,
      claimNumber: claim.claimNumber,
      ticketUrl
    });

    return ticketUrl;
  } catch (error) {
    console.error('Error generating ticket:', error);
    throw error;
  }
}
```

#### **5.3 Update Main Index File for Asset Routes**

**Action:** Add asset routes to existing index.ts:

**File: `src/index.ts` (UPDATE - add to existing)**
```typescript
// ADD to existing imports
import {generateCampaignQR, uploadCampaignLogo} from "./handlers/assetHandlers";
import multer from "multer"; // Add this import

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ADD new Asset Management routes (after existing claims routes)
app.post("/campaigns/:campaignId/qr", authenticateUser, generateCampaignQR);
app.post("/campaigns/:campaignId/logo", authenticateUser, upload.single('logo'), uploadCampaignLogo);
```

#### **5.4 Update Storage Security Rules**

**Action:** Extend existing storage.rules (PRESERVE existing content):

**File: `storage.rules` (UPDATE - add to existing)**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // PRESERVE existing default deny rule
    match /{allPaths=**} {
      allow read, write: if false;
    }
    
    // PRESERVE existing user logos rules
    match /logos/{userId}/{allPaths=**} {
      allow read: if true; // Public read for logos
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // PRESERVE existing ticket backgrounds rules
    match /ticket_backgrounds/{userId}/{allPaths=**} {
      allow read: if true; // Public read for backgrounds
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // PRESERVE existing QR codes rules and EXTEND
    match /qrcodes/{campaignId}/{allPaths=**} {
      allow read: if true; // Public read for QR codes
      allow write: if false; // Only Cloud Functions can write QR codes
    }
    
    // ADD new rules for generated tickets
    match /tickets/{campaignId}/{allPaths=**} {
      allow read: if true; // Public read for tickets (they contain verification QR)
      allow write: if false; // Only Cloud Functions can generate tickets
    }
  }
}
```

---

### **Phase 6: Final Deployment and Testing**

**CRITICAL**: Deploy complete system and validate all integrations work together.

#### **6.1 Install Additional Dependencies**

**Action:** Install remaining dependencies for asset management:

```bash
cd functions

# Install multer for file uploads
npm install multer
npm install --save-dev @types/multer

# Verify all dependencies
npm list
```

#### **6.2 Final Build and Deployment**

**Action:** Deploy complete system to development environment:

```bash
# Build functions
npm run build

# Deploy to development environment
firebase use dev
firebase deploy --only functions,firestore:rules,storage:rules

# Verify deployment
firebase functions:list
```

#### **6.3 Comprehensive Testing**

**Action:** Test complete user journey:

**Test Script: `test_complete_flow.sh`**
```bash
#!/bin/bash

API_BASE="https://us-central1-lazymint-fresh-dev.cloudfunctions.net/api"

echo "🧪 Testing Complete LazyMint Flow"
echo "=================================="

# Test 1: Health Check
echo "1️⃣ Testing Health Check..."
curl -s -X GET "$API_BASE/health" | jq .
echo ""

# Test 2: List Public Campaigns
echo "2️⃣ Testing Public Campaigns..."
curl -s -X GET "$API_BASE/campaigns/public" | jq .
echo ""

# Test 3: Submit Claim (requires existing campaign)
echo "3️⃣ Testing Claim Submission..."
curl -s -X POST "$API_BASE/claims" \
  -H "Content-Type: application/json" \
  -d '{"campaignId":"test-campaign-id","email":"test@example.com"}' | jq .
echo ""

# Test 4: Check Claim Status
echo "4️⃣ Testing Claim Status..."
curl -s -X GET "$API_BASE/claims/test-claim-id/status" | jq .
echo ""

echo "✅ Basic flow testing complete"
echo "Note: Full testing requires authentication tokens and valid campaign IDs"
```

#### **Validation Checkpoint 5 (Final Verification)**

**Manual Verification Required:**
- [ ] All asset management functions work correctly
- [ ] QR code generation produces valid codes
- [ ] Ticket generation creates proper images
- [ ] File uploads work with proper validation
- [ ] Storage rules allow appropriate access
- [ ] All existing functionality preserved (users, campaigns, claims)
- [ ] Complete user journey works end-to-end

**Test Commands:**
```bash
# Final deployment test
firebase use dev
firebase deploy

# Test all endpoints
curl -X GET "https://us-central1-lazymint-fresh-dev.cloudfunctions.net/api/health"
curl -X GET "https://us-central1-lazymint-fresh-dev.cloudfunctions.net/api/campaigns/public"

# Verify security rules
firebase firestore:rules:get
firebase storage:rules:get
```

---

### **Phase 7: Production Deployment Preparation**

**CRITICAL**: Prepare for production deployment using existing workflow.

#### **7.1 Production Deployment**

**Action:** Deploy to production using existing aliases:

```bash
# Switch to production environment
firebase use prod

# Deploy to production (when ready)
firebase deploy --only functions,firestore:rules,storage:rules

# Verify production deployment
firebase functions:list
```

#### **7.2 Environment Variables and Secrets**

**Action:** Configure production secrets:

```bash
# Update production secrets with real values
echo "real-genai-api-key" | gcloud secrets create GENAI_API_KEY --data-file=- --project=lazymint-fresh

# Verify secrets are accessible
gcloud secrets versions access latest --secret="GENAI_API_KEY" --project=lazymint-fresh
```

#### **7.3 Monitoring and Logging**

**Action:** Set up monitoring for production:

```bash
# Enable Cloud Logging
gcloud logging sinks create lazymint-logs \
  bigquery.googleapis.com/projects/lazymint-fresh/datasets/logs \
  --log-filter='resource.type="cloud_function"'

# Set up alerting (configure in Google Cloud Console)
echo "Configure alerting policies in Google Cloud Console for:"
echo "- Function errors"
echo "- High latency"
echo "- Quota exceeded"
```

---

### **Final Success Validation**

**Complete System Verification:**

✅ **Foundation Integration**: Builds upon existing User Management system
✅ **Campaign Management**: Full CRUD operations with proper authentication
✅ **Claims Processing**: Email verification and ticket generation workflow
✅ **Asset Management**: QR code generation and file upload capabilities
✅ **Security**: Comprehensive Firestore and Storage rules
✅ **Deployment**: Uses existing dev/prod workflow
✅ **Monitoring**: Logging and error handling throughout

**API Endpoints Available:**
- `GET /health` - System health check
- `POST /users`, `GET /users/:uid`, `PUT /users/:uid`, `DELETE /users/:uid` - User Management (EXISTING)
- `POST /campaigns`, `GET /campaigns/:id`, `PUT /campaigns/:id`, `DELETE /campaigns/:id` - Campaign Management
- `GET /campaigns/public`, `GET /campaigns/my` - Campaign Discovery
- `POST /claims`, `POST /claims/verify`, `GET /claims/:id/status` - Claims Processing
- `GET /claims/:id/download`, `GET /campaigns/:id/claims` - Ticket Management
- `POST /campaigns/:id/qr`, `POST /campaigns/:id/logo` - Asset Management

**🎉 LazyMint Backend Extension Complete!**

The system now provides a complete backend that extends your existing User Management foundation with Campaign Management, Claims Processing, and Asset Management capabilities, all following your established patterns and maintaining your existing dev/prod workflow.

---

**END OF FIREBASE STUDIO PROMPT**



