const natural = require("natural");
const { Matrix } = require("ml-matrix");
const { LinearRegression } = require("ml-regression");
const fs = require("fs").promises;
const pdf = require("pdf-parse");
const mammoth = require("mammoth");

class AIAnalysisService {
  // Resume analysis for plagiarism detection and skill extraction
  static async analyzeResume(filePath) {
    try {
      const text = await this.extractTextFromFile(filePath);

      // Extract skills using keyword matching
      const extractedSkills = this.extractSkills(text);

      // Extract experience information
      const extractedExperience = this.extractExperience(text);

      // Simple plagiarism detection (in production, use more sophisticated algorithms)
      const plagiarismScore = await this.calculatePlagiarismScore(text);

      return {
        extractedSkills,
        extractedExperience,
        plagiarismScore,
      };
    } catch (error) {
      console.error("Resume analysis error:", error);
      throw new Error("Failed to analyze resume");
    }
  }

  // Extract text from different file formats
  static async extractTextFromFile(filePath) {
    try {
      // Validate file exists first
      try {
        await fs.access(filePath);
      } catch (err) {
        throw new Error(`File not found: ${filePath}`);
      }

      const fileExtension = filePath.split(".").pop().toLowerCase();
      const buffer = await fs.readFile(filePath);

      switch (fileExtension) {
        case "pdf":
          const pdfData = await pdf(buffer);
          return pdfData.text;

        case "docx":
          const docxResult = await mammoth.extractRawText({ buffer });
          return docxResult.value;

        case "doc":
          // For .doc files, you might need additional libraries
          throw new Error(
            "DOC files are not supported yet. Please use DOCX or PDF.",
          );

        default:
          throw new Error("Unsupported file format");
      }
    } catch (error) {
      console.error("Text extraction error:", error.message);
      throw new Error(`Failed to extract text from file: ${error.message}`);
    }
  }

  // Extract skills from resume text
  static extractSkills(text) {
    const commonSkills = [
      "JavaScript",
      "Python",
      "Java",
      "C++",
      "C#",
      "Ruby",
      "Go",
      "Rust",
      "React",
      "Angular",
      "Vue.js",
      "Node.js",
      "Express.js",
      "Django",
      "Flask",
      "HTML",
      "CSS",
      "SASS",
      "Bootstrap",
      "Tailwind CSS",
      "MongoDB",
      "MySQL",
      "PostgreSQL",
      "Redis",
      "Oracle",
      "AWS",
      "Azure",
      "Google Cloud",
      "Docker",
      "Kubernetes",
      "Git",
      "GitHub",
      "GitLab",
      "CI/CD",
      "Jenkins",
      "Machine Learning",
      "Deep Learning",
      "TensorFlow",
      "PyTorch",
      "Data Science",
      "Analytics",
      "Statistics",
      "R",
      "MATLAB",
      "Agile",
      "Scrum",
      "JIRA",
      "Trello",
      "REST API",
      "GraphQL",
      "Microservices",
      "DevOps",
    ];

    const foundSkills = [];
    const lowerText = text.toLowerCase();

    commonSkills.forEach((skill) => {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });

    return foundSkills;
  }

