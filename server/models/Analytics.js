const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  type: {
    type: String,
    enum: ['placement', 'academic', 'coding', 'skills', 'recruitment'],
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  data: {
    // Placement analytics
    placementRate: Number,
    averagePackage: Number,
    highestPackage: Number,
    companiesVisited: Number,
    studentsPlaced: Number,
    totalStudents: Number,
    
    // Department-wise stats
    departmentStats: [{
      department: String,
      placementRate: Number,
      averagePackage: Number,
      studentsPlaced: Number,
      totalStudents: Number
    }],
    
    // Company-wise stats
    companyStats: [{
      companyName: String,
      studentsSelected: Number,
      averagePackage: Number,
      selectionRate: Number
    }],
    
    // Academic performance
    averageCGPA: Number,
    attendanceRate: Number,
    backlogRate: Number,
    
    // Coding performance
    averageCodingRating: Number,
    totalProblemsSolved: Number,
    activeCoders: Number,
    codingGrowthRate: Number,
    
    // Skills analysis
    topSkills: [{
      name: String,
      count: Number,
      percentage: Number
    }],
    skillGaps: [{
      skill: String,
      demand: Number,
      supply: Number,
      gap: Number
    }],
    
    // Recruitment funnel
    applicationFunnel: [{
      stage: String,
      count: Number,
      conversionRate: Number
    }],
    
    // Time series data
    timeSeriesData: [{
      date: Date,
      value: Number,
      metric: String
    }]
  },
  aiInsights: {
    trends: [String],
    recommendations: [String],
    predictions: [{
      metric: String,
      currentValue: Number,
      predictedValue: Number,
      confidence: Number,
      timeframe: String
    }],
    anomalies: [{
      metric: String,
      value: Number,
      expectedValue: Number,
      severity: String,
      description: String
    }]
  },
  metadata: {
    generatedAt: {
      type: Date,
      default: Date.now
    },
    dataSource: String,
    confidence: Number,
    version: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
analyticsSchema.index({ college: 1, type: 1, period: 1, date: -1 });
analyticsSchema.index({ type: 1, period: 1, date: -1 });

// Static method to generate placement analytics
analyticsSchema.statics.generatePlacementAnalytics = async function(collegeId, period, date) {
  const Student = mongoose.model('Student');
  const Placement = mongoose.model('Placement');
  
  const students = await Student.find({ college: collegeId });
  const placements = await Placement.find({ 
    college: collegeId, 
    status: 'Closed',
    'process.endDate': { $lte: date }
  });
  
  const totalStudents = students.length;
  const placedStudents = students.filter(s => s.placementStatus.isPlaced).length;
  const placementRate = (placedStudents / totalStudents) * 100;
  
  const packages = students
    .filter(s => s.placementStatus.isPlaced && s.placementStatus.package)
    .map(s => s.placementStatus.package);
  
  const averagePackage = packages.length > 0 
    ? packages.reduce((a, b) => a + b, 0) / packages.length 
    : 0;
  
  const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;
  
  // Department-wise stats
  const departmentStats = {};
  students.forEach(student => {
    const dept = student.academicInfo.department;
    if (!departmentStats[dept]) {
      departmentStats[dept] = {
        total: 0,
        placed: 0,
        packages: []
      };
    }
    departmentStats[dept].total++;
    if (student.placementStatus.isPlaced) {
      departmentStats[dept].placed++;
      if (student.placementStatus.package) {
        departmentStats[dept].packages.push(student.placementStatus.package);
      }
    }
  });
  
  const departmentStatsArray = Object.entries(departmentStats).map(([dept, stats]) => ({
    department: dept,
    placementRate: (stats.placed / stats.total) * 100,
    averagePackage: stats.packages.length > 0 
      ? stats.packages.reduce((a, b) => a + b, 0) / stats.packages.length 
      : 0,
    studentsPlaced: stats.placed,
    totalStudents: stats.total
  }));
  
  return {
    placementRate,
    averagePackage,
    highestPackage,
    companiesVisited: new Set(placements.map(p => p.company)).size,
    studentsPlaced: placedStudents,
    totalStudents,
    departmentStats: departmentStatsArray
  };
};

module.exports = mongoose.model('Analytics', analyticsSchema);
