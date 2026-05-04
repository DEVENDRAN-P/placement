const express = require("express");
const { body, validationResult } = require("express-validator");
const College = require("../models/College");
const Student = require("../models/Student");
const {
  protect,
  authorize,
  requireVerification,
} = require("../middleware/auth");

const router = express.Router();

// All college routes require authentication and college role
router.use(protect);
router.use(authorize("college"));

// Get college profile
router.get("/profile", async (req, res) => {
  try {
    const college = await College.findOne({ user: req.user._id });

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College profile not found",
      });
    }

    res.json({
      success: true,
      data: college,
    });
  } catch (error) {
    console.error("Get college profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get college profile",
    });
  }
});

// Update college profile
router.put(
  "/profile",
  [
    body("name").notEmpty().trim(),
    body("address.city").notEmpty().trim(),
    body("address.state").notEmpty().trim(),
    body("type").isIn([
      "Government",
      "Private",
      "Autonomous",
      "Deemed University",
    ]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const updateData = req.body;

      const college = await College.findOneAndUpdate(
        { user: req.user._id },
        updateData,
        { new: true, runValidators: true },
      );

      if (!college) {
        return res.status(404).json({
          success: false,
          message: "College profile not found",
        });
      }

      res.json({
        success: true,
        message: "College profile updated successfully",
        data: college,
      });
    } catch (error) {
      console.error("Update college profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update college profile",
      });
    }
  },
);

// Get college students
router.get("/students", async (req, res) => {
  try {
    const college = await College.findOne({ user: req.user._id });

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College profile not found",
      });
    }

    let { page = 1, limit = 20, department, year, search } = req.query;

    // Validate and constrain limit
    limit = Math.min(parseInt(limit) || 20, 100);
    page = Math.max(parseInt(page) || 1, 1);

    const filter = { college: college._id };

    if (department) {
      filter["academicInfo.department"] = department;
    }

    if (year) {
      filter["academicInfo.year"] = parseInt(year);
    }

    if (search) {
      // Escape regex special characters
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { "user.profile.firstName": { $regex: escapedSearch, $options: "i" } },
        { "user.profile.lastName": { $regex: escapedSearch, $options: "i" } },
        { "academicInfo.rollNumber": { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const students = await Student.find(filter)
      .populate("user", "profile.firstName profile.lastName email")
      .sort({ "academicInfo.cgpa": -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(filter);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get college students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get college students",
    });
  }
});

// Verify student academic records
router.post(
  "/verify-student/:studentId",
  requireVerification,
  [
    body("cgpa").isFloat({ min: 0, max: 10 }),
    body("attendance").isFloat({ min: 0, max: 100 }),
    body("backlogCount").isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { studentId } = req.params;
      const { cgpa, attendance, backlogCount } = req.body;

      // Verify student belongs to this college
      const college = await College.findOne({ user: req.user._id });
      const student = await Student.findOne({
        _id: studentId,
        college: college._id,
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found in your college",
        });
      }

      // Update verified academic information
      student.academicInfo.cgpa = cgpa;
      student.academicInfo.attendance = attendance;
      student.academicInfo.backlogCount = backlogCount;
      student.skills.forEach((skill) => {
        skill.verified = true;
      });

      await student.save();

      res.json({
        success: true,
        message: "Student academic records verified successfully",
        data: {
          cgpa: student.academicInfo.cgpa,
          attendance: student.academicInfo.attendance,
          backlogCount: student.academicInfo.backlogCount,
        },
      });
    } catch (error) {
      console.error("Verify student error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify student records",
      });
    }
  },
);

// Get college statistics
router.get("/statistics", async (req, res) => {
  try {
    const college = await College.findOne({ user: req.user._id });

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College profile not found",
      });
    }

    const students = await Student.find({ college: college._id });

    const totalStudents = students.length;
    const placedStudents = students.filter(
      (s) => s.placementStatus.isPlaced,
    ).length;
    const averageCGPA =
      students.reduce((sum, s) => sum + s.academicInfo.cgpa, 0) / totalStudents;

    const packages = students
      .filter((s) => s.placementStatus.isPlaced && s.placementStatus.package)
      .map((s) => s.placementStatus.package);

    const averagePackage =
      packages.length > 0
        ? packages.reduce((a, b) => a + b, 0) / packages.length
        : 0;

    const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;

    // Department-wise statistics
    const departmentStats = {};
    students.forEach((student) => {
      const dept = student.academicInfo.department;
      if (!departmentStats[dept]) {
        departmentStats[dept] = {
          total: 0,
          placed: 0,
          totalCGPA: 0,
        };
      }
      departmentStats[dept].total++;
      departmentStats[dept].totalCGPA += student.academicInfo.cgpa;
      if (student.placementStatus.isPlaced) {
        departmentStats[dept].placed++;
      }
    });

    // Calculate averages for each department
    Object.keys(departmentStats).forEach((dept) => {
      departmentStats[dept].averageCGPA =
        departmentStats[dept].totalCGPA / departmentStats[dept].total;
      departmentStats[dept].placementRate =
        (departmentStats[dept].placed / departmentStats[dept].total) * 100;
      delete departmentStats[dept].totalCGPA;
    });

    // Update college statistics
    college.statistics = {
      totalStudents,
      placedStudents,
      averagePackage: Math.round(averagePackage),
      highestPackage,
      placementRate: (placedStudents / totalStudents) * 100,
    };

    await college.save();

    res.json({
      success: true,
      data: {
        totalStudents,
        placedStudents,
        averageCGPA: Math.round(averageCGPA * 10) / 10,
        averagePackage: Math.round(averagePackage),
        highestPackage,
        placementRate: Math.round((placedStudents / totalStudents) * 100),
        departmentStats,
      },
    });
  } catch (error) {
    console.error("Get college statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get college statistics",
    });
  }
});

// Add department
router.post(
  "/departments",
  [
    body("name").notEmpty().trim(),
    body("totalSeats").isInt({ min: 1 }),
    body("facultyCount").isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const departmentData = req.body;

      const college = await College.findOneAndUpdate(
        { user: req.user._id },
        { $push: { departments: departmentData } },
        { new: true, runValidators: true },
      );

      if (!college) {
        return res.status(404).json({
          success: false,
          message: "College profile not found",
        });
      }

      res.json({
        success: true,
        message: "Department added successfully",
        data: college.departments[college.departments.length - 1],
      });
    } catch (error) {
      console.error("Add department error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add department",
      });
    }
  },
);

// Update placement cell information
router.put(
  "/placement-cell",
  [
    body("coordinatorName").notEmpty().trim(),
    body("coordinatorEmail").isEmail().normalizeEmail(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const placementCellData = req.body;

      const college = await College.findOneAndUpdate(
        { user: req.user._id },
        { $set: { placementCell: placementCellData } },
        { new: true, runValidators: true },
      );

      if (!college) {
        return res.status(404).json({
          success: false,
          message: "College profile not found",
        });
      }

      res.json({
        success: true,
        message: "Placement cell information updated successfully",
        data: college.placementCell,
      });
    } catch (error) {
      console.error("Update placement cell error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update placement cell information",
      });
    }
  },
);

module.exports = router;
