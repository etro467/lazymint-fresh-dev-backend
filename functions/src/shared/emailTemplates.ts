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