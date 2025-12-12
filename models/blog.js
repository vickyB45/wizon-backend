import mongoose from "mongoose";

const BlogShcema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    excerpt: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    featuredImage: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Published",
    },
  },
  { timestamps: true }
);

// prevent model overwrite issue in dev mode
export default mongoose.models.Blog || mongoose.model("Blog", BlogShcema);
