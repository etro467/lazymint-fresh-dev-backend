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