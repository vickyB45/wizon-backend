import express from "express";
import Blog from "../models/blog.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

/* =====================================================
   ➤ CREATE BLOG (ADMIN ONLY)
   ===================================================== */
router.post("/", adminAuth, async (req, res) => {
  try {
    const { title, excerpt, content, tags, featuredImage, status } = req.body;

    if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
      return res.status(400).json({
        success: false,
        msg: "Title, excerpt and content are required.",
      });
    }

    // Normalize tags
    let formattedTags = [];
    if (typeof tags === "string") {
      formattedTags = tags.split(",").map(t => t.trim()).filter(Boolean);
    } else if (Array.isArray(tags)) {
      formattedTags = tags.map(t => t.trim()).filter(Boolean);
    }

    const blog = await Blog.create({
      title: title.trim(),
      excerpt: excerpt.trim(),
      content,
      tags: formattedTags,
      featuredImage: featuredImage || "",
      status: status || "Published", // Draft / Published
    });

    res.status(201).json({
      success: true,
      msg: "Blog created successfully",
      blog,
    });
  } catch (err) {
    console.error("❌ Blog Create Error:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to create blog",
    });
  }
});

/* =====================================================
   ➤ GET ALL BLOGS (PUBLIC – ONLY PUBLISHED)
   ===================================================== */

/* =====================================================
   ➤ GET SINGLE BLOG (PUBLIC – ONLY PUBLISHED)
   ===================================================== */
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findOne({
      _id: req.params.id,
      status: "Published",
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        msg: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (err) {
    console.error("❌ Get Blog Error:", err);
    res.status(400).json({
      success: false,
      msg: "Invalid blog ID",
    });
  }
});

/* =====================================================
   ➤ GET ALL BLOGS (ADMIN – DRAFT + PUBLISHED)
   ===================================================== */
router.get("/", adminAuth, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (err) {
    console.error("❌ Admin Get Blogs Error:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch blogs",
    });
  }
});

/* =====================================================
   ➤ UPDATE BLOG (ADMIN ONLY)
   ===================================================== */
router.patch("/:id", adminAuth, async (req, res) => {
  try {
    const allowedFields = [
      "title",
      "excerpt",
      "content",
      "tags",
      "featuredImage",
      "status",
    ];

    const dataToUpdate = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        dataToUpdate[key] = req.body[key];
      }
    });

    if (dataToUpdate.title) {
      dataToUpdate.title = dataToUpdate.title.trim();
    }
    if (dataToUpdate.excerpt) {
      dataToUpdate.excerpt = dataToUpdate.excerpt.trim();
    }

    if (typeof dataToUpdate.tags === "string") {
      dataToUpdate.tags = dataToUpdate.tags
        .split(",")
        .map(t => t.trim())
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
        msg: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (err) {
    console.error("❌ Update Blog Error:", err);
    res.status(400).json({
      success: false,
      msg: "Failed to update blog",
    });
  }
});

/* =====================================================
   ➤ DELETE BLOG (ADMIN ONLY – SOFT DELETE)
   ===================================================== */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        msg: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Blog deleted permanently",
    });
  } catch (err) {
    console.error("❌ Delete Blog Error:", err);
    return res.status(500).json({
      success: false,
      msg: "Failed to delete blog",
    });
  }
});

export default router;
