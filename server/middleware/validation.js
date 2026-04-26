const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const filterValidationRules = () => [
  body("minCGPA")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("CGPA must be between 0 and 10")
    .toFloat(),
  body("maxCGPA")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("CGPA must be between 0 and 10")
    .toFloat(),
  body("department").optional().isString().trim().escape(),
  body("year")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Year must be between 1 and 5")
    .toInt(),
  body("skills").optional().isArray().withMessage("Skills must be an array"),
  body("skills.*").optional().isString().trim().escape(),
  body("minLeetcode").optional().isInt({ min: 0 }).toInt(),
  body("minCodechef").optional().isInt({ min: 0 }).toInt(),
  body("minCodeforces").optional().isInt({ min: 0 }).toInt(),
  body("searchQuery").optional().isString().trim().escape(),
  body("placementStatus")
    .optional()
    .isString()
    .isIn(["Placed", "Not Placed", "Any"])
    .withMessage("Invalid placement status"),
];

const shortlistValidationRules = () => [
  body("students")
    .isArray({ min: 1 })
    .withMessage("Students array cannot be empty."),
  body("students.*._id")
    .isMongoId()
    .withMessage("Each student must have a valid ID."),
  body("students.*.academicInfo.cgpa").isFloat({ min: 0, max: 10 }).toFloat(),
  body("students.*.codingProfiles.leetcode.rating")
    .optional()
    .isInt({ min: 0 })
    .toInt(),
  body("students.*.codingProfiles.codechef.rating")
    .optional()
    .isInt({ min: 0 })
    .toInt(),
  body("students.*.codingProfiles.codeforces.rating")
    .optional()
    .isInt({ min: 0 })
    .toInt(),
  body("students.*.skills").isArray(),
  body("students.*.projects").isArray(),
];

const sendUpdateValidationRules = () => [
  body("studentIds")
    .isArray({ min: 1 })
    .withMessage("At least one student ID is required."),
  body("studentIds.*")
    .isMongoId()
    .withMessage("All student IDs must be valid Mongo IDs."),
  body("subject")
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Subject is required and must be less than 100 characters.")
    .escape(),
  body("message")
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Message is required.")
    .escape(),
];

const updateStatusValidationRules = () => [
  body("studentIds")
    .isArray({ min: 1 })
    .withMessage("At least one student ID is required."),
  body("studentIds.*")
    .isMongoId()
    .withMessage("All student IDs must be valid Mongo IDs."),
  body("placementStatus")
    .isString()
    .isIn(["Placed", "Not Placed"])
    .withMessage("Invalid placement status."),
  body("company").optional().isString().trim().escape(),
  body("package").optional().isFloat({ min: 0 }).toFloat(),
];

const exportValidationRules = () => [
  body("studentIds")
    .isArray({ min: 1 })
    .withMessage("At least one student ID is required."),
  body("studentIds.*")
    .isMongoId()
    .withMessage("All student IDs must be valid Mongo IDs."),
  body("format")
    .isString()
    .isIn(["csv", "json"])
    .withMessage("Invalid export format."),
];

module.exports = {
  filterValidationRules,
  shortlistValidationRules,
  sendUpdateValidationRules,
  updateStatusValidationRules,
  exportValidationRules,
  handleValidationErrors,
};
