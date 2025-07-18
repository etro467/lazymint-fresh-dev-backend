import {Request, Response} from "express";
import * as admin from "firebase-admin";
import {Claim, ClaimRequest, ClaimVerification, ClaimStatus} from "../types/claim";
import {Campaign} from "../types/campaign";
import {validateClaimData} from "../shared/validation";
import {sendErrorResponse, sendValidationError, sendAuthError, sendPermissionError} from "../shared/errors";
import {AuthenticatedRequest} from "../shared/middleware";
import {validateUserData} from "../utils/auth"; // Import existing validation
import * as crypto from "crypto";
import { generateTicketImage } from "./assetHandlers"; // Import for ticket generation
import { generateVerificationEmail } from "../shared/emailTemplates"; // Import email template

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
