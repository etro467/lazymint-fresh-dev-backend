import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";

// PRESERVE existing imports
import {createUser, getUser, updateUser, deleteUser} from "./handlers/userHandlers";

// ADD new imports
import {
  createCampaign,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  listUserCampaigns,
  listPublicCampaigns
} from "./handlers/campaignHandlers";
import {authenticateUser, optionalAuth} from "./shared/middleware";
import multer from "multer"; // Add this import
import { generateCampaignQR, uploadCampaignLogo } from "./handlers/assetHandlers"; // Add this import

// ADD to existing imports
import {
  processClaim,
  verifyClaim,
  getClaimStatus,
  listCampaignClaims,
  downloadTicket
} from "./handlers/claimHandlers";

// Initialize Firebase Admin SDK (already done)
admin.initializeApp();

// Initialize Express app (already configured)
const app = express();
app.use(cors({origin: true}));
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// PRESERVE existing health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send({status: "OK", timestamp: new Date().toISOString()});
});

// PRESERVE existing User Management routes
app.post("/users", createUser);
app.get("/users/:uid", getUser);
app.put("/users/:uid", updateUser);
app.delete("/users/:uid", deleteUser);

// ADD new Campaign Management routes
app.post("/campaigns", authenticateUser, createCampaign);
app.get("/campaigns/public", optionalAuth, listPublicCampaigns);
app.get("/campaigns/my", authenticateUser, listUserCampaigns);
app.get("/campaigns/:id", optionalAuth, getCampaign);
app.put("/campaigns/:id", authenticateUser, updateCampaign);
app.delete("/campaigns/:id", authenticateUser, deleteCampaign);

// ADD new Asset Management routes (after existing claims routes)
app.post("/campaigns/:campaignId/qr", authenticateUser, generateCampaignQR);
app.post("/campaigns/:campaignId/logo", authenticateUser, upload.single('logo'), uploadCampaignLogo);

// ADD new Claims Processing routes (after existing campaign routes)
app.post("/claims", processClaim);
app.post("/claims/verify", verifyClaim);
app.get("/claims/:claimId/status", getClaimStatus);
app.get("/claims/:claimId/download", downloadTicket);
app.get("/campaigns/:campaignId/claims", authenticateUser, listCampaignClaims);

// PRESERVE existing 404 handler
app.use("*", (req, res) => {
  res.status(404).send({error: "Route not found"});
});

// PRESERVE existing function export
export const api = functions.https.onRequest(app);
