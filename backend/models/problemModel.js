// Model: Handles data storage and operations
const SuggestionModel = require("./suggestionModel");

let problems = [
  {
    id: 1,
    title: "Two Sum",
    topic: "Array",
    difficulty: "Easy",
    note: "Hash Map complement lookup in O(N) time.",
    isFavorite: true,
    leetcodeUrl: "https://leetcode.com/problems/two-sum/"
  }
];

class ProblemModel {
  static getAll() {
    return problems.map((p) => ({
      ...p,
      isFavorite: Boolean(p.isFavorite),
      note: p.note || "",
      leetcodeUrl: p.leetcodeUrl || SuggestionModel.getLeetCodeUrl(p.title)
    }));
  }

  static getById(id) {
    const problem = problems.find((p) => p.id === Number(id));
    if (!problem) return null;
    return {
      ...problem,
      isFavorite: Boolean(problem.isFavorite),
      note: problem.note || "",
      leetcodeUrl: problem.leetcodeUrl || SuggestionModel.getLeetCodeUrl(problem.title)
    };
  }

  static findByTitle(title) {
    return problems.find(
      (p) => p.title.toLowerCase().trim() === title.toLowerCase().trim()
    );
  }

  static create(problemData) {
    const newProblem = {
      id: problems.length > 0 ? Math.max(...problems.map((p) => p.id || 0)) + 1 : 1,
      title: problemData.title.trim(),
      topic: problemData.topic || "Array",
      difficulty: problemData.difficulty || "Easy",
      note: problemData.note || "",
      isFavorite: Boolean(problemData.isFavorite),
      leetcodeUrl: SuggestionModel.getLeetCodeUrl(problemData.title)
    };
    problems.push(newProblem);
    return newProblem;
  }

  static update(id, updatedData) {
    const index = problems.findIndex((p) => p.id === Number(id));
    if (index === -1) return null;

    const updated = { ...problems[index], ...updatedData };
    if (updatedData.title) {
      updated.leetcodeUrl = SuggestionModel.getLeetCodeUrl(updatedData.title);
    }
    problems[index] = updated;
    return problems[index];
  }

  static delete(id) {
    const index = problems.findIndex((p) => p.id === Number(id));
    if (index === -1) return false;
    problems.splice(index, 1);
    return true;
  }

  static bulkImport(importedProblems) {
    if (!Array.isArray(importedProblems)) return false;
    problems = importedProblems.map((p, idx) => ({
      id: p.id || idx + 1,
      title: p.title || "Untitled",
      topic: p.topic || "Array",
      difficulty: p.difficulty || "Easy",
      note: p.note || "",
      isFavorite: Boolean(p.isFavorite),
      leetcodeUrl: p.leetcodeUrl || SuggestionModel.getLeetCodeUrl(p.title || "")
    }));
    return problems;
  }
}

module.exports = ProblemModel;
