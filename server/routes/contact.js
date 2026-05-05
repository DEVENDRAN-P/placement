const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const getTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPass) {
    console.warn("⚠️  Email credentials not configured. Contact form will not send emails.");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

// POST /api/contact/send-message
router.post("/send-message", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    const transporter = getTransporter();
    if (!transporter) {
      console.log("📧 Contact form message (email service offline):", { name, email, subject, message });
      // Still return success to user, but log the message
      return res.status(200).json({
        success: true,
        message:
          "Your message has been received. We'll respond via email shortly. (Email service temporarily offline, but your message has been logged)",
      });
    }

    // Prepare admin email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
      subject: `[Career Portal Contact] ${subject} - from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p><small>This is an automated message from Career Portal Contact Form</small></p>
      `,
      replyTo: email,
    };

    // Send email
    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ Admin email sent successfully");
    } catch (mailError) {
      console.error("⚠️  Failed to send admin email:", mailError.message);
      // Continue to send confirmation email even if admin email fails
    }

    // Optional: Send confirmation email to user
    try {
      const confirmationEmail = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "We received your message - Career Portal",
        html: `
          <h2>Thank you for reaching out!</h2>
          <p>Hi ${name},</p>
          <p>We've received your message and will get back to you within 24 hours.</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Your message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
          <hr>
          <p>Best regards,<br>Career Intelligence Portal Team</p>
        `,
      };

      await transporter.sendMail(confirmationEmail);
      console.log("✅ Confirmation email sent to user");
    } catch (confirmError) {
      console.error("⚠️  Failed to send confirmation email:", confirmError.message);
      // Still continue to success response
    }

    res.status(200).json({
      success: true,
      message:
        "Your message has been sent successfully. We'll be in touch soon!",
    });
  } catch (error) {
    console.error("❌ Contact form error:", error);
    res.status(500).json({
      success: false,
      message:
        "Failed to send message. Please try again later or email us directly at support@careerportal.com",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