  // Extract experience information
  static extractExperience(text) {
    const experiencePatterns = [
      /(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience/i,
      /experience\s*:\s*(\d+)\s*(?:years?|yrs?)/i,
      /worked\s*(?:for|at)\s*(\d+)\s*(?:years?|yrs?)/i,
    ];

    let totalExperience = 0;

    experiencePatterns.forEach((pattern) => {
      const match = text.match(pattern);
      if (match) {
        totalExperience = Math.max(totalExperience, parseInt(match[1]));
      }
    });

    // Extract company names (simplified)
    const companyPattern =
      /(?:worked at|employed at|experience at)\s*([^,.!?;]+)/gi;
    const companies = [];
    let companyMatch;

    while ((companyMatch = companyPattern.exec(text)) !== null) {
      companies.push(companyMatch[1].trim());
    }

    return {
      totalYears: totalExperience,
      companies: companies.slice(0, 5), // Limit to top 5 companies
    };
  }

  // Simple plagiarism detection (placeholder for more sophisticated algorithms)
  static async calculatePlagiarismScore(text) {
    // In a real implementation, you would:
    // 1. Compare against a database of known resumes
    // 2. Use advanced NLP techniques
    // 3. Check for common templates

    // For now, we'll use a simple heuristic based on common phrases
    const commonPhrases = [
      "highly motivated individual",
      "team player with excellent communication skills",
      "passionate about learning new technologies",
      "detail-oriented with strong analytical skills",
    ];

    let commonPhraseCount = 0;
    const lowerText = text.toLowerCase();

    commonPhrases.forEach((phrase) => {
      if (lowerText.includes(phrase)) {
        commonPhraseCount++;
      }
    });

    // Calculate a simple plagiarism score based on common phrases
    const plagiarismScore = Math.min(
      (commonPhraseCount / commonPhrases.length) * 100,
      30,
    );

    return Math.round(plagiarismScore);
  }

  // Calculate average coding rating for a student
  static getAverageCodingRating(student) {
    if (!student.codingProfiles) return 0;
    const ratings = [
      student.codingProfiles.leetcode?.rating || 0,
      student.codingProfiles.codechef?.rating || 0,
      student.codingProfiles.codeforces?.rating || 0,
    ].filter((r) => r > 0);
    return ratings.length > 0
      ? Math.round(ratings.reduce((a, b) => a + b) / ratings.length)
      : 0;
  }

  // Student shortlisting based on job requirements
  static async shortlistStudents(jobRequirements, students) {
    const shortlisted = [];

    students.forEach((student) => {
      const score = this.calculateMatchScore(jobRequirements, student);

      if (score >= 50) {
        // Minimum threshold
        shortlisted.push({
          student: student._id,
          score,
          ranking: 0, // Will be set after sorting
          reasons: this.getMatchReasons(jobRequirements, student),
        });
      }
    });

    // Sort by score in descending order
    shortlisted.sort((a, b) => b.score - a.score);

    // Assign rankings
    shortlisted.forEach((candidate, index) => {
      candidate.ranking = index + 1;
    });

    return shortlisted;
  }

  // Calculate match score between student and job requirements
  static calculateMatchScore(requirements, student) {
    let score = 0;
    let maxScore = 0;

    // CGPA matching (30% weight)
    maxScore += 30;
    if (student.academicInfo.cgpa >= requirements.minCGPA) {
      const cgpaScore = Math.min((student.academicInfo.cgpa / 10) * 30, 30);
      score += cgpaScore;
    }

    // Skills matching (40% weight)
    maxScore += 40;
    if (requirements.skills && requirements.skills.length > 0) {
      const studentSkills = student.skills.map((s) => s.name.toLowerCase());
      const requiredSkills = requirements.skills.map((s) =>
        s.name.toLowerCase(),
      );

      const matchedSkills = requiredSkills.filter((skill) =>
        studentSkills.some(
          (studentSkill) =>
            studentSkill.includes(skill) || skill.includes(studentSkill),
        ),
      );

      const skillsScore = (matchedSkills.length / requiredSkills.length) * 40;
      score += skillsScore;
    } else {
      score += 20; // If no specific skills required, give partial points
    }

    // Coding performance (20% weight) - FIXED: Calculate rating instead of using virtual
    maxScore += 20;
    const codingRating = this.getAverageCodingRating(student);
    if (codingRating > 0) {
      const codingScore = Math.min((codingRating / 2000) * 20, 20);
      score += codingScore;
    }

    // Department matching (10% weight)
    maxScore += 10;
    if (
      requirements.allowedDepartments &&
      requirements.allowedDepartments.length > 0
    ) {
      if (
        requirements.allowedDepartments.includes(
          student.academicInfo.department,
        )
      ) {
        score += 10;
      }
    } else {
      score += 5; // If no department preference, give partial points
    }

    // Deductions for backlogs
    if (student.academicInfo.backlogCount > (requirements.maxBacklogs || 2)) {
      score = Math.max(0, score - 20);
    }

    return Math.round((score / maxScore) * 100);
  }

  // Get reasons for match/mismatch
  static getMatchReasons(requirements, student) {
    const reasons = [];

    // CGPA
    if (student.academicInfo.cgpa >= requirements.minCGPA) {
      reasons.push(
        `CGPA ${student.academicInfo.cgpa} meets requirement of ${requirements.minCGPA}`,
      );
    } else {
      reasons.push(
        `CGPA ${student.academicInfo.cgpa} below requirement of ${requirements.minCGPA}`,
      );
    }

    // Skills
    if (requirements.skills && requirements.skills.length > 0) {
      const studentSkills = student.skills.map((s) => s.name.toLowerCase());
      const requiredSkills = requirements.skills.map((s) =>
        s.name.toLowerCase(),
      );

      const matchedSkills = requiredSkills.filter((skill) =>
        studentSkills.some(
          (studentSkill) =>
            studentSkill.includes(skill) || skill.includes(studentSkill),
        ),
      );

      if (matchedSkills.length > 0) {
        reasons.push(
          `Has ${matchedSkills.length} required skills: ${matchedSkills.join(", ")}`,
        );
      } else {
        reasons.push("Missing required skills");
      }
    }

    // Coding
    const codingRating = this.getAverageCodingRating(student);
    if (codingRating > 1500) {
      reasons.push(
        `Strong coding profile with ${Math.round(codingRating)} average rating`,
      );
    }

    // Department
    if (
      requirements.allowedDepartments &&
      requirements.allowedDepartments.includes(student.academicInfo.department)
    ) {
      reasons.push(`Department matches: ${student.academicInfo.department}`);
    }

    return reasons;
  }

  // Skill gap analysis
  static analyzeSkillGap(student, targetRole) {
    const roleRequirements = this.getRoleRequirements(targetRole);
    const studentSkills = student.skills.map((s) => s.name.toLowerCase());

    const gaps = [];
    const strengths = [];

    roleRequirements.forEach((req) => {
      const hasSkill = studentSkills.some(
        (skill) =>
          skill.includes(req.skill.toLowerCase()) ||
          req.skill.toLowerCase().includes(skill),
      );

      if (hasSkill) {
        strengths.push(req.skill);
      } else {
        gaps.push({
          skill: req.skill,
          importance: req.importance,
          learningResources: this.getLearningResources(req.skill),
        });
      }
    });

    return {
      strengths,
      gaps,
      recommendations: this.generateRecommendations(gaps, student),
      completionPercentage: Math.round(
        (strengths.length / roleRequirements.length) * 100,
      ),
    };
  }

  // Get role requirements (simplified database)
  static getRoleRequirements(role) {
    const requirements = {
      "Software Engineer": [
        { skill: "JavaScript", importance: "high" },
        { skill: "Data Structures", importance: "high" },
        { skill: "Algorithms", importance: "high" },
        { skill: "Git", importance: "medium" },
        { skill: "REST API", importance: "medium" },
      ],
      "Data Scientist": [
        { skill: "Python", importance: "high" },
        { skill: "Machine Learning", importance: "high" },
        { skill: "Statistics", importance: "high" },
        { skill: "SQL", importance: "medium" },
        { skill: "Data Visualization", importance: "medium" },
      ],
      "DevOps Engineer": [
        { skill: "Docker", importance: "high" },
        { skill: "Kubernetes", importance: "high" },
        { skill: "CI/CD", importance: "high" },
        { skill: "AWS", importance: "medium" },
        { skill: "Linux", importance: "medium" },
      ],
    };

    return requirements[role] || requirements["Software Engineer"];
  }

  // Get learning resources for skills
  static getLearningResources(skill) {
    const resources = {
      JavaScript: ["MDN Web Docs", "JavaScript.info", "Eloquent JavaScript"],
      Python: [
        "Python.org Tutorial",
        "Real Python",
        "Automate the Boring Stuff",
      ],
      "Machine Learning": ["Coursera ML Course", "Fast.ai", "ML Mastery"],
      Docker: ["Docker Documentation", "Docker Deep Dive", "Play with Docker"],
      AWS: ["AWS Documentation", "AWS Training", "A Cloud Guru"],
    };

    return (
      resources[skill] || [
        "Official Documentation",
        "Online Courses",
        "YouTube Tutorials",
      ]
    );
  }

  // Generate personalized recommendations
  static generateRecommendations(gaps, student) {
    const recommendations = [];

    if (gaps.length > 0) {
      const highPriorityGaps = gaps.filter((gap) => gap.importance === "high");

      if (highPriorityGaps.length > 0) {
        recommendations.push(
          `Focus on learning: ${highPriorityGaps.map((gap) => gap.skill).join(", ")}`,
        );
      }

      if (student.averageCodingRating < 1200) {
        recommendations.push(
          "Improve coding skills by solving more problems on LeetCode or Codeforces",
        );
      }

      if (student.academicInfo.cgpa < 7.0) {
        recommendations.push("Focus on improving academic performance");
      }

      if (student.projects.length < 2) {
        recommendations.push(
          "Build more projects to showcase practical skills",
        );
      }
    } else {
      recommendations.push(
        "Great job! You have most of the required skills. Focus on gaining practical experience.",
      );
    }

    return recommendations;
  }

  // Career prediction using simple ML
  static predictCareerSuccess(student, historicalData) {
    // If not enough historical data, use basic prediction
    if (!historicalData || historicalData.length < 5) {
      return this.getBasicPrediction(student);
    }

    try {
      // Prepare training data with correct field mapping
      const features = historicalData.map((data) => {
        const cgpa = data.academicInfo?.cgpa || 0;

        // Calculate average coding rating from profiles
        const ratings = [
          data.codingProfiles?.leetcode?.rating || 0,
          data.codingProfiles?.codechef?.rating || 0,
          data.codingProfiles?.codeforces?.rating || 0,
        ].filter((r) => r > 0);
        const codingRating =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;

        const projectCount = data.projects?.length || 0;
        const certificationCount = data.certifications?.length || 0;
        const achievementCount = data.achievements?.length || 0;

        return [
          cgpa,
          codingRating,
          projectCount,
          certificationCount,
          achievementCount,
        ];
      });

      // Extract labels from placement status
      const labels = historicalData.map((data) =>
        data.placementStatus?.isPlaced ? 1 : 0,
      );

      // Filter out any invalid features (NaN or infinite values)
      const validData = features
        .map((feat, idx) => ({ features: feat, label: labels[idx] }))
        .filter((item) =>
          item.features.every(
            (f) => isFinite(f) && f !== null && f !== undefined,
          ),
        );

      if (validData.length < 3) {
        return this.getBasicPrediction(student);
      }

      const validFeatures = validData.map((d) => d.features);
      const validLabels = validData.map((d) => d.label);

      // Simple weighted scoring (since LinearRegression might not be available)
      // Weight: CGPA(30%) + Coding(25%) + Projects(20%) + Certifications(15%) + Achievements(10%)
      const weights = [0.3, 0.25, 0.2, 0.15, 0.1];

      const avgFeatures = validFeatures[0].map((_, i) => {
        const sum = validFeatures.reduce((acc, feat) => acc + feat[i], 0);
        return sum / validFeatures.length;
      });

      const placementRate =
        validLabels.reduce((a, b) => a + b, 0) / validLabels.length;

      // Calculate student's score based on comparison with average
      const studentFeatures = [
        student.academicInfo?.cgpa || 0,
        student.averageCodingRating || 0,
        student.projects?.length || 0,
        student.certifications?.length || 0,
        student.achievements?.length || 0,
      ];

      let scoreRatio = 0;
      let validScores = 0;
      for (let i = 0; i < weights.length; i++) {
        if (avgFeatures[i] > 0) {
          const ratio = Math.min(studentFeatures[i] / avgFeatures[i], 2); // Cap at 2x
          scoreRatio += ratio * weights[i];
          validScores += weights[i];
        }
      }

      const probability = Math.max(
        20,
        Math.min(95, placementRate * 100 + (scoreRatio - 1) * 15),
      );

      return {
        placementProbability: Math.round(probability),
        placementScore: Math.round(probability),
        confidence: "medium",
        factors: this.getInfluencingFactors(student),
        recommendations: this.getCareerRecommendations(student, probability),
        suggestedRoles: [
          "Software Engineer",
          "Full Stack Developer",
          "Backend Developer",
        ],
      };
    } catch (error) {
      console.error("Career prediction error:", error);
      return this.getBasicPrediction(student);
    }
  }

  // Basic prediction without ML data
  static getBasicPrediction(student) {
    if (!student) {
      return {
        placementProbability: 60,
        placementScore: 60,
        confidence: "low",
        factors: [],
        recommendations: [
          "Focus on coding practice - solve at least 50 more problems",
          "Build 1-2 real-world projects using modern tech stack",
          "Get certified in one trending technology",
          "Practice mock interviews",
        ],
        suggestedRoles: [
          "Software Engineer",
          "Full Stack Developer",
          "Backend Developer",
        ],
      };
    }

    let probability = 50; // Base probability

    // Safely access fields with defaults
    const cgpa = student.academicInfo?.cgpa || 0;
    const codingRating = student.averageCodingRating || 0;
    const totalCodingProblems = student.totalCodingProblems || 0;
    const projectCount = student.projects?.length || 0;
    const certCount = student.certifications?.length || 0;

    // Adjust based on CGPA
    if (cgpa >= 8.5) probability += 20;
    else if (cgpa >= 7.5) probability += 10;
    else if (cgpa >= 6.0) probability += 5;
    else if (cgpa < 6.0) probability -= 20;

    // Adjust based on coding skills
    if (codingRating >= 1800) probability += 15;
    else if (codingRating >= 1500) probability += 12;
    else if (codingRating >= 1000) probability += 8;
    else if (totalCodingProblems > 100) probability += 5;

    // Adjust based on projects
    if (projectCount >= 3) probability += 10;
    else if (projectCount >= 1) probability += 5;

    // Adjust based on certifications
    if (certCount >= 2) probability += 5;
    else if (certCount >= 1) probability += 3;

    probability = Math.max(10, Math.min(95, probability));

    return {
      placementProbability: Math.round(probability),
      placementScore: Math.round(probability),
      confidence: "low",
      factors: this.getInfluencingFactors(student),
      recommendations: this.getCareerRecommendations(student, probability),
      suggestedRoles: [
        "Software Engineer",
        "Full Stack Developer",
        "Backend Developer",
      ],
    };
  }

  // Get factors influencing placement probability
  static getInfluencingFactors(student) {
    const factors = [];

    if (!student) return factors;

    const cgpa = student.academicInfo?.cgpa || 0;
    const codingRating = student.averageCodingRating || 0;
    const projectCount = student.projects?.length || 0;
    const backlogs = student.academicInfo?.backlogCount || 0;

    if (cgpa >= 8.0) {
      factors.push({ factor: "High CGPA", impact: "positive", score: 85 });
    } else if (cgpa >= 7.0) {
      factors.push({ factor: "Good CGPA", impact: "positive", score: 75 });
    } else if (cgpa < 6.5) {
      factors.push({ factor: "Low CGPA", impact: "negative", score: 45 });
    }

    if (codingRating >= 1800) {
      factors.push({
        factor: "Excellent Coding Skills",
        impact: "positive",
        score: 90,
      });
    } else if (codingRating >= 1400) {
      factors.push({
        factor: "Strong Coding Profile",
        impact: "positive",
        score: 80,
      });
    } else if (codingRating > 0) {
      factors.push({
        factor: "Moderate Coding Skills",
        impact: "positive",
        score: 60,
      });
    }

    if (projectCount >= 3) {
      factors.push({
        factor: "Multiple Projects",
        impact: "positive",
        score: 85,
      });
    } else if (projectCount >= 1) {
      factors.push({
        factor: "Project Experience",
        impact: "positive",
        score: 70,
      });
    }

    if (backlogs > 2) {
      factors.push({
        factor: "Multiple Backlogs",
        impact: "negative",
        score: 40,
      });
    } else if (backlogs > 0) {
      factors.push({
        factor: "Active Backlogs",
        impact: "negative",
        score: 55,
      });
    }

    if (factors.length === 0) {
      factors.push({
        factor: "Profile Incomplete",
        impact: "neutral",
        score: 60,
      });
    }

    return factors;
  }

  // Get career recommendations based on prediction
  static getCareerRecommendations(student, probability) {
    const recommendations = [];

    if (!student) {
      return [
        "Complete your student profile for personalized recommendations",
        "Add your academic details and coding profiles",
        "Upload your resume and projects",
      ];
    }

    if (probability < 40) {
      recommendations.push(
        "Focus on improving academic performance and coding skills",
      );
      recommendations.push(
        "Build more projects and get industry certifications",
      );
      recommendations.push("Consider internships to gain practical experience");
      recommendations.push(
        "Practice coding problems daily on LeetCode or CodeChef",
      );
    } else if (probability < 70) {
      recommendations.push(
        "Continue building diverse projects and improving coding skills",
      );
      recommendations.push(
        "Network with professionals in your target companies",
      );
      recommendations.push(
        "Prepare well for technical and behavioral interviews",
      );
      recommendations.push("Consider pursuing relevant certifications");
    } else {
      recommendations.push(
        "Maintain your excellent academic and coding performance",
      );
      recommendations.push(
        "Focus on advanced topics and system design patterns",
      );
      recommendations.push(
        "Apply to top-tier companies and FAANG organizations",
      );
      recommendations.push(
        "Mentor juniors and contribute to open source projects",
      );
    }

    return recommendations;
  }
}

module.exports = {
  analyzeResume: AIAnalysisService.analyzeResume,
  AIAnalysisService,
};
