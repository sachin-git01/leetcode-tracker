// Model: SuggestionModel handles ALL 4,000+ official LeetCode questions, URL parsing, and auto-completion

const LEVEL_MAP = { 1: "Easy", 2: "Medium", 3: "Hard" };

const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Extract slug from URL if user pastes a LeetCode link
const extractSlugFromInput = (input) => {
  if (!input) return "";
  const match = input.match(/leetcode\.com\/problems\/([^/?#]+)/i);
  if (match && match[1]) {
    return match[1].toLowerCase().trim();
  }
  return slugify(input);
};

// Smart topic inference based on keywords
const inferTopic = (title = "") => {
  const lower = title.toLowerCase();
  if (lower.includes("xor") || lower.includes("bit") || lower.includes("bitwise")) return "Bit Manipulation";
  if (lower.includes("tree") || lower.includes("bst")) return "Tree";
  if (lower.includes("linked list") || lower.includes("list node")) return "Linked List";
  if (lower.includes("stack") || lower.includes("parentheses")) return "Stack";
  if (lower.includes("queue")) return "Queue";
  if (lower.includes("graph") || lower.includes("island") || lower.includes("course") || lower.includes("path")) return "Graph";
  if (lower.includes("dynamic") || lower.includes("subsequence") || lower.includes("climbing") || lower.includes("jump")) return "Dynamic Programming";
  if (lower.includes("matrix") || lower.includes("sudoku")) return "Matrix";
  if (lower.includes("search") || lower.includes("binary search")) return "Binary Search";
  if (lower.includes("palindrome") || lower.includes("string") || lower.includes("anagram") || lower.includes("word")) return "String";
  if (lower.includes("sort")) return "Sorting";
  if (lower.includes("heap") || lower.includes("priority queue") || lower.includes("kth")) return "Heap / Priority Queue";
  if (lower.includes("two pointers") || lower.includes("3sum") || lower.includes("water")) return "Two Pointers";
  if (lower.includes("subarray") || lower.includes("array") || lower.includes("sum")) return "Array";
  return "Array";
};

// Pre-loaded fallback catalog (popular 100+ problems)
let allLeetCodeProblems = [
  { id: 1, title: "Two Sum", slug: "two-sum", difficulty: "Easy", topic: "Array" },
  { id: 1486, title: "XOR Operation in an Array", slug: "xor-operation-in-an-array", difficulty: "Easy", topic: "Bit Manipulation" },
  { id: 2, title: "Add Two Numbers", slug: "add-two-numbers", difficulty: "Medium", topic: "Linked List" },
  { id: 3, title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", difficulty: "Medium", topic: "String" },
  { id: 4, title: "Median of Two Sorted Arrays", slug: "median-of-two-sorted-arrays", difficulty: "Hard", topic: "Binary Search" },
  { id: 15, title: "3Sum", slug: "3sum", difficulty: "Medium", topic: "Two Pointers" },
  { id: 20, title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "Easy", topic: "Stack" },
  { id: 21, title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", difficulty: "Easy", topic: "Linked List" },
  { id: 53, title: "Maximum Subarray", slug: "maximum-subarray", difficulty: "Medium", topic: "Dynamic Programming" },
  { id: 70, title: "Climbing Stairs", slug: "climbing-stairs", difficulty: "Easy", topic: "Dynamic Programming" },
  { id: 121, title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", difficulty: "Easy", topic: "Array" },
  { id: 136, title: "Single Number", slug: "single-number", difficulty: "Easy", topic: "Bit Manipulation" },
  { id: 191, title: "Number of 1 Bits", slug: "number-of-1-bits", difficulty: "Easy", topic: "Bit Manipulation" },
  { id: 206, title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "Easy", topic: "Linked List" },
  { id: 226, title: "Invert Binary Tree", slug: "invert-binary-tree", difficulty: "Easy", topic: "Tree" }
];

let isLoaded = false;

// Async loader: Fetches all 4,000+ problems directly from LeetCode public API
async function loadFullLeetCodeCatalog() {
  try {
    const res = await fetch("https://leetcode.com/api/problems/all/");
    if (!res.ok) return;
    const data = await res.json();

    if (data && Array.isArray(data.stat_status_pairs)) {
      allLeetCodeProblems = data.stat_status_pairs.map((p) => {
        const title = p.stat.question__title;
        const slug = p.stat.question__title_slug;
        const difficulty = LEVEL_MAP[p.difficulty.level] || "Medium";
        return {
          id: p.stat.frontend_question_id || p.stat.question_id,
          title,
          slug,
          difficulty,
          topic: inferTopic(title),
          url: `https://leetcode.com/problems/${slug}/`
        };
      });
      isLoaded = true;
      console.log(`Loaded ${allLeetCodeProblems.length} LeetCode problems into memory.`);
    }
  } catch (err) {
    console.warn("Could not fetch full LeetCode API, using offline catalog:", err.message);
  }
}

// Initial fetch on server start
loadFullLeetCodeCatalog();

// Auto-sync every 24 hours to automatically pull new contest problems
setInterval(loadFullLeetCodeCatalog, 24 * 60 * 60 * 1000);

class SuggestionModel {
  static async refreshCatalog() {
    await loadFullLeetCodeCatalog();
    return allLeetCodeProblems.length;
  }
  static getSlug(title) {
    return extractSlugFromInput(title);
  }

  static getLeetCodeUrl(titleOrUrl) {
    const slug = extractSlugFromInput(titleOrUrl);
    return `https://leetcode.com/problems/${slug}/`;
  }

  static search(query, trackedProblems = [], limit = 10) {
    if (!query || !query.trim()) return [];

    const raw = query.trim();
    const isUrl = raw.includes("leetcode.com/problems/");
    const cleanSlug = extractSlugFromInput(raw);
    const cleanQuery = raw.toLowerCase();

    // 1. If user pasted a URL, find exact match by slug first
    if (isUrl) {
      const match = allLeetCodeProblems.find((p) => p.slug === cleanSlug);
      if (match) {
        return [{
          id: match.id,
          title: match.title,
          topic: match.topic || inferTopic(match.title),
          difficulty: match.difficulty,
          slug: match.slug,
          url: `https://leetcode.com/problems/${match.slug}/`
        }];
      }

      // If not in catalog, construct from slug
      const formattedTitle = cleanSlug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return [{
        title: formattedTitle,
        topic: inferTopic(formattedTitle),
        difficulty: "Easy",
        slug: cleanSlug,
        url: `https://leetcode.com/problems/${cleanSlug}/`
      }];
    }

    // 2. Normal text query search across all 4,000+ problems
    const results = [];
    const seen = new Set();

    // Priority 1: Check tracked problems
    for (const item of trackedProblems) {
      if (!item || !item.title) continue;
      const lower = item.title.toLowerCase();
      if (lower.includes(cleanQuery) && !seen.has(lower)) {
        seen.add(lower);
        const slug = slugify(item.title);
        results.push({
          title: item.title,
          topic: item.topic || "Array",
          difficulty: item.difficulty || "Easy",
          slug,
          url: item.leetcodeUrl || `https://leetcode.com/problems/${slug}/`
        });
      }
    }

    // Priority 2: Check all LeetCode catalog
    for (const item of allLeetCodeProblems) {
      if (!item || !item.title) continue;
      const lower = item.title.toLowerCase();

      // Check title match, slug match, or problem ID number match
      const idMatch = item.id && String(item.id) === cleanQuery;
      if ((lower.includes(cleanQuery) || item.slug.includes(cleanSlug) || idMatch) && !seen.has(lower)) {
        seen.add(lower);
        results.push({
          id: item.id,
          title: item.title,
          topic: item.topic || inferTopic(item.title),
          difficulty: item.difficulty || "Medium",
          slug: item.slug,
          url: `https://leetcode.com/problems/${item.slug}/`
        });

        if (results.length >= limit) break;
      }
    }

    // Fallback: If no match found, create dynamic suggestion based on user's query
    if (results.length === 0 && cleanQuery.length > 2) {
      const slug = slugify(raw);
      results.push({
        title: raw,
        topic: inferTopic(raw),
        difficulty: "Easy",
        slug,
        url: `https://leetcode.com/problems/${slug}/`
      });
    }

    return results;
  }
}

module.exports = SuggestionModel;
