const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const Student = require("../models/Student");
const Placement = require("../models/Placement");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get interview preparation resources
router.get("/resources", async (req, res) => {
  try {
    const { role, difficulty } = req.query;

    const interviewResources = {
      technical: {
        "Software Engineer": [
          {
            topic: "Data Structures",
            questions: [
              "Explain arrays vs linked lists",
              "What is a binary tree?",
              "How does a hash table work?",
              "Explain stack and queue operations",
              "What is a graph traversal?",
            ],
            resources: [
              "LeetCode Explore",
              "GeeksforGeeks Data Structures",
              "InterviewBit",
            ],
          },
          {
            topic: "Algorithms",
            questions: [
              "Explain binary search",
              "What is dynamic programming?",
              "Describe sorting algorithms",
              "Explain greedy algorithms",
              "What is time complexity?",
            ],
            resources: [
              "CLRS Book",
              "HackerRank Interview Prep",
              "Codeforces",
            ],
          },
          {
            topic: "System Design",
            questions: [
              "Design a URL shortener",
              "Design a chat system",
              "Explain load balancing",
              "What is database sharding?",
              "Design a caching system",
            ],
            resources: [
              "System Design Primer",
              "Excalidraw",
              "Grokking System Design",
            ],
          },
        ],
        "Data Scientist": [
          {
            topic: "Statistics",
            questions: [
              "Explain p-value",
              "What is hypothesis testing?",
              "Describe probability distributions",
              "What is regression analysis?",
              "Explain A/B testing",
            ],
            resources: ["Khan Academy Stats", "StatQuest", "Coursera"],
          },
          {
            topic: "Machine Learning",
            questions: [
              "Explain overfitting vs underfitting",
              "What is gradient descent?",
              "Describe random forests",
              "What is cross-validation?",
              "Explain neural networks basics",
            ],
            resources: ["Fast.ai", "Andrew Ng Course", "Kaggle"],
          },
        ],
      },
      behavioral: [
        {
          question: "Tell me about yourself",
          tips: "Keep it concise, focus on relevant experience, end with why you're interested in this role",
          sampleAnswer: "I'm a final year CS student passionate about building scalable applications...",
        },
        {
          question: "Why do you want to work here?",
          tips: "Research the company, align your values with their mission, be specific",
          sampleAnswer: "I admire your innovative approach to problem-solving...",
        },
        {
          question: "Tell me about a challenge you overcame",
          tips: "Use STAR method, focus on your specific contribution, highlight problem-solving skills",
        },
        {
          question: "What are your strengths and weaknesses?",
          tips: "Choose real weaknesses but show improvement, strengths should be relevant to the role",
        },
        {
          question: "Where do you see yourself in 5 years?",
          tips: "Show ambition but also loyalty, align with company growth opportunities",
        },
        {
          question: "Why should we hire you?",
          tips: "Summarize your unique value proposition, match requirements with your skills",
        },
      ],
      codingPatterns: [
        {
          pattern: "Two Pointers",
          description: "Use two pointers moving in opposite directions or same direction",
          problems: [
            "Valid Palindrome",
            "Remove Duplicates from Sorted Array",
            "3Sum",
          ],
          companies: ["Google", "Meta", "Apple"],
        },
        {
          pattern: "Sliding Window",
          description: "Maintain a window that slides through the data",
          problems: [
            "Maximum Sum Subarray",
            "Longest Substring Without Repeating Characters",
            "Minimum Size Subarray Sum",
          ],
          companies: ["Amazon", "Microsoft", "Goldman Sachs"],
        },
        {
          pattern: "Binary Search",
          description: "Divide and conquer using sorted arrays",
          problems: [
            "Search in Rotated Array",
            "Find First and Last Position",
            "Search Insert Position",
          ],
          companies: ["Google", "Microsoft", "Adobe"],
        },
        {
          pattern: "Dynamic Programming",
          description: "Break problem into overlapping subproblems",
          problems: ["Climbing Stairs", "Coin Change", "Longest Increasing Subsequence"],
          companies: ["Google", "Amazon", "Apple"],
        },
        {
          pattern: "BFS/DFS",
          description: "Graph traversal techniques",
          problems: [
            "Number of Islands",
            "Maximum Depth of Binary Tree",
            "Clone Graph",
          ],
          companies: ["Meta", "Amazon", "Airbnb"],
        },
      ],
    };

    // Filter by role if provided
    let technicalQuestions = interviewResources.technical;

    if (role && interviewResources.technical[role]) {
      technicalQuestions = {
        [role]: interviewResources.technical[role],
      };
    }

    res.json({
      success: true,
      data: {
        technical: technicalQuestions,
        behavioral: interviewResources.behavioral,
        codingPatterns: interviewResources.codingPatterns,
        tips: [
          "Practice coding problems daily - aim for at least 2 hours",
          "Focus on understanding concepts, not just memorizing solutions",
          "Mock interviews are crucial - practice with friends or platforms",
          "Review your projects and be ready to discuss technical decisions",
          "Prepare thoughtful questions to ask the interviewer",
          "Get enough rest before the interview day",
          "Research the company's recent news and culture",
        ],
      },
    });
  } catch (error) {
    console.error("Get interview resources error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get interview resources",
    });
  }
});

