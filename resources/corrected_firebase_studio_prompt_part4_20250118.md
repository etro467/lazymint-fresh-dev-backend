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