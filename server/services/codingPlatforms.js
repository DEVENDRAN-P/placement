const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");
const Student = require("../models/Student");

class CodingPlatformService {
  // LeetCode integration
  static async fetchLeetCodeStats(username) {
    try {
      // Using LeetCode GraphQL API
      const query = `
        query getUserProfile($username: String!) {
          allQuestionsCount {
            difficulty
            count
          }
          matchedUser(username: $username) {
            username
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
            profile {
              ranking
              reputation
            }
          }
        }
      `;

      const response = await axios.post(
        "https://leetcode.com/graphql",
        {
          query,
          variables: { username },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Referer: "https://leetcode.com",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
          timeout: 10000,
        },
      );

      // Check for GraphQL errors
      if (response.data.errors) {
        console.error("LeetCode GraphQL errors:", response.data.errors);
        throw new Error("LeetCode API returned an error");
      }

      const data = response.data.data;

      if (!data || !data.matchedUser) {
        throw new Error("User not found on LeetCode");
      }

      // Validate submission stats exist
      if (
        !data.matchedUser.submitStats ||
        !data.matchedUser.submitStats.acSubmissionNum
      ) {
        throw new Error("Invalid LeetCode profile data");
      }

      const easySolved =
        data.matchedUser.submitStats.acSubmissionNum.find(
          (stat) => stat.difficulty === "Easy",
        )?.count || 0;
      const mediumSolved =
        data.matchedUser.submitStats.acSubmissionNum.find(
          (stat) => stat.difficulty === "Medium",
        )?.count || 0;
      const hardSolved =
        data.matchedUser.submitStats.acSubmissionNum.find(
          (stat) => stat.difficulty === "Hard",
        )?.count || 0;

      // Calculate totalSolved from individual difficulties to avoid double-counting
      const totalSolved = easySolved + mediumSolved + hardSolved;

      console.log(
        `📊 LeetCode stats for ${data.matchedUser.username}: Easy=${easySolved}, Medium=${mediumSolved}, Hard=${hardSolved}, Total=${totalSolved}`,
      );

      return {
        username: data.matchedUser.username,
        totalSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        rating: data.matchedUser.profile?.ranking || 0,
      };
    } catch (error) {
      console.error("LeetCode API error:", error.message);
      throw new Error(`Failed to fetch LeetCode stats: ${error.message}`);
    }
  }

  // CodeChef integration
  static async fetchCodeChefStats(username) {
    try {
      const response = await axios.get(
        `https://www.codechef.com/users/${username}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Referer: "https://www.codechef.com",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          timeout: 10000,
        },
      );

      if (!response.data) {
        throw new Error("Empty response from CodeChef");
      }

      const $ = cheerio.load(response.data);

      // Extract rating from the page - try multiple selectors
      let rating = 0;
      const ratingSelectors = [
        ".rating-number",
        ".ratingNumber",
        "[data-rating]",
        ".rating-value",
      ];

      for (const selector of ratingSelectors) {
        const ratingText = $(selector).text().trim();
        if (ratingText) {
          const parsed = parseInt(ratingText);
          if (!isNaN(parsed)) {
            rating = parsed;
            break;
          }
        }
      }

      // Extract stars
      let stars = "";
      const starsSelectors = [".rating", ".ratingStars", "[data-stars]"];
      for (const selector of starsSelectors) {
        const starsText = $(selector).text().trim();
        if (starsText && starsText.includes("★")) {
          stars = starsText.split("★")[0].trim();
          break;
        }
      }

      // Extract total problems solved - try multiple selectors
      let totalSolved = 0;
      const solvedSelectors = [
        ".problems-solved",
        ".problemsSolved",
        "[data-problems-solved]",
      ];

      for (const selector of solvedSelectors) {
        const problemsSolvedText = $(selector).text();
        const match = problemsSolvedText.match(/(\d+)/);
        if (match && match[1]) {
          totalSolved = parseInt(match[1]);
          break;
        }
      }

      if (rating === 0 && totalSolved === 0 && !stars) {
        throw new Error("CodeChef profile not found or page structure changed");
      }

      return {
        username,
        rating,
        stars,
        totalSolved,
      };
    } catch (error) {
      console.error("CodeChef scraping error:", error.message);
      throw new Error(`Failed to fetch CodeChef stats: ${error.message}`);
    }
  }

  // Codeforces integration
  static async fetchCodeforcesStats(username) {
    try {
      // First check if user exists
      const userResponse = await axios.get(
        `https://codeforces.com/api/user.info?handles=${username}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
          timeout: 10000,
        },
      );

      // Check for API errors
      if (!userResponse.data || userResponse.data.status !== "OK") {
        throw new Error("Invalid Codeforces API response");
      }

      if (!userResponse.data.result || userResponse.data.result.length === 0) {
        throw new Error("Codeforces user not found");
      }

      const userInfo = userResponse.data.result[0];

      if (!userInfo) {
        throw new Error("Invalid user data from Codeforces");
      }

      // Get user submissions to count solved problems
      const submissionsResponse = await axios.get(
        `https://codeforces.com/api/user.status?handle=${username}&count=1000`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
          timeout: 10000,
        },
      );

      if (
        !submissionsResponse.data ||
        submissionsResponse.data.status !== "OK"
      ) {
        throw new Error("Failed to fetch Codeforces submissions");
      }

      const submissions = submissionsResponse.data.result || [];

      // Count unique problems solved
      const solvedProblems = new Set();
      submissions.forEach((submission) => {
        if (submission && submission.verdict === "OK" && submission.problem) {
          solvedProblems.add(
            `${submission.problem.contestId}${submission.problem.index}`,
          );
        }
      });

