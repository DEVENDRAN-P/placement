const nodemailer = require("nodemailer");
const Student = require("../models/Student");
const User = require("../models/User");

// Bull queue disabled - no Redis available
// Create a mock email queue for testing

const emailQueue = {
  add: async (data, options) => {
    console.log("Email task queued (mock):", data);
    return { id: Math.random().toString(36).substr(2, 9) };
  },
  process: () => {},
  on: () => {},
};

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "localhost",
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Process jobs from the queue
emailQueue.process(async (job) => {
  const { studentIds, subject, message } = job.data;

  const students = await Student.find({ _id: { $in: studentIds } })
    .populate("user", "email")
    .select("user profile");

  const emailPromises = students.map((student) => {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: student.user.email,
      subject: subject,
      html: `
        <h2>Hello ${student.profile.firstName},</h2>
        <div style="margin: 20px 0; line-height: 1.6;">
          ${message}
        </div>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This is an automated message from your placement cell.
        </p>
      `,
    };
    return transporter.sendMail(mailOptions);
  });

  return Promise.all(emailPromises);
});

// Event listeners for logging
emailQueue.on("completed", (job, result) => {
  console.log(
    `✅ Email job ${job.id} completed for ${job.data.studentIds.length} students.`,
  );
});

emailQueue.on("failed", (job, err) => {
  console.error(`❌ Email job ${job.id} failed with error: ${err.message}`);
  // Here you could add logic to move to a dead-letter queue or alert an admin
});

module.exports = emailQueue;
