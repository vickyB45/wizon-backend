import express from "express";
import Blog from "../models/blog.js"

const router = express.Router();

/* =====================================================
   ➤ CREATE BLOG (POST)
   ===================================================== */
router.post("/", async (req, res) => {
  try {
    const { title, excerpt, content, tags, featuredImage, status } = req.body;

    // 🔐 Basic validation
    if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
      return res.status(400).json({
        success: false,
        msg: "Title, excerpt and content are required fields.",
      });
    }

    // Tags formatting (ensure array)
    let formattedTags = [];
    if (typeof tags === "string") {
      formattedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (Array.isArray(tags)) {
      formattedTags = tags.map((t) => t.trim()).filter(Boolean);
    }

    // Create blog safely
    const blog = await Blog.create({
      title: title.trim(),
      excerpt: excerpt.trim(),
      content,
      tags: formattedTags,
      featuredImage: featuredImage || "",
      status: status || "Published",
    });

    return res.status(201).json({
      success: true,
      msg: "Blog created successfully.",
      blog,
    });
  } catch (err) {
    console.error("❌ Blog Create Error:", err);
    return res.status(500).json({
      success: false,
      msg: "Internal server error while creating blog.",
    });
  }
});

/* =====================================================
   ➤ GET ALL BLOGS (GET)
   ===================================================== */
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (err) {
    console.error("❌ Get Blogs Error:", err);
    return res.status(500).json({
      success: false,
      msg: "Failed to fetch blogs.",
    });
  }
});

/* =====================================================
   ➤ GET SINGLE BLOG (GET)
   ===================================================== */
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        msg: "Blog not found.",
      });
    }

    return res.status(200).json({
      success: true,
      blog,
    });
  } catch (err) {
    console.error("❌ Get Blog Error:", err);
    return res.status(400).json({
      success: false,
      msg: "Invalid blog ID.",
    });
  }
});

/* =====================================================
   ➤ DELETE BLOG (DELETE)
   ===================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        msg: "Blog not found.",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Blog deleted successfully.",
    });
  } catch (err) {
    console.error("❌ Delete Blog Error:", err);
    return res.status(500).json({
      success: false,
      msg: "Failed to delete blog.",
    });
  }
});

/* =====================================================
   ➤ UPDATE BLOG (PATCH)
   ===================================================== */
router.patch("/:id", async (req, res) => {
  try {
    const allowedFields = [
      "title",
      "excerpt",
      "content",
      "tags",
      "featuredImage",
      "status",
    ];

    // Only allow safe update fields
    const dataToUpdate = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        dataToUpdate[key] = req.body[key];
      }
    });

    // Re-process tags if needed
    if (typeof dataToUpdate.tags === "string") {
      dataToUpdate.tags = dataToUpdate.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      dataToUpdate,
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        msg: "Blog not found.",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Blog updated successfully.",
      blog: updatedBlog,
    });
  } catch (err) {
    console.error("❌ Update Blog Error:", err);
    return res.status(400).json({
      success: false,
      msg: "Failed to update blog.",
    });
  }
});

export default router;
