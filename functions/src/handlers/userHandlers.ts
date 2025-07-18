import {Request, Response} from "express";
import * as admin from "firebase-admin";
import {User} from "../types/user";
import {validateUserData, sanitizeUserForResponse} from "../utils/auth";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {email, password, displayName} = req.body;

    if (!email || !password || !displayName) {
      res.status(400).send({error: "Missing required fields"});
      return;
    }

    // Validate user data
    const validation = validateUserData({email, displayName});
    if (!validation.isValid) {
      res.status(400).send({error: validation.error});
      return;
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    const user: User = {
      uid: userRecord.uid,
      email: userRecord.email || "",
      displayName: userRecord.displayName || "",
      subscriptionTier: "free",
      subscriptionStatus: "active",
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    await admin.firestore().collection("users").doc(userRecord.uid).set(user);

    res.status(201).send(sanitizeUserForResponse(user));
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof Error && error.message.includes("email-already-exists")) {
      res.status(409).send({error: "Email already exists"});
    } else {
      res.status(500).send({error: "Something went wrong"});
    }
  }
};

export const getUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {uid} = req.params;

    if (!uid) {
      res.status(400).send({error: "User ID is required"});
      return;
    }

    const userDoc = await admin.firestore().collection("users").doc(uid).get();

    if (!userDoc.exists) {
      res.status(404).send({error: "User not found"});
      return;
    }

    const userData = userDoc.data() as User;
    res.status(200).send(sanitizeUserForResponse(userData));
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).send({error: "Something went wrong"});
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {uid} = req.params;
    const updateData = req.body;

    if (!uid) {
      res.status(400).send({error: "User ID is required"});
      return;
    }

    // Remove fields that shouldn't be updated directly
    const {uid: _, createdAt, ...allowedUpdates} = updateData;

    // Validate update data
    if (Object.keys(allowedUpdates).length === 0) {
      res.status(400).send({error: "No valid fields to update"});
      return;
    }

    // Validate user data if email or displayName are being updated
    if (allowedUpdates.email || allowedUpdates.displayName) {
      const validation = validateUserData(allowedUpdates);
      if (!validation.isValid) {
        res.status(400).send({error: validation.error});
        return;
      }
    }

    // Check if user exists
    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    if (!userDoc.exists) {
      res.status(404).send({error: "User not found"});
      return;
    }

    // Update Firebase Auth if email or displayName changed
    if (allowedUpdates.email || allowedUpdates.displayName) {
      const authUpdates: {email?: string; displayName?: string} = {};
      if (allowedUpdates.email) authUpdates.email = allowedUpdates.email;
      if (allowedUpdates.displayName) authUpdates.displayName = allowedUpdates.displayName;
      
      await admin.auth().updateUser(uid, authUpdates);
    }

    // Update Firestore document
    const updatedData = {
      ...allowedUpdates,
      updatedAt: admin.firestore.Timestamp.now(),
    };

    await admin.firestore().collection("users").doc(uid).update(updatedData);

    // Get updated user data
    const updatedUserDoc = await admin.firestore().collection("users").doc(uid).get();
    const updatedUser = updatedUserDoc.data() as User;

    res.status(200).send(sanitizeUserForResponse(updatedUser));
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof Error && error.message.includes("email-already-exists")) {
      res.status(409).send({error: "Email already exists"});
    } else {
      res.status(500).send({error: "Something went wrong"});
    }
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {uid} = req.params;

    if (!uid) {
      res.status(400).send({error: "User ID is required"});
      return;
    }

    // Check if user exists in Firestore
    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    if (!userDoc.exists) {
      res.status(404).send({error: "User not found"});
      return;
    }

    // Delete from Firebase Auth
    await admin.auth().deleteUser(uid);

    // Delete from Firestore
    await admin.firestore().collection("users").doc(uid).delete();

    res.status(200).send({message: "User deleted successfully"});
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error instanceof Error && error.message.includes("user-not-found")) {
      res.status(404).send({error: "User not found"});
    } else {
      res.status(500).send({error: "Something went wrong"});
    }
  }
};
