import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    brandname: { type: String, required: true },

    metaAds: {
      type: String,
      enum: ["yes", "no"],
      required: true,
    },

    monthlyBudget: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    // 🔔 Notification logic
    isSeen: {
      type: Boolean,
      default: false,
    },

    // Future-proof
    source: {
      type: String,
      default: "contact-form",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);
