const Problem = require("../models/Problem");
const User = require("../models/User");
const SuggestionModel = require("../models/suggestionModel");

const syncUserStats = async (userId) => {
  try {
    const totalSolved = await Problem.countDocuments({ user: userId });
    const easyCount = await Problem.countDocuments({ user: userId, difficulty: "Easy" });
    const mediumCount = await Problem.countDocuments({ user: userId, difficulty: "Medium" });
    const hardCount = await Problem.countDocuments({ user: userId, difficulty: "Hard" });
    await User.findByIdAndUpdate(userId, {
      totalSolved,
      easyCount,
      mediumCount,
      hardCount
    });
  } catch (err) {
    console.error("Failed to sync user stats:", err.message);
  }
};

const escapeRegex = (str) => (typeof str === "string" ? str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "");

const problemController = {
  // GET /problems
  // Scoped to the authenticated user
  getProblems: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Please log in to view your problems" });
      }

      const { topic, difficulty, status, search, favorite } = req.query;
      const query = { user: req.user._id };

      if (topic && topic !== "All") {
        query.topic = topic;
      }
      if (difficulty && difficulty !== "All") {
        query.difficulty = difficulty;
      }
      if (status && status !== "All") {
        query.status = status;
      }
      if (favorite === "true") {
        query.isFavorite = true;
      }
      if (search && search.trim()) {
        query.title = { $regex: escapeRegex(search.trim()), $options: "i" };
      }

      const problems = await Problem.find(query).sort({ createdAt: -1 });

      const formatted = problems.map((p) => ({
        id: p._id.toString(),
        _id: p._id.toString(),
        title: p.title,
        topic: p.topic,
        difficulty: p.difficulty,
        status: p.status || "Solved",
        note: p.note || "",
        isFavorite: Boolean(p.isFavorite),
        leetcodeUrl: p.leetcodeUrl || SuggestionModel.getLeetCodeUrl(p.title),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }));

      res.status(200).json(formatted);
    } catch (error) {
      console.error("Error in getProblems:", error);
      res.status(500).json({ error: "Failed to fetch problems", details: error.message });
    }
  },

  // GET /problems/suggestions?q=...
  // Public or optionally authenticated
  getSuggestions: async (req, res) => {
    try {
      const query = req.query.q || "";
      let tracked = [];

      if (req.user) {
        tracked = await Problem.find({ user: req.user._id }).select("title");
      }

      const suggestions = SuggestionModel.search(query, tracked);
      res.status(200).json(suggestions);
    } catch (error) {
      console.error("Error in getSuggestions:", error);
      res.status(500).json({ error: "Failed to fetch suggestions", details: error.message });
    }
  },

  // POST /problems
  createProblem: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Please log in to add problems" });
      }

      const { title, topic, difficulty, note, isFavorite, status } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ error: "Title is required" });
      }

      // Check for duplicate title for this specific user
      const existing = await Problem.findOne({
        user: req.user._id,
        title: { $regex: new RegExp("^" + title.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") }
      });

      if (existing) {
        return res.status(409).json({ error: "You have already added this problem to your tracker." });
      }

      const leetcodeUrl = SuggestionModel.getLeetCodeUrl(title.trim());

      const newProblem = await Problem.create({
        user: req.user._id,
        title: title.trim(),
        topic: topic || "Array",
        difficulty: difficulty || "Easy",
        status: status || "Solved",
        note: note || "",
        isFavorite: Boolean(isFavorite),
        leetcodeUrl
      });

      const formatted = {
        id: newProblem._id.toString(),
        _id: newProblem._id.toString(),
        title: newProblem.title,
        topic: newProblem.topic,
        difficulty: newProblem.difficulty,
        status: newProblem.status,
        note: newProblem.note,
        isFavorite: newProblem.isFavorite,
        leetcodeUrl: newProblem.leetcodeUrl,
        createdAt: newProblem.createdAt
      };

      // Sync total & difficulty counts on User document in MongoDB
      await syncUserStats(req.user._id);

      res.status(201).json({
        message: "Problem Added",
        problem: formatted
      });
    } catch (error) {
      console.error("Error in createProblem:", error);
      res.status(500).json({ error: "Failed to create problem", details: error.message });
    }
  },

  // PUT /problems/:id
  updateProblem: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Please log in to update problems" });
      }

      const { id } = req.params;
      const { title, topic, difficulty, note, isFavorite, status, leetcodeUrl } = req.body;

      const problem = await Problem.findOne({ _id: id, user: req.user._id });
      if (!problem) {
        return res.status(404).json({ error: "Problem not found or unauthorized" });
      }

      if (title !== undefined) problem.title = title.trim();
      if (topic !== undefined) problem.topic = topic;
      if (difficulty !== undefined) problem.difficulty = difficulty;
      if (status !== undefined) problem.status = status;
      if (note !== undefined) problem.note = note;
      if (isFavorite !== undefined) problem.isFavorite = Boolean(isFavorite);
      if (leetcodeUrl !== undefined) {
        problem.leetcodeUrl = leetcodeUrl;
      } else if (title) {
        problem.leetcodeUrl = SuggestionModel.getLeetCodeUrl(problem.title);
      }

      await problem.save();

      const formatted = {
        id: problem._id.toString(),
        _id: problem._id.toString(),
        title: problem.title,
        topic: problem.topic,
        difficulty: problem.difficulty,
        status: problem.status,
        note: problem.note,
        isFavorite: problem.isFavorite,
        leetcodeUrl: problem.leetcodeUrl,
        updatedAt: problem.updatedAt
      };

      // Sync user stats if difficulty was updated
      await syncUserStats(req.user._id);

      res.status(200).json({ message: "Problem Updated", problem: formatted });
    } catch (error) {
      console.error("Error in updateProblem:", error);
      res.status(500).json({ error: "Failed to update problem", details: error.message });
    }
  },

  // DELETE /problems/:id
  deleteProblem: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Please log in to delete problems" });
      }

      const { id } = req.params;
      const deleted = await Problem.findOneAndDelete({ _id: id, user: req.user._id });

      if (!deleted) {
        return res.status(404).json({ error: "Problem not found or unauthorized" });
      }

      // Sync user stats after deletion
      await syncUserStats(req.user._id);

      res.status(200).json({ message: "Problem Deleted" });
    } catch (error) {
      console.error("Error in deleteProblem:", error);
      res.status(500).json({ error: "Failed to delete problem", details: error.message });
    }
  },

  // POST /problems/import
  importProblems: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Please log in to import problems" });
      }

      const { problems } = req.body;
      if (!Array.isArray(problems)) {
        return res.status(400).json({ error: "Expected an array of problems" });
      }

      const docsToInsert = problems.map((p) => ({
        user: req.user._id,
        title: (p.title || "Untitled").trim(),
        topic: p.topic || "Array",
        difficulty: p.difficulty || "Easy",
        status: p.status || "Solved",
        note: p.note || "",
        isFavorite: Boolean(p.isFavorite),
        leetcodeUrl: p.leetcodeUrl || SuggestionModel.getLeetCodeUrl(p.title || "")
      }));

      // Insert all
      const inserted = await Problem.insertMany(docsToInsert);
      const formatted = inserted.map((p) => ({
        id: p._id.toString(),
        title: p.title,
        topic: p.topic,
        difficulty: p.difficulty,
        status: p.status,
        note: p.note,
        isFavorite: p.isFavorite,
        leetcodeUrl: p.leetcodeUrl
      }));

      // Sync user stats after bulk import
      await syncUserStats(req.user._id);

      res.status(200).json({ message: "Problems Imported Successfully", problems: formatted });
    } catch (error) {
      console.error("Error in importProblems:", error);
      res.status(500).json({ error: "Failed to import problems", details: error.message });
    }
  }
};

module.exports = problemController;
