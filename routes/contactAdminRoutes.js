import express from "express";
import contact from "../models/contact.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

/* =====================================================
   ✅ TOTAL CONTACTS COUNT
   ===================================================== */
router.get("/total", adminAuth, async (req, res) => {
  try {
    const total = await contact.countDocuments();

    return res.json({
      success: true,
      total,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch total contacts",
    });
  }
});

/* =====================================================
   ✅ CONTACT STATS (SEEN / UNSEEN)
   ===================================================== */
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const total = await contact.countDocuments();
    const unseen = await contact.countDocuments({ isSeen: false });
    const seen = total - unseen;

    return res.json({
      success: true,
      total,
      seen,
      unseen,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact stats",
    });
  }
});

/* =====================================================
   ✅ GET ALL CONTACTS (ADMIN TABLE)
   ===================================================== */
router.get("/", adminAuth, async (req, res) => {
  try {
    const contacts = await contact.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
    });
  }
});

/* =====================================================
   ✅ GET SINGLE CONTACT (DETAIL PAGE)
   ===================================================== */
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const singleContact = await contact.findById(req.params.id);

    if (!singleContact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.json({
      success: true,
      data: singleContact,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid contact ID",
    });
  }
});

/* =====================================================
   ✅ MARK CONTACT AS SEEN (NOTIFICATION LOGIC)
   ===================================================== */
router.patch("/:id/seen", adminAuth, async (req, res) => {
  try {
    await contact.findByIdAndUpdate(req.params.id, {
      isSeen: true,
    });

    return res.json({
      success: true,
      message: "Contact marked as seen",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update contact",
    });
  }
});

export default router;
