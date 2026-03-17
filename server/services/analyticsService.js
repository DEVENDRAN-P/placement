const Student = require("../models/Student");
const Placement = require("../models/Placement");
const College = require("../models/College");

class AnalyticsService {
  // Get college placement statistics
  static async getCollgePlacementStats(collegeId) {
    try {
      const students = await Student.find({ college: collegeId });
      const placements = await Placement.find({
        shortlistedStudents: { $exists: true, $ne: [] },
        college: collegeId,
      }).populate("shortlistedStudents");

      const placedStudents = students.filter((s) => s.placementStatus.isPlaced);
      const totalStudents = students.length;
      const placementRate =
        totalStudents > 0 ? (placedStudents.length / totalStudents) * 100 : 0;

      // Department-wise statistics
      const departmentStats = {};
      students.forEach((student) => {
        const dept = student.academicInfo.department;
        if (!departmentStats[dept]) {
          departmentStats[dept] = {
            total: 0,
            placed: 0,
            avgCGPA: 0,
            avgPackage: 0,
            totalCGPA: 0,
            totalPackage: 0,
          };
        }
        departmentStats[dept].total++;
        departmentStats[dept].totalCGPA += student.academicInfo.cgpa;

        if (student.placementStatus.isPlaced) {
          departmentStats[dept].placed++;
          departmentStats[dept].totalPackage +=
            student.placementStatus.package || 0;
        }
      });

      // Calculate averages
      Object.keys(departmentStats).forEach((dept) => {
        const stats = departmentStats[dept];
        stats.avgCGPA = parseFloat((stats.totalCGPA / stats.total).toFixed(2));
        stats.avgPackage =
          stats.placed > 0
            ? parseFloat((stats.totalPackage / stats.placed).toFixed(2))
            : 0;
        stats.placementRate = parseFloat(
          ((stats.placed / stats.total) * 100).toFixed(2),
        );
        delete stats.totalCGPA;
        delete stats.totalPackage;
      });

      // Company-wise selection ratio
      const companyStats = {};
      placements.forEach((placement) => {
        if (!companyStats[placement.company]) {
          companyStats[placement.company] = {
            selectionRatio: 0,
            highestPackage: 0,
            averagePackage: 0,
            totalSelections: 0,
            totalPackage: 0,
          };
        }

        companyStats[placement.company].selectionRatio =
          placement.shortlistedStudents.length;
        companyStats[placement.company].totalSelections +=
          placement.shortlistedStudents.length;

        const placedFromCompany = placement.shortlistedStudents.filter(
          (s) =>
            s.placementStatus.isPlaced &&
            s.placementStatus.company === placement.company,
        );

        if (placedFromCompany.length > 0) {
          const packages = placedFromCompany.map(
            (s) => s.placementStatus.package || 0,
          );
          const totalPkg = packages.reduce((a, b) => a + b, 0);
          companyStats[placement.company].averagePackage = parseFloat(
            (totalPkg / placedFromCompany.length).toFixed(2),
          );
          companyStats[placement.company].highestPackage = Math.max(
            ...packages,
          );
          companyStats[placement.company].totalPackage += totalPkg;
        }
      });

      // Coding performance vs placement success
      const codingPerfomanceAnalysis = this.analyzeCodingVsPlacement(
        students,
        placedStudents,
      );

      return {
        success: true,
        data: {
          overallStats: {
            totalStudents,
            placedStudents: placedStudents.length,
            placementRate: parseFloat(placementRate.toFixed(2)),
            averageCGPA: parseFloat(
              (
                students.reduce((a, b) => a + b.academicInfo.cgpa, 0) /
                totalStudents
              ).toFixed(2),
            ),
            highestPackage: Math.max(
              ...placedStudents.map((s) => s.placementStatus.package || 0),
            ),
            averagePackage:
              placedStudents.length > 0
                ? parseFloat(
                    (
                      placedStudents.reduce(
                        (a, b) => a + (b.placementStatus.package || 0),
                        0,
                      ) / placedStudents.length
                    ).toFixed(2),
                  )
                : 0,
          },
          departmentStats,
          companyStats,
          codingPerformanceAnalysis: codingPerfomanceAnalysis,
        },
      };
    } catch (error) {
      console.error("Analytics error:", error);
      throw new Error("Failed to fetch placement analytics");
    }
  }

  // Analyze coding performance vs placement success
  static analyzeCodingVsPlacement(allStudents, placedStudents) {
    const codingMetrics = {
      placedCodingRating: 0,
      notPlacedCodingRating: 0,
      placedAvgProblems: 0,
      notPlacedAvgProblems: 0,
    };

    if (placedStudents.length > 0) {
      const totalRating = placedStudents.reduce(
        (sum, s) => sum + (s.averageCodingRating || 0),
        0,
      );
      const totalProblems = placedStudents.reduce(
        (sum, s) => sum + (s.totalCodingProblems || 0),
        0,
      );
      codingMetrics.placedCodingRating = parseFloat(
        (totalRating / placedStudents.length).toFixed(2),
      );
      codingMetrics.placedAvgProblems = parseFloat(
        (totalProblems / placedStudents.length).toFixed(2),
      );
    }

    const notPlacedStudents = allStudents.filter(
      (s) => !s.placementStatus.isPlaced,
    );
    if (notPlacedStudents.length > 0) {
      const totalRating = notPlacedStudents.reduce(
        (sum, s) => sum + (s.averageCodingRating || 0),
        0,
      );
      const totalProblems = notPlacedStudents.reduce(
        (sum, s) => sum + (s.totalCodingProblems || 0),
        0,
      );
      codingMetrics.notPlacedCodingRating = parseFloat(
        (totalRating / notPlacedStudents.length).toFixed(2),
      );
      codingMetrics.notPlacedAvgProblems = parseFloat(
        (totalProblems / notPlacedStudents.length).toFixed(2),
      );
    }

    return codingMetrics;
  }

