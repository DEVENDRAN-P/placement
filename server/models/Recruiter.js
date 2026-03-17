const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    industry: {
      type: String,
      required: true,
      enum: ['IT Services', 'Product', 'Consulting', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Other']
    },
    size: {
      type: String,
      enum: ['Startup (<50)', 'Small (50-200)', 'Medium (200-1000)', 'Large (1000-5000)', 'Enterprise (>5000)']
    },
    website: String,
    logo: String,
    description: String
  },
  companyAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  hrDetails: {
    name: {
      type: String,
      required: true
    },
    designation: {
      type: String,
      required: true
    },
    email: String,
    phone: String,
    linkedin: String
  },
  verificationStatus: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: String,
    verifiedDate: Date,
    documents: [String]
  },
  subscription: {
    plan: {
      type: String,
      enum: ['Basic', 'Premium', 'Enterprise'],
      default: 'Basic'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    remainingCredits: {
      type: Number,
      default: 50
    }
  },
  preferences: {
    targetColleges: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College'
    }],
    departments: [String],
    cgpaCutoff: {
      type: Number,
      min: 0,
      max: 10,
      default: 6.0
    },
    backlogAllowed: {
      type: Boolean,
      default: true
    },
    maxBacklogs: {
      type: Number,
      default: 2
    },
    skillsRequired: [String],
    experienceRequired: {
      type: String,
      enum: ['Fresher', '0-1 years', '1-3 years', '3-5 years', '5+ years'],
      default: 'Fresher'
    }
  },
  statistics: {
    totalJobsPosted: {
      type: Number,
      default: 0
    },
    totalApplications: {
      type: Number,
      default: 0
    },
    totalInterviews: {
      type: Number,
      default: 0
    },
    totalHires: {
      type: Number,
      default: 0
    },
    averageHiringTime: Number,
    successRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
recruiterSchema.index({ 'company.name': 1 });
recruiterSchema.index({ 'company.industry': 1 });
recruiterSchema.index({ 'verificationStatus.isVerified': 1 });

// Virtual for success rate calculation
recruiterSchema.virtual('hiringSuccessRate').get(function() {
  if (this.statistics.totalInterviews === 0) return 0;
  return (this.statistics.totalHires / this.statistics.totalInterviews) * 100;
});

module.exports = mongoose.model('Recruiter', recruiterSchema);
