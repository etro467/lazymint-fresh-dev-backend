import {Timestamp} from "firebase-admin/firestore";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  subscriptionTier: "free" | "basic" | "pro";
  subscriptionStatus: "active" | "canceled" | "past_due";
  stripeCustomerId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