      const totalSolved = solvedProblems.size;

      // Determine rank based on rating
      const rating = userInfo.rating || 0;
      let rank = "Newbie";

      if (rating >= 2400) rank = "Grandmaster";
      else if (rating >= 2100) rank = "Master";
      else if (rating >= 1900) rank = "Candidate Master";
      else if (rating >= 1600) rank = "Expert";
      else if (rating >= 1400) rank = "Specialist";
      else if (rating >= 1200) rank = "Pupil";

      return {
        username: userInfo.handle,
        rating,
        rank,
        totalSolved,
      };
    } catch (error) {
      console.error("Codeforces API error:", error.message);
      throw new Error(`Failed to fetch Codeforces stats: ${error.message}`);
    }
  }

  // Main function to fetch stats based on platform
  static async fetchCodingStats(platform, username) {
    switch (platform.toLowerCase()) {
      case "leetcode":
        return await this.fetchLeetCodeStats(username);
      case "codechef":
        return await this.fetchCodeChefStats(username);
      case "codeforces":
        return await this.fetchCodeforcesStats(username);
      default:
        throw new Error("Unsupported platform");
    }
  }

  // Validate username format for each platform
  static validateUsername(platform, username) {
    const patterns = {
      leetcode: /^[a-zA-Z0-9_-]{3,20}$/,
      codechef: /^[a-zA-Z0-9_-]{3,20}$/,
      codeforces: /^[a-zA-Z0-9_]{3,24}$/,
    };

    const pattern = patterns[platform.toLowerCase()];
    if (!pattern) {
      return false;
    }

    return pattern.test(username);
  }

  // Get coding growth analytics
  static async getCodingGrowth(student, months = 6) {
    const growthData = {
      leetcode: { monthlyProgress: [], totalGrowth: 0, consistency: 0 },
      codechef: { monthlyProgress: [], totalGrowth: 0, consistency: 0 },
      codeforces: { monthlyProgress: [], totalGrowth: 0, consistency: 0 },
    };

    // For now, we'll simulate growth data
    // In a real implementation, you'd need to track historical data
    const platforms = ["leetcode", "codechef", "codeforces"];

    platforms.forEach((platform) => {
      const currentStats = student.codingProfiles[platform];
      if (currentStats && currentStats.totalSolved > 0) {
        let previousCount = Math.max(0, currentStats.totalSolved - months * 15);
        let consistentMonths = 0;

        for (let i = months - 1; i >= 0; i--) {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - i);

          // Simulate growth (in real implementation, fetch historical data)
          const monthlyGrowth = Math.floor(Math.random() * 20) + 5;
          previousCount += monthlyGrowth;

          if (monthlyGrowth > 0) consistentMonths++;

          growthData[platform].monthlyProgress.push({
            month: monthAgo.toISOString().slice(0, 7),
            solved: previousCount,
          });
        }

        growthData[platform].totalGrowth =
          currentStats.totalSolved -
          Math.max(0, currentStats.totalSolved - months * 15);
        growthData[platform].consistency = Math.round(
          (consistentMonths / months) * 100,
        );
      }
    });

    return growthData;
  }

  // Get coding insights and recommendations
  static getCodingInsights(student) {
    const insights = {
      overallRating: student.averageCodingRating,
      totalProblemsSolved: student.totalCodingProblems,
      strengths: [],
      weaknesses: [],
      recommendations: [],
      competitionLevel: "Beginner",
    };

    // Analyze performance across platforms
    const platforms = ["leetcode", "codechef", "codeforces"];
    const activePlatforms = platforms.filter(
      (platform) =>
        student.codingProfiles[platform] &&
        student.codingProfiles[platform].totalSolved > 0,
    );

    if (activePlatforms.length === 0) {
      insights.recommendations.push(
        "Start coding on platforms like LeetCode to build your profile",
      );
      return insights;
    }

    // Determine strengths and weaknesses
    activePlatforms.forEach((platform) => {
      const stats = student.codingProfiles[platform];

      if (platform === "leetcode") {
        const easyRatio = stats.easySolved / stats.totalSolved;
        const hardRatio = stats.hardSolved / stats.totalSolved;

        if (hardRatio > 0.1) {
          insights.strengths.push(
            "Strong problem-solving skills with hard problems",
          );
        } else if (easyRatio > 0.8) {
          insights.weaknesses.push(
            "Focus on medium and hard problems to improve",
          );
          insights.recommendations.push(
            "Try solving more medium and hard problems on LeetCode",
          );
        }
      }

      if (stats.rating > 1500) {
        insights.strengths.push(`Strong ${platform} rating`);
      }
    });

    // Determine competition level
    if (insights.overallRating > 2000 || insights.totalProblemsSolved > 500) {
      insights.competitionLevel = "Expert";
    } else if (
      insights.overallRating > 1400 ||
      insights.totalProblemsSolved > 200
    ) {
      insights.competitionLevel = "Intermediate";
    } else if (
      insights.overallRating > 1000 ||
      insights.totalProblemsSolved > 50
    ) {
      insights.competitionLevel = "Advanced Beginner";
    }

    // General recommendations
    if (insights.totalProblemsSolved < 100) {
      insights.recommendations.push(
        "Aim to solve at least 100 problems to build a strong foundation",
      );
    }

    if (activePlatforms.length === 1) {
      insights.recommendations.push(
        "Try multiple coding platforms to diversify your experience",
      );
    }

    return insights;
  }
}

module.exports = {
  fetchCodingStats: CodingPlatformService.fetchCodingStats,
  CodingPlatformService,
};
