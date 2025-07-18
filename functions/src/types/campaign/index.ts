import {Timestamp} from "firebase-admin/firestore";

export interface Campaign {
  id: string;
  creatorId: string; // Reverted to creatorId
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