  // Get year-wise placement trends
  static async getYearWiseTrends(collegeId) {
    try {
      const students = await Student.find({ college: collegeId });
      const trends = {};

      students.forEach((student) => {
        const year = student.academicInfo.year;
        if (!trends[year]) {
          trends[year] = {
            total: 0,
            placed: 0,
            avgCGPA: 0,
            avgPackage: 0,
            totalCGPA: 0,
            totalPackage: 0,
          };
        }

        trends[year].total++;
        trends[year].totalCGPA += student.academicInfo.cgpa;

        if (student.placementStatus.isPlaced) {
          trends[year].placed++;
          trends[year].totalPackage += student.placementStatus.package || 0;
        }
      });

      Object.keys(trends).forEach((year) => {
        const data = trends[year];
        data.avgCGPA = parseFloat((data.totalCGPA / data.total).toFixed(2));
        data.placementRate = parseFloat(
          ((data.placed / data.total) * 100).toFixed(2),
        );
        data.avgPackage =
          data.placed > 0
            ? parseFloat((data.totalPackage / data.placed).toFixed(2))
            : 0;
        delete data.totalCGPA;
        delete data.totalPackage;
      });

      return trends;
    } catch (error) {
      console.error("Trends analysis error:", error);
      throw new Error("Failed to fetch year-wise trends");
    }
  }

  // Get recruiter insights (for recruiters dashboard)
  static async getRecruiterInsights(recruiterId) {
    try {
      const placements = await Placement.find({ createdBy: recruiterId })
        .populate("shortlistedStudents")
        .populate("college");

      const insights = {
        totalPlacements: placements.length,
        totalCandidates: 0,
        selectedCandidates: 0,
        averageMatchScore: 0,
        topDepartments: {},
        topSkills: {},
        averageCGPA: [],
        totalPackageOffered: 0,
      };

      let totalMatchScore = 0;
      let matchScoreCount = 0;

      placements.forEach((placement) => {
        const shortlisted = placement.shortlistedStudents || [];
        insights.totalCandidates += shortlisted.length;

        const selected = shortlisted.filter(
          (s) => s.placementStatus.company === placement.company,
        );
        insights.selectedCandidates += selected.length;
        insights.totalPackageOffered +=
          selected.length * (placement.package || 0);

        shortlisted.forEach((student) => {
          // Track departments
          const dept = student.academicInfo.department;
          insights.topDepartments[dept] =
            (insights.topDepartments[dept] || 0) + 1;

          // Track skills
          student.skills.forEach((skill) => {
            insights.topSkills[skill.name] =
              (insights.topSkills[skill.name] || 0) + 1;
          });

          // Track CGPA
          insights.averageCGPA.push(student.academicInfo.cgpa);
        });
      });

      insights.averageCGPA =
        insights.averageCGPA.length > 0
          ? parseFloat(
              (
                insights.averageCGPA.reduce((a, b) => a + b) /
                insights.averageCGPA.length
              ).toFixed(2),
            )
          : 0;

      // Sort top departments and skills
      insights.topDepartments = Object.entries(insights.topDepartments)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

      insights.topSkills = Object.entries(insights.topSkills)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

      return insights;
    } catch (error) {
      console.error("Recruiter insights error:", error);
      throw new Error("Failed to fetch recruiter insights");
    }
  }

  // Get student placement probability (for career prediction)
  static getPlacementProbability(student) {
    let probability = 50; // Base probability

    // CGPA impact (0-20%)
    if (student.academicInfo.cgpa >= 8.5) probability += 20;
    else if (student.academicInfo.cgpa >= 7.5) probability += 15;
    else if (student.academicInfo.cgpa >= 6.5) probability += 10;
    else probability += 5;

    // Coding skills impact (0-25%)
    const totalProblems = student.totalCodingProblems || 0;
    const avgRating = student.averageCodingRating || 0;

    if (totalProblems > 500 && avgRating > 1800) probability += 25;
    else if (totalProblems > 300 && avgRating > 1500) probability += 20;
    else if (totalProblems > 100 && avgRating > 1200) probability += 15;
    else if (totalProblems > 0) probability += 10;

    // Projects impact (0-15%)
    const projectCount = student.projects ? student.projects.length : 0;
    if (projectCount >= 5) probability += 15;
    else if (projectCount >= 3) probability += 10;
    else if (projectCount >= 1) probability += 5;

    // Certifications impact (0-10%)
    const certCount = student.certifications
      ? student.certifications.length
      : 0;
    if (certCount >= 3) probability += 10;
    else if (certCount >= 1) probability += 5;

    // Internship experience impact (0-5%)
    if (student.aiInsights && student.aiInsights.careerAdvice) {
      if (student.aiInsights.careerAdvice.includes("internship"))
        probability += 5;
    }

    // Cap at 100%
    return Math.min(probability, 100);
  }
}

module.exports = AnalyticsService;
