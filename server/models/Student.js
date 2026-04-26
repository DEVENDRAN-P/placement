const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    academicInfo: {
      rollNumber: {
        type: String,
        required: true,
      },
      department: {
        type: String,
        required: true,
        enum: [
          "Computer Science",
          "Information Technology",
          "Electronics",
          "Mechanical",
          "Civil",
          "Electrical",
          "Other",
        ],
      },
      year: {
        type: Number,
        required: true,
        min: 1,
        max: 4,
      },
      semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8,
      },
      cgpa: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
      },
      sgpa: [
        {
          semester: Number,
          sgpa: Number,
        },
      ],
      attendance: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      backlogCount: {
        type: Number,
        default: 0,
      },
    },
    skills: [
      {
        name: {
          type: String,
          required: true,
        },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
          default: "Beginner",
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
    ],
    projects: [
      {
        title: {
          type: String,
          required: true,
        },
        description: String,
        technologies: [String],
        githubUrl: String,
        liveUrl: String,
        startDate: Date,
        endDate: Date,
        status: {
          type: String,
          enum: ["Completed", "In Progress", "Planned"],
          default: "Completed",
        },
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        credentialId: String,
        credentialUrl: String,
        certificateFile: String,
        verified: {
          type: Boolean,
          default: false,
        },
      },
    ],
    codingProfiles: {
      leetcode: {
        username: String,
        totalSolved: Number,
        easySolved: Number,
        mediumSolved: Number,
        hardSolved: Number,
        rating: Number,
        lastUpdated: Date,
      },
      codechef: {
        username: String,
        rating: Number,
        stars: String,
        totalSolved: Number,
        lastUpdated: Date,
      },
      codeforces: {
        username: String,
        rating: Number,
        rank: String,
        totalSolved: Number,
        lastUpdated: Date,
      },
    },
    resume: {
      fileUrl: String,
      fileName: String,
      uploadDate: Date,
      isVerified: {
        type: Boolean,
        default: false,
      },
      plagiarismScore: {
        type: Number,
        default: 0,
      },
    },
    placementStatus: {
      isPlaced: {
        type: Boolean,
        default: false,
      },
      company: String,
      role: String,
      package: Number,
      offerDate: Date,
      joiningDate: Date,
    },
    achievements: [
      {
        title: String,
        description: String,
        date: Date,
        category: {
          type: String,
          enum: ["Academic", "Coding", "Sports", "Cultural", "Other"],
        },
        level: {
          type: String,
          enum: ["College", "State", "National", "International"],
        },
      },
    ],
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      twitter: String,
    },
    isProfilePublic: {
      type: Boolean,
      default: false,
    },
    publicProfileToken: {
      token: String,
      expires: Date,
    },
    aiInsights: {
      placementProbability: Number,
      recommendedSkills: [String],
      skillGapAnalysis: String,
      careerAdvice: String,
      lastAnalyzed: Date,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    referralAppliedAt: Date,
    referralCount: {
      type: Number,
      default: 0,
    },
    referralRewards: {
      type: Number,
      default: 0,
    },
    mockInterviews: [
      {
        type: String,
        score: Number,
        notes: String,
        duration: Number,
        completedAt: Date,
      },
    ],
    videoProfile: {
      videoUrl: String,
      uploadedAt: Date,
      duration: Number,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
    },
    blockchainCredentials: [
      {
        credentialId: {
          type: String,
          required: true,
        },
        credentialType: {
          type: String,
          enum: ["degree", "certificate", "skill_badge"],
        },
        issuedAt: Date,
        status: {
          type: String,
          enum: ["issued", "verified", "revoked"],
          default: "issued",
        },
        verificationHash: String,
        verifiedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "College",
        },
        verifiedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
studentSchema.index({ "academicInfo.cgpa": -1 });
studentSchema.index({ "academicInfo.department": 1 });
studentSchema.index({ "codingProfiles.leetcode.rating": -1 });
studentSchema.index({ "codingProfiles.codeforces.rating": -1 });
studentSchema.index({ "placementStatus.isPlaced": 1 });

// Virtual for total coding problems solved
studentSchema.virtual("totalCodingProblems").get(function () {
  return (
    (this.codingProfiles.leetcode?.totalSolved || 0) +
    (this.codingProfiles.codechef?.totalSolved || 0) +
    (this.codingProfiles.codeforces?.totalSolved || 0)
  );
});

// Virtual for average coding rating
studentSchema.virtual("averageCodingRating").get(function () {
  const ratings = [
    this.codingProfiles.leetcode?.rating || 0,
    this.codingProfiles.codechef?.rating || 0,
    this.codingProfiles.codeforces?.rating || 0,
  ].filter((r) => r > 0);

  return ratings.length > 0
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0;
});

// Virtual for profile completeness score
studentSchema.virtual("profileCompleteness").get(function () {
  let score = 20; // Base score for basic info
  const checks = {
    skills: { weight: 20, present: this.skills?.length > 0 },
    projects: { weight: 20, present: this.projects?.length > 0 },
    resume: { weight: 15, present: !!this.resume?.fileUrl },
    certifications: { weight: 10, present: this.certifications?.length > 0 },
    linkedin: { weight: 10, present: !!this.socialLinks?.linkedin },
    github: { weight: 5, present: !!this.socialLinks?.github },
  };

  for (const key in checks) {
    if (checks[key].present) {
      score += checks[key].weight;
    }
  }

  return Math.min(100, score);
});

module.exports = mongoose.model("Student", studentSchema);
