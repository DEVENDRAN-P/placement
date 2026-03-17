const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruiter',
    required: true
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  job: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    department: [String],
    type: {
      type: String,
      enum: ['Full Time', 'Internship', 'Apprenticeship'],
      required: true
    },
    location: [String],
    workMode: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid'],
      default: 'On-site'
    }
  },
  requirements: {
    minCGPA: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    },
    maxBacklogs: {
      type: Number,
      default: 2
    },
    skills: [{
      name: {
        type: String,
        required: true
      },
      level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Beginner'
      },
      isMandatory: {
        type: Boolean,
        default: false
      }
    }],
    experience: {
      type: String,
      enum: ['Fresher', '0-1 years', '1-3 years', '3-5 years', '5+ years'],
      default: 'Fresher'
    },
    educationLevel: {
      type: String,
      enum: ['Diploma', 'Bachelors', 'Masters', 'PhD'],
      default: 'Bachelors'
    }
  },
  compensation: {
    salary: {
      min: {
        type: Number,
        required: true
      },
      max: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: 'INR'
      },
      period: {
        type: String,
        enum: ['Per Annum', 'Per Month'],
        default: 'Per Annum'
      }
    },
    benefits: [String],
    bonuses: [String]
  },
  process: {
    rounds: [{
      name: String,
      description: String,
      type: {
        type: String,
        enum: ['Aptitude', 'Technical', 'HR', 'Group Discussion', 'Coding Test', 'Technical Interview', 'Managerial Round'],
        required: true
      },
      duration: Number, // in minutes
      isOnline: {
        type: Boolean,
        default: true
      }
    }],
    totalDuration: Number, // in days
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    registrationDeadline: {
      type: Date,
      required: true
    }
  },
  eligibility: {
    allowedDepartments: [String],
    allowedYears: [Number],
    passOutYear: Number,
    nationality: [String],
    workPermitRequired: {
      type: Boolean,
      default: false
    }
  },
  applications: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    applicationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Applied', 'Screened', 'Shortlisted', 'Rejected', 'Selected', 'On Hold', 'Withdrawn'],
      default: 'Applied'
    },
    currentRound: Number,
    roundsCompleted: [{
      roundNumber: Number,
      roundName: String,
      status: {
        type: String,
        enum: ['Pending', 'Completed', 'Passed', 'Failed']
      },
      score: Number,
      feedback: String,
      date: Date
    }],
    finalStatus: {
      type: String,
      enum: ['Selected', 'Rejected', 'On Hold', 'Pending'],
      default: 'Pending'
    },
    offerDetails: {
      package: Number,
      joiningDate: Date,
      location: String,
      role: String
    },
    aiMatchScore: Number,
    aiRanking: Number
  }],
  statistics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalApplications: {
      type: Number,
      default: 0
    },
    shortlistedCandidates: {
      type: Number,
      default: 0
    },
    selectedCandidates: {
      type: Number,
      default: 0
    },
    averageCGPA: Number,
    averageCodingRating: Number
  },
  status: {
    type: String,
    enum: ['Draft', 'Open', 'Closed', 'Cancelled'],
    default: 'Draft'
  },
  aiInsights: {
    recommendedColleges: [String],
    studentMatchScore: Number,
    competitionLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Very High']
    },
    successProbability: Number
  }
}, {
  timestamps: true
});

// Indexes for better query performance
placementSchema.index({ 'college': 1, 'status': 1 });
placementSchema.index({ 'company': 1, 'status': 1 });
placementSchema.index({ 'process.startDate': 1 });
placementSchema.index({ 'requirements.minCGPA': 1 });

// Virtual for application statistics
placementSchema.virtual('applicationStats').get(function() {
  const total = this.applications.length;
  const applied = this.applications.filter(app => app.status === 'Applied').length;
  const shortlisted = this.applications.filter(app => app.status === 'Shortlisted').length;
  const selected = this.applications.filter(app => app.finalStatus === 'Selected').length;
  
  return {
    total,
    applied,
    shortlisted,
    selected,
    selectionRate: total > 0 ? (selected / total) * 100 : 0
  };
});

module.exports = mongoose.model('Placement', placementSchema);
