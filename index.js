import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // just in case

// ---------- ROUTE ----------
app.post("/send-mail", async (req, res) => {
  try {
    let formData = [];

    // Handle both: { formData: [...] } or direct array
    if (req.body.formData) {
      formData = req.body.formData;
    } else {
      formData = req.body;
    }

    // Validate
    if (!Array.isArray(formData) || formData.length === 0) {
      return res.status(400).json({ success: false, msg: "No form data provided" });
    }

    // Format email
    let formattedMessage = "";
    formData.forEach((item, idx) => {
      formattedMessage += `${idx + 1}. ${item.label}\nAnswer: ${item.value || "N/A"}\n\n`;
    });

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Lead Form" <${process.env.EMAIL_USER}>`,
      to: process.env.TO_EMAIL,
      subject: "📩 New Form Submission",
      text: formattedMessage,
    });

    res.json({ success: true, msg: "Mail sent successfully" });
  } catch (error) {
    console.error("Error sending mail:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
