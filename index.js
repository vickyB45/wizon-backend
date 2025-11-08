import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

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

// ✅ Root route
app.get("/", (req, res) => {
  res.send(`
    <div style="font-family: Arial; padding: 40px; background: #f9f9f9; text-align:center;">
      <h1 style="color:#222;">🚀 Wizon Mail Server is Live</h1>
      <p style="color:#555;">Everything is working perfectly. Ready to send emails 💌</p>
      <hr style="margin:20px 0;"/>
      <p style="font-size:13px; color:#888;">Environment: ${
        process.env.MODE || "production"
      }</p>
    </div>
  `);
});

// ✅ Send Mail route
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

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; color: #333; background: #f9f9f9; padding: 20px;">
        <h2 style="color: #222; text-align:center;">🚀 New Consultation Request</h2>
        <p style="font-size: 16px;">You’ve received a new form submission from <b>Wizon</b>. Details are below:</p>
        
        <div style="background:#fff; border-radius:10px; padding:20px; border:1px solid #ddd;">
          <p><b>👤 Name:</b> ${firstname} ${lastname}</p>
          <p><b>📞 Phone:</b> ${phone}</p>
          <p><b>📧 Email:</b> ${email}</p>
          <p><b>🏷️ Brand Name:</b> ${brandname}</p>
          <p><b>📢 Ads Type:</b> ${ads}</p>
          <p><b>💰 Monthly Budget:</b> ${budget}</p>
          <p><b>📝 Description:</b> ${disc}</p>
        </div>

        <p style="font-size:14px; color:#666; margin-top:20px;">
          — <b>Wizon Form System</b> <br/>
          <span style="font-style:italic;">Automated message. Please do not reply directly.</span>
        </p>
      </div>
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

    res.status(200).json({ success: true, msg: "Mail sent successfully ✨" });
  } catch (error) {
    console.error("Error sending mail:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`🚀 Wizon Mail Server running on port ${process.env.PORT}`)
);
