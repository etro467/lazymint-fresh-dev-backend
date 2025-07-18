import {Response} from "express";
import * as admin from "firebase-admin";
import {AuthenticatedRequest} from "../shared/middleware";
import {sendErrorResponse, sendValidationError, sendAuthError, sendPermissionError} from "../shared/errors";
import {Campaign} from "../types/campaign";
import {Claim} from "../types/claim";
import sharp from "sharp"; 
import * as QRCode from "qrcode";
import { Buffer } from 'buffer';
import axios from 'axios';

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

    const campaign: Campaign = campaignDoc.data() as Campaign; // Explicitly type campaign here

    // Check ownership
    if (campaign.creatorUid !== req.user.uid) { // Changed to creatorUid
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
        const logoResponse = await axios.get(campaign.logoUrl, { responseType: 'arraybuffer' });
        const logoBuffer = Buffer.from(logoResponse.data);
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

    const campaign: Campaign = campaignDoc.data() as Campaign; // Explicitly type campaign here

    // Check ownership
    if (campaign.creatorUid !== req.user.uid) { // Changed to creatorUid
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
  if (!unsafe) return '';
  
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}