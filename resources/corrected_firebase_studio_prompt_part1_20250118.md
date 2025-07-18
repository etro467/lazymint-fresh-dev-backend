# Corrected Firebase Studio Prompt for LazyMint Backend - Part 1
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