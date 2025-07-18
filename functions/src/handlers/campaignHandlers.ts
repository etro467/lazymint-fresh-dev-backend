import {Request, Response} from "express";
import * as admin from "firebase-admin";
import {Campaign, CampaignCreateRequest, CampaignUpdateRequest, CampaignStatus} from "../types/campaign";
import {validateCampaignData, validateCampaignUpdateData} from "../shared/validation"; // Corrected import
import {sendErrorResponse, sendValidationError, sendAuthError, sendPermissionError} from "../shared/errors";
import {AuthenticatedRequest} from "../shared/middleware";
// import {sanitizeUserForResponse} from "../utils/auth"; // Removed as it's not directly used here

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
      const validation = validateCampaignUpdateData(updateData);
      if (!validation.isValid) {
        throw new Error(validation.error);
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
