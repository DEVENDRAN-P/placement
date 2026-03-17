const nodemailer = require("nodemailer");
require("dotenv").config();

class EmailService {
  static transporter = null;

  // Initialize email transporter
  static initializeTransporter() {
    if (this.transporter) return this.transporter;

    const emailProvider = process.env.EMAIL_PROVIDER || "gmail";

    if (emailProvider === "gmail") {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else if (emailProvider === "sendgrid") {
      const sgMail = require("@sendgrid/mail");
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      this.transporter = {
        sendMail: async (mailOptions) => {
          await sgMail.send({
            to: mailOptions.to,
            from: mailOptions.from,
            subject: mailOptions.subject,
            html: mailOptions.html,
          });
        },
      };
    }

    return this.transporter;
  }

  // Email templates
  static getEmailTemplate(templateType, data = {}) {
    const templates = {
      placement: `
        <h2>Placement Opportunity!</h2>
        <p>Dear ${data.studentName},</p>
        <p>Great news! You've been identified as a potential match for the following opportunity:</p>
        <ul>
          <li><strong>Company:</strong> ${data.companyName}</li>
          <li><strong>Role:</strong> ${data.role}</li>
          <li><strong>Package:</strong> ${data.package} LPA</li>
          <li><strong>Match Score:</strong> ${data.matchScore}%</li>
        </ul>
        <p><strong>Why you matched:</strong></p>
        <ul>
          ${data.reasons.map((reason) => `<li>${reason}</li>`).join("")}
        </ul>
        <p>
          <a href="${process.env.FRONTEND_URL}/placements/${data.placementId}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Opportunity
          </a>
        </p>
        <p>Best regards,<br>Career Intelligence Portal Team</p>
      `,

      interview: `
        <h2>Interview Notification</h2>
        <p>Dear ${data.studentName},</p>
        <p>Congratulations! You have been selected for the interview round.</p>
        <ul>
          <li><strong>Company:</strong> ${data.companyName}</li>
          <li><strong>Round:</strong> ${data.round}</li>
          <li><strong>Date & Time:</strong> ${data.dateTime}</li>
          <li><strong>Location/Link:</strong> ${data.location}</li>
        </ul>
        <p><strong>Important Links:</strong></p>
        <ul>
          <li><a href="${data.joinLink}">Join Interview</a></li>
          <li><a href="${process.env.FRONTEND_URL}/interview-prep">Interview Preparation Resources</a></li>
        </ul>
        <p>Best of luck!<br>Career Intelligence Portal Team</p>
      `,

      verification: `
        <h2>Profile Verification Required</h2>
        <p>Dear ${data.studentName},</p>
        <p>Your college has verified your profile data:</p>
        <ul>
          <li><strong>CGPA:</strong> ${data.cgpa}</li>
          <li><strong>Department:</strong> ${data.department}</li>
          <li><strong>Attendance:</strong> ${data.attendance}%</li>
          <li><strong>Verification Status:</strong> ✅ Verified</li>
        </ul>
        <p>Your profile is now more credible for recruiters. Keep building your skills!</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/student/profile" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Your Profile
          </a>
        </p>
        <p>Best regards,<br>Career Intelligence Portal Team</p>
      `,

      skillGap: `
        <h2>Your Personalized Skill Gap Analysis</h2>
        <p>Dear ${data.studentName},</p>
        <p>Based on your profile, here's your personalized career advice:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Weaknesses:</h3>
          <ul>
            ${data.weaknesses.map((w) => `<li>${w}</li>`).join("")}
          </ul>
          <h3>Recommendations:</h3>
          <ul>
            ${data.recommendations.map((r) => `<li>${r}</li>`).join("")}
          </ul>
        </div>
        <p>
          <a href="${process.env.FRONTEND_URL}/student/skill-analysis" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Full Analysis
          </a>
        </p>
        <p>Best regards,<br>Career Intelligence Portal Team</p>
      `,

      careerPrediction: `
        <h2>Your Career Prediction Report</h2>
        <p>Dear ${data.studentName},</p>
        <p>Based on AI analysis of your profile:</p>
        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <h2 style="color: #0066cc; margin: 0;">${data.placementProbability}% Placement Probability</h2>
        </div>
        <p><strong>Best suited for:</strong> ${data.preferredCompanyTypes.join(", ")}</p>
        <p><strong>Expected package range:</strong> ${data.expectedPackageMin} - ${data.expectedPackageMax} LPA</p>
        <p><strong>To improve chances:</strong></p>
        <ul>
          ${data.improvementSuggestions.map((s) => `<li>${s}</li>`).join("")}
        </ul>
        <p>
          <a href="${process.env.FRONTEND_URL}/student/career-prediction" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Detailed Report
          </a>
        </p>
        <p>Best regards,<br>Career Intelligence Portal Team</p>
      `,

      preparationResourcesL: `
        <h2>Interview Preparation Resources</h2>
        <p>Dear ${data.studentName},</p>
        <p>We've compiled resources to help you prepare for your interview at ${data.companyName}:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>📚 Resources:</h3>
          <ul>
            ${data.resources.map((r) => `<li><a href="${r.link}">${r.title}</a> - ${r.description}</li>`).join("")}
          </ul>
        </div>
        <p><strong>Best of luck with your preparation!</strong></p>
        <p>
          <a href="${process.env.FRONTEND_URL}/resources" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Browse All Resources
          </a>
        </p>
        <p>Best regards,<br>Career Intelligence Portal Team</p>
      `,
    };

    return templates[templateType] || templates.placement;
  }

  // Send single email
  static async sendEmail(to, subject, htmlContent, replyTo = null) {
    try {
      this.initializeTransporter();

      const mailOptions = {
        from: process.env.EMAIL_USER || "noreply@careerintelligence.com",
        to,
        subject,
        html: htmlContent,
        replyTo: replyTo || process.env.EMAIL_USER,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log("Email sent:", info.messageId);
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Email sending error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Send batch emails (for placement notifications)
  static async sendBatchEmails(
    recipients,
    subject,
    templateType,
    templateData,
  ) {
    try {
      const results = [];

      for (const recipient of recipients) {
        try {
          const htmlContent = this.getEmailTemplate(templateType, {
            ...templateData,
            studentName: recipient.name,
            studentEmail: recipient.email,
          });

          const result = await this.sendEmail(
            recipient.email,
            subject,
            htmlContent,
          );
          results.push({
            email: recipient.email,
            status: "sent",
            messageId: result.messageId,
          });
        } catch (error) {
          results.push({
            email: recipient.email,
            status: "failed",
            error: error.message,
          });
        }
      }

      return {
        success: true,
        totalSent: results.filter((r) => r.status === "sent").length,
        totalFailed: results.filter((r) => r.status === "failed").length,
        results,
      };
    } catch (error) {
      console.error("Batch email error:", error);
      throw error;
    }
  }

  // Send placement notification
  static async sendPlacementNotification(
    student,
    placement,
    matchScore,
    reasons,
  ) {
    const htmlContent = this.getEmailTemplate("placement", {
      studentName: student.user.firstName || "Student",
      companyName: placement.company,
      role: placement.role,
      package: placement.package,
      matchScore,
      reasons,
      placementId: placement._id,
    });

    return this.sendEmail(
      student.user.email,
      `Placement Opportunity - ${placement.company}`,
      htmlContent,
    );
  }

  // Send interview notification
  static async sendInterviewNotification(student, placement, interviewDetails) {
    const htmlContent = this.getEmailTemplate("interview", {
      studentName: student.user.firstName || "Student",
      companyName: placement.company,
      round: interviewDetails.round,
      dateTime: interviewDetails.dateTime,
      location: interviewDetails.location,
      joinLink: interviewDetails.joinLink,
    });

    return this.sendEmail(
      student.user.email,
      `Interview Notification - ${placement.company}`,
      htmlContent,
    );
  }

  // Send verification notification
  static async sendVerificationNotification(student, verificationData) {
    const htmlContent = this.getEmailTemplate("verification", {
      studentName: student.user.firstName || "Student",
      cgpa: verificationData.cgpa,
      department: verificationData.department,
      attendance: verificationData.attendance,
    });

    return this.sendEmail(
      student.user.email,
      "Profile Verification Complete",
      htmlContent,
    );
  }

  // Send skill gap analysis
  static async sendSkillGapReport(student, analysis) {
    const htmlContent = this.getEmailTemplate("skillGap", {
      studentName: student.user.firstName || "Student",
      weaknesses: analysis.weaknesses,
      recommendations: analysis.recommendations,
    });

    return this.sendEmail(
      student.user.email,
      "Your Personalized Skill Gap Analysis",
      htmlContent,
    );
  }

  // Send career prediction report
  static async sendCareerPredictionReport(student, prediction) {
    const htmlContent = this.getEmailTemplate("careerPrediction", {
      studentName: student.user.firstName || "Student",
      placementProbability: Math.round(prediction.placementProbability),
      preferredCompanyTypes: prediction.preferredCompanyTypes,
      expectedPackageMin: prediction.expectedPackageMin,
      expectedPackageMax: prediction.expectedPackageMax,
      improvementSuggestions: prediction.improvementSuggestions,
    });

    return this.sendEmail(
      student.user.email,
      "Your AI Career Prediction Report",
      htmlContent,
    );
  }
}

module.exports = EmailService;
