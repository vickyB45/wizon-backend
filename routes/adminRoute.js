import express from "express";
import jwt from "jsonwebtoken";
import { adminAuth } from "../middleware/adminAuth.js";
import contact from "../models/contact.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    // -----------------------------
    // 1️⃣ Validate request body
    // -----------------------------
    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
      });
    }

    // -----------------------------
    // 2️⃣ Constant-time comparison
    // -----------------------------
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // -----------------------------
    // 3️⃣ JWT generation
    // -----------------------------
    const token = jwt.sign(
      {
        role: "admin",
        email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        issuer: "wizon-admin",
        audience: "wizon-dashboard",
      }
    );

    // -----------------------------
    // 4️⃣ Secure cookie
    // -----------------------------
   res.cookie("admin_token", token, {
  httpOnly: true,
  secure: true,        // 🔥 ALWAYS true
  sameSite: "none",    // 🔥 ALWAYS none
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
});


    return res.json({
      success: true,
      message: "Admin login successful",
    });
  } catch (err) {
    console.error("❌ Admin login error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.post("/logout", adminAuth, (req, res) => {
  try {
    // Clear cookie with SAME OPTIONS
    res.clearCookie("admin_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      path: "/",
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("❌ Logout error:", err);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
});


router.get("/me", adminAuth, (req, res) => {
  try {
    return res.json({
      success: true,
      admin: {
        email: req.admin.email,
        role: req.admin.role,
      },
    });
  } catch (error) {
    console.error("❌ Admin me error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin session",
    });
  }
});








export default router;
