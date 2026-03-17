const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  address: {
    street: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  accreditation: {
    type: String,
    enum: ['NAAC A++', 'NAAC A+', 'NAAC A', 'NAAC B++', 'NAAC B+', 'NAAC B', 'NBA', 'Other']
  },
  establishedYear: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  type: {
    type: String,
    enum: ['Government', 'Private', 'Autonomous', 'Deemed University'],
    required: true
  },
  departments: [{
    name: String,
    headOfDepartment: String,
    totalSeats: Number,
    facultyCount: Number
  }],
  placementCell: {
    coordinatorName: String,
    coordinatorEmail: String,
    coordinatorPhone: String,
    officeAddress: String
  },
  statistics: {
    totalStudents: {
      type: Number,
      default: 0
    },
    placedStudents: {
      type: Number,
      default: 0
    },
    averagePackage: {
      type: Number,
      default: 0
    },
    highestPackage: {
      type: Number,
      default: 0
    },
    companiesVisited: {
      type: Number,
      default: 0
    },
    placementRate: {
      type: Number,
      default: 0
    }
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
    }
  },
  settings: {
    allowPublicProfiles: {
      type: Boolean,
      default: false
    },
    autoVerifyStudents: {
      type: Boolean,
      default: false
    },
    enableAIMatching: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
collegeSchema.index({ code: 1 });
collegeSchema.index({ 'address.city': 1 });
collegeSchema.index({ 'address.state': 1 });

// Virtual for placement rate calculation
collegeSchema.virtual('placementPercentage').get(function() {
  if (this.statistics.totalStudents === 0) return 0;
  return (this.statistics.placedStudents / this.statistics.totalStudents) * 100;
});

module.exports = mongoose.model('College', collegeSchema);
