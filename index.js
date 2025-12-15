import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import blogRoutes from "./routes/blogRoutes.js";
import adminRoute from "./routes/adminRoute.js";
import contactAdminRoutes from "./routes/contactAdminRoutes.js"
import systemRoutes from "./routes/systemRoute.js";


// server.js me ye missing hai:
import cookieParser from "cookie-parser";
import contact from "./models/contact.js";

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

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⭐ Blog Routes
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/admin/contacts", contactAdminRoutes);
app.use("/api/admin/system", systemRoutes);
// ROOT
app.get("/", (req, res) => {
  res.send(`<h2>🚀 Wizon Mail + Blog Server Running</h2>`);
});

// MAIL + SAVE CONTACTs
app.post("/send-mail", async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      phone,
      email,
      brandname,
      ads, // yes / no
      budget, // monthly budget
      disc, // description
    } = req.body;

    // ---------------------------
    // 1️⃣ Validation
    // ---------------------------
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
      return res.status(400).json({
        success: false,
        msg: "Please fill all the fields",
      });
    }

    // ---------------------------
    // 2️⃣ Save to DB
    // ---------------------------
    const contacts = await contact.create({
      firstname,
      lastname,
      phone,
      email,
      brandname,
      metaAds: ads.toLowerCase(),
      monthlyBudget: budget,
      description: disc,
      source: "contacts-form",
    });

    // ---------------------------
    // 3️⃣ Send Mail (SMTP)
    // ---------------------------
    const htmlMessage = `
      <h3>New Contacts Form Submission</h3>
      <p><strong>Name:</strong> ${firstname} ${lastname}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Brand:</strong> ${brandname}</p>
      <p><strong>Meta Ads:</strong> ${ads}</p>
      <p><strong>Monthly Budget:</strong> ${budget}</p>
      <p><strong>Description:</strong> ${disc}</p>
    `;

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

    // ---------------------------
    // 4️⃣ Success Response
    // ---------------------------
    return res.status(200).json({
      success: true,
      msg: "Form submitted successfully",
      contactsId: contacts._id,
    });
  } catch (error) {
    console.error("❌ Contacts form error:", error);

    return res.status(500).json({
      success: false,
      msg: "Server error while submitting form",
    });
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
