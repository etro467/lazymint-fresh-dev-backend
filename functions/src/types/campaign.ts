import { Timestamp } from "firebase-admin/firestore";

export interface Campaign {
  campaignId: string;
  creatorUid: string;
  title: string;
  description: string;
  maxClaims: number;
  currentClaims: number;
  brandingImageUrl?: string; // Optional branding image
  qrCodeImageUrl?: string;   // URL to generated QR code
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: "active" | "inactive" | "completed";
}
