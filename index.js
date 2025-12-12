import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import blogRoutes from "./routes/blogRoutes.js";

dotenv.config();

// ⭐ Connect MongoDB
connectDB();

const app = express();

app.use(
  cors({
    origin:
      process.env.MODE === "development"
        ? "http://localhost:5173"
        : process.env.ORIGIN_CLIENT,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⭐ Blog Routes
app.use("/api/blogs", blogRoutes);

// ROOT
app.get("/", (req, res) => {
  res.send(`<h2>🚀 Wizon Mail + Blog Server Running</h2>`);
});

// MAIL
app.post("/send-mail", async (req, res) => {
  try {
    const { firstname, lastname, phone, email, brandname, ads, budget, disc } =
      req.body;

    if (
      !firstname ||
      !lastname ||
      !phone ||
      !email ||
      !brandname ||
      !ads ||
      !budget ||
      !disc
    ) {
      return res
        .status(400)
        .json({ success: false, msg: "Please fill all the fields" });
    }

    const htmlMessage = `...`; // unchanged

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Wizon Web" <${process.env.EMAIL_USER}>`,
      to: process.env.TO_EMAIL,
      subject: "🧾 New Brand Consultation Form Submission",
      html: htmlMessage,
    });

    res.status(200).json({ success: true, msg: "Mail sent successfully ✨" });
  } catch (error) {
    console.error("Error sending mail:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
