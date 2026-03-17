const express = require('express');
const { body, validationResult } = require('express-validator');
const Placement = require('../models/Placement');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all active placements (public)
router.get('/active', async (req, res) => {
  try {
    const { page = 1, limit = 20, department, location, type } = req.query;
    const filter = { 
      status: 'Open',
      'process.registrationDeadline': { $gt: new Date() }
    };

    if (department) {
      filter['eligibility.allowedDepartments'] = department;
    }

    if (location) {
      filter['job.location'] = { $in: [location] };
    }

    if (type) {
      filter['job.type'] = type;
    }

    const placements = await Placement.find(filter)
      .populate('company', 'company.name company.industry company.size')
      .sort({ 'process.registrationDeadline': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Placement.countDocuments(filter);

    res.json({
      success: true,
      data: {
        placements,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get active placements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active placements'
    });
  }
});

// Get placement details
router.get('/:placementId', async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.placementId)
      .populate('company', 'company.name company.industry company.size company.website')
      .populate('college', 'name code address');

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement not found'
      });
    }

    // Increment view count
    placement.statistics.totalViews += 1;
    await placement.save();

    res.json({
      success: true,
      data: placement
    });
  } catch (error) {
    console.error('Get placement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get placement details'
    });
  }
});

// Apply for placement (students only)
router.post('/:placementId/apply', protect, authorize('student'), async (req, res) => {
  try {
    const { placementId } = req.params;
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const placement = await Placement.findById(placementId);

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement not found'
      });
    }

    // Check if placement is still open
    if (placement.status !== 'Open' || placement.process.registrationDeadline < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Applications are closed for this placement'
      });
    }

    // Check if student has already applied
    const existingApplication = placement.applications.find(
      app => app.student.toString() === student._id.toString()
    );

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this placement'
      });
    }

    // Check eligibility
    if (student.academicInfo.cgpa < placement.requirements.minCGPA) {
      return res.status(400).json({
        success: false,
        message: `Minimum CGPA requirement is ${placement.requirements.minCGPA}`
      });
    }

    if (student.academicInfo.backlogCount > placement.requirements.maxBacklogs) {
      return res.status(400).json({
        success: false,
        message: `Maximum backlogs allowed is ${placement.requirements.maxBacklogs}`
      });
    }

    // Check department eligibility
    if (placement.eligibility.allowedDepartments.length > 0 && 
        !placement.eligibility.allowedDepartments.includes(student.academicInfo.department)) {
      return res.status(400).json({
        success: false,
        message: 'Your department is not eligible for this placement'
      });
    }

    // Create application
    const application = {
      student: student._id,
      applicationDate: new Date(),
      status: 'Applied'
    };

    placement.applications.push(application);
    placement.statistics.totalApplications += 1;
    
    await placement.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application._id,
        status: application.status,
        appliedDate: application.applicationDate
      }
    });
  } catch (error) {
    console.error('Apply for placement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Get student's applications
router.get('/my-applications', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const placements = await Placement.find({
      'applications.student': student._id
    })
    .populate('company', 'company.name company.industry')
    .populate('college', 'name code');

    const applications = placements.map(placement => {
      const application = placement.applications.find(
        app => app.student.toString() === student._id.toString()
      );

      return {
        placement: {
          id: placement._id,
          title: placement.job.title,
          company: placement.company.company.name,
          industry: placement.company.company.industry,
          type: placement.job.type,
          location: placement.job.location,
          salary: placement.compensation.salary,
          deadline: placement.process.registrationDeadline
        },
        application: {
          id: application._id,
          status: application.status,
          currentRound: application.currentRound,
          finalStatus: application.finalStatus,
          applicationDate: application.applicationDate,
          roundsCompleted: application.roundsCompleted,
          offerDetails: application.offerDetails
        }
      };
    });

    res.json({
      success: true,
      data: {
        applications,
        total: applications.length
      }
    });
  } catch (error) {
    console.error('Get student applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get applications'
    });
  }
});

// Withdraw application
router.post('/:placementId/withdraw', protect, authorize('student'), async (req, res) => {
  try {
    const { placementId } = req.params;
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const placement = await Placement.findById(placementId);

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement not found'
      });
    }

    const applicationIndex = placement.applications.findIndex(
      app => app.student.toString() === student._id.toString()
    );

    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if application can be withdrawn
    const application = placement.applications[applicationIndex];
    if (application.status === 'Selected' || application.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw application after final decision'
      });
    }

    // Update application status
    application.status = 'Withdrawn';
    await placement.save();

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application'
    });
  }
});

// Get placement statistics (public)
router.get('/:placementId/statistics', async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.placementId)
      .populate('company', 'company.name');

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement not found'
      });
    }

    // Calculate statistics
    const stats = placement.applicationStats;

    res.json({
      success: true,
      data: {
        company: placement.company.company.name,
        title: placement.job.title,
        totalApplications: stats.total,
        applied: stats.applied,
        shortlisted: stats.shortlisted,
        selected: stats.selected,
        selectionRate: stats.selectionRate,
        views: placement.statistics.totalViews,
        registrationDeadline: placement.process.registrationDeadline
      }
    });
  } catch (error) {
    console.error('Get placement statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get placement statistics'
    });
  }
});

// Get placement trends (for colleges and recruiters)
router.get('/trends/overview', protect, authorize('college', 'recruiter'), async (req, res) => {
  try {
    const { period = 'monthly', months = 6 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const placements = await Placement.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('company', 'company.name company.industry');

    // Aggregate trends
    const trends = {
      totalPlacements: placements.length,
      byIndustry: {},
      byType: {},
      byMonth: {},
      averageSalaryRange: {
        min: 0,
        max: 0
      }
    };

    placements.forEach(placement => {
      // By industry
      const industry = placement.company.company.industry;
      trends.byIndustry[industry] = (trends.byIndustry[industry] || 0) + 1;

      // By type
      const type = placement.job.type;
      trends.byType[type] = (trends.byType[type] || 0) + 1;

      // By month
      const month = placement.createdAt.toISOString().slice(0, 7);
      trends.byMonth[month] = (trends.byMonth[month] || 0) + 1;

      // Salary range
      trends.averageSalaryRange.min += placement.compensation.salary.min;
      trends.averageSalaryRange.max += placement.compensation.salary.max;
    });

    // Calculate averages
    if (placements.length > 0) {
      trends.averageSalaryRange.min = Math.round(trends.averageSalaryRange.min / placements.length);
      trends.averageSalaryRange.max = Math.round(trends.averageSalaryRange.max / placements.length);
    }

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Get placement trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get placement trends'
    });
  }
});

module.exports = router;
