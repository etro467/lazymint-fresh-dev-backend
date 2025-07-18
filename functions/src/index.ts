import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import {createUser, getUser, updateUser, deleteUser} from "./handlers/userHandlers";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Initialize Express app
const app = express();
app.use(cors({origin: true}));
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send({status: "OK", timestamp: new Date().toISOString()});
});

// User Management API routes
app.post("/users", createUser);           // Create user
app.get("/users/:uid", getUser);          // Get user by UID
app.put("/users/:uid", updateUser);       // Update user
app.delete("/users/:uid", deleteUser);    // Delete user

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).send({error: "Route not found"});
});

// Expose Express app as a Cloud Function
export const api = functions.https.onRequest(app);