// Get mock interview questions for specific company type
router.get("/mock-interview/:type", async (req, res) => {
  try {
    const { type } = req.params;

    const mockInterviews = {
      startup: {
        round1: {
          type: "Technical - Data Structures",
          duration: "45 minutes",
          questions: [
            "Implement a function to find the middle of a linked list",
            "Write code to reverse a string in place",
            "Explain the difference between array and list",
          ],
          tips: "Focus on clean code and explaining your thought process",
        },
        round2: {
          type: "System Design - Small Scale",
          duration: "30 minutes",
          questions: [
            "Design a URL shortener service",
            "How would you handle user authentication?",
          ],
          tips: "Start with basic approach, discuss trade-offs",
        },
        round3: {
          type: "Cultural Fit",
          duration: "30 minutes",
          questions: [
            "Why do you want to join a startup?",
            "How do you handle ambiguity?",
            "Tell me about a time you failed",
          ],
          tips: "Be honest and show eagerness to learn",
        },
      },
      faang: {
        round1: {
          type: "Technical - LeetCode Medium",
          duration: "45 minutes",
          questions: [
            "Solve a sliding window maximum problem",
            "Implement LRU cache",
            "Find the longest substring without repeating characters",
          ],
          tips: "Think out loud, consider multiple approaches, optimize your solution",
        },
        round2: {
          type: "Technical - Hard",
          duration: "45 minutes",
          questions: [
            "Solve a complex DP problem",
            "Design a distributed cache system",
            "Implement a thread-safe data structure",
          ],
          tips: "Don't panic on hard problems, show your problem-solving approach",
        },
        round3: {
          type: "System Design - Large Scale",
          duration: "45 minutes",
          questions: [
            "Design YouTube/Netflix",
            "Design Twitter timeline",
            "Design a distributed job scheduler",
          ],
          tips: "Clarify requirements, think about scale, discuss bottlenecks",
        },
        round4: {
          type: "Behavioral - Leadership Principles",
          duration: "45 minutes",
          questions: [
            "Tell me about a time you had a conflict with a teammate",
            "Describe a situation where you had to convince others",
            "When did you take initiative on a project?",
          ],
          tips: "Use STAR method, be specific about your impact",
        },
      },
      service: {
        round1: {
          type: "Technical - Basics",
          duration: "30 minutes",
          questions: [
            "Explain OOP concepts",
            "What is SQL join?",
            "Write a simple SQL query",
          ],
          tips: "Be thorough with fundamentals",
        },
        round2: {
          type: "Technical - Problem Solving",
          duration: "45 minutes",
          questions: [
            "Implement a queue using two stacks",
            "Find the first non-repeating character",
          ],
          tips: "Focus on clean, working code",
        },
        round3: {
          type: "HR/Managerial",
          duration: "30 minutes",
          questions: [
            "Why this company?",
            "Where do you see yourself?",
            "What are your expectations?",
          ],
          tips: "Show enthusiasm and clarity in your goals",
        },
      },
    };

    const selectedInterview = mockInterviews[type] || mockInterviews.service;

    res.json({
      success: true,
      data: {
        type,
        rounds: selectedInterview,
        generalTips: [
          "Always clarify the problem before coding",
          "Think of test cases while writing code",
          "Communicate your approach before implementing",
          "Ask clarifying questions",
          "Think about edge cases",
          "Consider time and space complexity",
          "Test your code with examples",
        ],
      },
    });
  } catch (error) {
    console.error("Get mock interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get mock interview",
    });
  }
});

