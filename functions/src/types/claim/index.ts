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
