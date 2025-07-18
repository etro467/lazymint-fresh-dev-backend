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

**END OF CORRECTED FIREBASE STUDIO PROMPT**