// Get interview tips by company
router.get("/tips/:companyType", async (req, res) => {
  try {
    const { companyType } = req.params;

    const tips = {
      startup: {
        preparation: [
          "Research the startup's mission and recent funding",
          "Prepare to discuss your projects in detail",
          "Be ready for rapid-fire technical questions",
          "Show enthusiasm and adaptability",
          "Prepare questions about the product",
        ],
        interviewStyle: "Fast-paced, practical focus, culture fit important",
        questionsToAsk: [
          "What's the biggest challenge the team is facing?",
          "How does the company handle technical debt?",
          "What's the team's work-life balance?",
        ],
      },
      faang: {
        preparation: [
          "Practice 100+ LeetCode problems (focus on medium/hard)",
          "Study system design patterns thoroughly",
          "Prepare STAR stories for behavioral questions",
          "Understand data structures deeply",
          "Practice with mock interviews",
        ],
        interviewStyle: "Structured, algorithmic focus, multiple rounds, large scale systems",
        questionsToAsk: [
          "What's the biggest technical challenge the team is working on?",
          "How do you measure success in this role?",
          "What's the promotion timeline?",
        ],
      },
      service: {
        preparation: [
          "Focus on fundamentals (OS, Networks, DBMS)",
          "Practice SQL queries thoroughly",
          "Review your projects in depth",
          "Prepare for Managerial round",
          "Know about company's recent projects",
        ],
        interviewStyle: "Technical + Managerial, focus on fundamentals",
        questionsToAsk: [
          "What training programs do you offer?",
          "What is the project allocation process?",
          "How is the work-life balance?",
        ],
      },
      consulting: {
        preparation: [
          "Practice case studies",
          "Work on communication skills",
          "Prepare for estimation questions",
          "Research the firm's recent projects",
          "Build business acumen",
        ],
        interviewStyle: "Case-based, business problem solving",
        questionsToAsk: [
          "What types of projects will I work on?",
          "What's the typical team structure?",
        ],
      },
    };

    res.json({
      success: true,
      data: tips[companyType] || tips.service,
    });
  } catch (error) {
    console.error("Get tips error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get interview tips",
    });
  }
});

// Record mock interview completion
router.post("/record", authorize("student"), async (req, res) => {
  try {
    const { type, score, notes, duration } = req.body;

    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Initialize mockInterviews array if it doesn't exist
    if (!student.mockInterviews) {
      student.mockInterviews = [];
    }

    student.mockInterviews.push({
      type,
      score,
      notes,
      duration,
      completedAt: new Date(),
    });

    await student.save();

    res.json({
      success: true,
      message: "Mock interview recorded successfully",
    });
  } catch (error) {
    console.error("Record mock interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record mock interview",
    });
  }
});

// Get student's mock interview history
router.get("/history", authorize("student"), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student || !student.mockInterviews) {
      return res.json({
        success: true,
        data: [],
      });
    }

    res.json({
      success: true,
      data: student.mockInterviews.sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      ),
    });
  } catch (error) {
    console.error("Get mock interview history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get mock interview history",
    });
  }
});

module.exports = router;