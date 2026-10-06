const express = require("express");
const router = express.Router();
const problemController = require("../controllers/problemController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// Problem Routes mapped to controller actions
router.get("/suggestions", optionalAuth, problemController.getSuggestions);
router.get("/", protect, problemController.getProblems);
router.post("/", protect, problemController.createProblem);
router.post("/import", protect, problemController.importProblems);
router.put("/:id", protect, problemController.updateProblem);
router.delete("/:id", protect, problemController.deleteProblem);

module.exports = router;
