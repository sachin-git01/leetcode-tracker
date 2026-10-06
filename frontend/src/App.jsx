import { useEffect, useMemo, useRef, useState } from "react";
import ProblemCard from "./components/ProblemCard";
import Navbar from "./components/Navbar";
import LandingHero from "./components/LandingHero";
import { useAuth } from "./context/AuthContext";
import "./App.css";

const BACKEND_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const API_BASE = `${BACKEND_URL}/problems`;
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const TOPICS = [
  "Array", "String", "Linked List", "Stack", "Queue", "HashMap", "HashSet",
  "Two Pointers", "Sliding Window", "Binary Search", "Recursion", "Backtracking",
  "Sorting", "Heap / Priority Queue", "Tree", "Binary Tree", "BST", "Trie",
  "Graph", "BFS", "DFS", "Greedy", "Dynamic Programming", "Bit Manipulation",
  "Math", "Matrix", "Prefix Sum", "Segment Tree", "Fenwick Tree", "Union Find (DSU)",
  "Topological Sort", "Shortest Path", "Minimum Spanning Tree", "Interval",
  "Monotonic Stack", "Monotonic Queue", "Others"
];

const TOPIC_EMOJIS = {
  Array: "🧊",
  String: "🔤",
  "Linked List": "🔗",
  Stack: "🥞",
  Queue: "🚶",
  HashMap: "🗺️",
  HashSet: "📦",
  "Two Pointers": "👉",
  "Sliding Window": "🪟",
  "Binary Search": "🔍",
  Recursion: "🌀",
  Backtracking: "🔙",
  Sorting: "📊",
  "Heap / Priority Queue": "🏔️",
  Tree: "🌲",
  "Binary Tree": "🌿",
  BST: "🪴",
  Trie: "🪸",
  Graph: "🕸️",
  BFS: "🌊",
  DFS: "⛏️",
  Greedy: "💰",
  "Dynamic Programming": "⚡",
  "Bit Manipulation": "⚙️",
  Math: "📐",
  Matrix: "⊞",
  "Prefix Sum": "➕",
  "Segment Tree": "🎋",
  "Fenwick Tree": "🎋",
  "Union Find (DSU)": "🤝",
  "Topological Sort": "🧗",
  "Shortest Path": "🗺️",
  "Minimum Spanning Tree": "🌐",
  Interval: "⏳",
  "Monotonic Stack": "🪜",
  "Monotonic Queue": "🛤️",
  Others: "🧩"
};

const getMasteryRank = (count) => {
  if (count === 0) return { title: "Get Started", badge: "🚀", color: "#818cf8" };
  if (count <= 10) return { title: "Problem Solver", badge: "⚡", color: "#6366f1" };
  if (count <= 30) return { title: "Code Specialist", badge: "🔥", color: "#38bdf8" };
  if (count <= 75) return { title: "LeetCode Knight", badge: "⚔️", color: "#10b981" };
  if (count <= 150) return { title: "DSA Master", badge: "🏆", color: "#fbbf24" };
  return { title: "Grandmaster", badge: "👑", color: "#f43f5e" };
};

function App() {
  const { isAuthenticated, authHeader, token } = useAuth();

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [deleteIndex, setDeleteIndex] = useState(null);

  // Suggestions for Problem Name input
  const [addSuggestions, setAddSuggestions] = useState([]);
  const [showAddSuggestions, setShowAddSuggestions] = useState(false);

  // Filters & Search within Solved List
  const [activeFilter, setActiveFilter] = useState("ALL"); // ALL, Easy, Medium, Hard, FAVORITES, REVISION
  const [filterSearch, setFilterSearch] = useState("");

  // Modals & Note state
  const [noteIndex, setNoteIndex] = useState(null);
  const [noteText, setNoteText] = useState("");

  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [openTopics, setOpenTopics] = useState({});
  const [problems, setProblems] = useState([]);

  const addInputRef = useRef(null);
  const addInputContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const loadProblems = () => {
    if (!isAuthenticated) {
      setProblems([]);
      return;
    }
    fetch(API_BASE, { headers: authHeader })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) setProblems([]);
          return [];
        }
        return res.json();
      })
      .then((data) => setProblems(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load problems:", err));
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProblems();
    } else {
      setProblems([]);
    }
  }, [isAuthenticated, token]);

  // Global Keyboard Shortcuts (/ to focus input, Esc to close modals)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        addInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowAddSuggestions(false);
        setNoteIndex(null);
        setDeleteIndex(null);
        setShowDuplicateModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch suggestions for problem name input
  useEffect(() => {
    const trimmed = title.trim();
    if (!trimmed) {
      setAddSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`${API_BASE}/suggestions?q=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data) => {
          setAddSuggestions(Array.isArray(data) ? data : []);
          setShowAddSuggestions(true);
        })
        .catch((err) => console.error("Failed to load suggestions:", err));
    }, 150);

    return () => clearTimeout(timer);
  }, [title]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addInputContainerRef.current && !addInputContainerRef.current.contains(e.target)) {
        setShowAddSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addProblem = (customData = null) => {
    if (!isAuthenticated) {
      alert("Please sign in with Google (at the top right) to save problems to your MongoDB database!");
      return;
    }

    const probTitle = (customData?.title || title).trim();
    if (!probTitle) return;

    const exists = problems.some(
      (problem) => problem.title.toLowerCase().trim() === probTitle.toLowerCase()
    );

    if (exists) {
      setShowDuplicateModal(true);
      return;
    }

    const newProblem = {
      title: probTitle,
      topic: customData?.topic || topic || "Array",
      difficulty: customData?.difficulty || difficulty || "Easy",
      note: "",
      isFavorite: false,
      status: "Solved",
      timeComplexity: "",
      spaceComplexity: ""
    };

    fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify(newProblem),
    })
      .then((res) => res.json())
      .then(() => loadProblems())
      .catch((err) => console.error("Failed to add problem:", err));

    setTitle("");
    setTopic("Array");
    setDifficulty("Easy");
    setShowAddSuggestions(false);
  };

  const selectAddSuggestion = (item) => {
    setTitle(item.title);
    setTopic(item.topic || "Array");
    setDifficulty(item.difficulty || "Easy");
    setShowAddSuggestions(false);
  };

  const deleteProblem = (indexToDelete) => {
    const target = problems[indexToDelete];
    if (target?.id) {
      fetch(`${API_BASE}/${target.id}`, { method: "DELETE", headers: authHeader })
        .then(() => loadProblems())
        .catch(() => {
          setProblems((prev) => prev.filter((_, idx) => idx !== indexToDelete));
        });
    } else {
      setProblems((prev) => prev.filter((_, idx) => idx !== indexToDelete));
    }
  };

  const updateProblem = (index, updatedFields) => {
    const target = problems[index];
    if (target?.id) {
      fetch(`${API_BASE}/${target.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(updatedFields),
      })
        .then(() => loadProblems())
        .catch(() => {
          const updated = [...problems];
          updated[index] = { ...updated[index], ...updatedFields };
          setProblems(updated);
        });
    } else {
      const updated = [...problems];
      updated[index] = { ...updated[index], ...updatedFields };
      setProblems(updated);
    }
  };

  const toggleFavorite = (index) => {
    const current = Boolean(problems[index]?.isFavorite);
    updateProblem(index, { isFavorite: !current });
  };

  const saveNoteModal = () => {
    if (noteIndex === null) return;
    updateProblem(noteIndex, { note: noteText });
    setNoteIndex(null);
  };

  const openNoteModal = (index) => {
    const p = problems[index];
    if (!p) return;
    setNoteIndex(index);
    setNoteText(p.note || "");
  };

  const toggleTopic = (topicName) => {
    setOpenTopics((prev) => ({
      ...prev,
      [topicName]: !(prev[topicName] ?? true),
    }));
  };

  const expandAllTopics = () => {
    const allOpen = {};
    topics.forEach((t) => (allOpen[t] = true));
    setOpenTopics(allOpen);
  };

  const collapseAllTopics = () => {
    const allClosed = {};
    topics.forEach((t) => (allClosed[t] = false));
    setOpenTopics(allClosed);
  };

  // Submit imported problem list to backend
  const submitImportedProblems = async (importedList) => {
    if (!isAuthenticated) {
      alert("Please sign in with Google first to import problems into your MongoDB account!");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ problems: importedList }),
      });
      const data = await res.json();
      if (res.ok) {
        loadProblems();
        alert(`✅ Successfully imported ${data.problems?.length || importedList.length} problems!`);
      } else {
        alert(data.error || "Failed to import problems");
      }
    } catch (err) {
      alert("Server error during import: " + err.message);
    }
  };

  // Export Executive PDF with embedded restore metadata (dynamically imported for speed)
  const exportPDF = async () => {
    if (problems.length === 0) {
      alert("No problems to export yet! Add some solved problems first.");
      return;
    }

    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Dark Executive Header Banner
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.rect(0, 0, pageWidth, 75, "F");

    // Title
    doc.setTextColor(248, 250, 252);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("LeetCode Tracker — Solved Problems Portfolio", 36, 32);

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // #94a3b8
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    doc.text(`Generated on ${dateStr} • Algorithmic Problem Solving Record`, 36, 48);

    // Summary line
    const statsLine = `Total: ${totalProblems}  |  Easy: ${easyCount}  |  Medium: ${mediumCount}  |  Hard: ${hardCount}  |  Favorites: ${favCount}`;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(165, 180, 252); // #a5b4fc
    doc.text(statsLine, 36, 64);

    // Table rows
    const tableRows = problems.map((p, idx) => [
      idx + 1,
      p.title,
      p.topic || "General",
      p.difficulty || "Easy",
      p.note ? p.note : "—",
    ]);

    autoTable(doc, {
      startY: 90,
      head: [["#", "Problem Title", "Topic", "Difficulty", "Study Notes"]],
      body: tableRows,
      margin: { left: 36, right: 36, bottom: 40 },
      theme: "striped",
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: 6,
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: [30, 41, 59], // #1e293b
        textColor: [248, 250, 252],
        fontStyle: "bold",
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 26, halign: "center", fontStyle: "bold" },
        1: { cellWidth: 155, fontStyle: "bold", textColor: [37, 99, 235] },
        2: { cellWidth: 85, textColor: [71, 85, 105] },
        3: { cellWidth: 65, halign: "center", fontStyle: "bold" },
        4: { cellWidth: "auto", textColor: [51, 65, 85], fontStyle: "italic" },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 3) {
          const val = String(data.cell.raw).toLowerCase();
          if (val === "easy") {
            data.cell.styles.textColor = [16, 185, 129];
          } else if (val === "medium") {
            data.cell.styles.textColor = [217, 119, 6];
          } else if (val === "hard") {
            data.cell.styles.textColor = [225, 29, 72];
          }
        }
      },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 1) {
          const problem = problems[data.row.index];
          if (problem?.leetcodeUrl) {
            doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
              url: problem.leetcodeUrl,
            });
          }
        }
      },
      didDrawPage: () => {
        const pageNum = doc.internal.getNumberOfPages();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 16, { align: "center" });
      },
    });

    // Embed lossless backup payload inside PDF
    const jsonString = JSON.stringify(problems);
    const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
    doc.setProperties({
      title: "LeetCode Tracker Solved Problems",
      subject: `LEETCODE_BACKUP:${base64Data}`,
      creator: "LeetCode Tracker App",
    });

    // Write text comment token
    doc.internal.write(`%LEETCODE_BACKUP_BEGIN:${base64Data}:LEETCODE_BACKUP_END%`);

    const filename = `leetcode-tracker-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  };

  // Import PDF or JSON file
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    e.target.value = ""; // reset so same file can be selected again

    try {
      if (fileName.endsWith(".json")) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await submitImportedProblems(parsed);
        } else {
          alert("Invalid JSON format: expected a non-empty array of problems.");
        }
      } else if (fileName.endsWith(".pdf") || file.type.includes("pdf")) {
        const text = await file.text();

        // 1. Search for embedded lossless backup token
        const match =
          text.match(/LEETCODE_BACKUP:([A-Za-z0-9+/=]+)/) ||
          text.match(/%LEETCODE_BACKUP_BEGIN:([A-Za-z0-9+/=]+):LEETCODE_BACKUP_END%/);

        if (match && match[1]) {
          try {
            const decodedJson = decodeURIComponent(escape(atob(match[1])));
            const parsed = JSON.parse(decodedJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              await submitImportedProblems(parsed);
              return;
            }
          } catch (err) {
            console.warn("Base64 token decode failed:", err);
          }
        }

        // 2. Intelligent scan for LeetCode URL slugs in PDF text
        const urlMatches = [...text.matchAll(/leetcode\.com\/problems\/([a-zA-Z0-9-]+)/g)];
        if (urlMatches.length > 0) {
          const uniqueSlugs = Array.from(new Set(urlMatches.map((m) => m[1].toLowerCase())));
          const extractedProblems = uniqueSlugs.map((slug) => {
            const cleanTitle = slug
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");
            return {
              title: cleanTitle,
              topic: "Array",
              difficulty: "Medium",
              note: "",
              isFavorite: false,
              leetcodeUrl: `https://leetcode.com/problems/${slug}/`,
            };
          });

          if (extractedProblems.length > 0) {
            await submitImportedProblems(extractedProblems);
            return;
          }
        }

        alert("Could not detect LeetCode problems in this PDF. Please select a PDF exported from LeetCode Tracker.");
      } else {
        alert("Please select a valid .pdf or .json file.");
      }
    } catch (err) {
      console.error("Import failed:", err);
      alert("Failed to read file: " + err.message);
    }
  };

  // Stats Calculations
  const totalProblems = problems.length;
  const easyCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardCount = problems.filter((p) => p.difficulty === "Hard").length;
  const favCount = problems.filter((p) => Boolean(p.isFavorite)).length;

  const easyPct = totalProblems ? Math.round((easyCount / totalProblems) * 100) : 0;
  const mediumPct = totalProblems ? Math.round((mediumCount / totalProblems) * 100) : 0;
  const hardPct = totalProblems ? Math.round((hardCount / totalProblems) * 100) : 0;

  const rank = getMasteryRank(totalProblems);

  // Filtered & Grouped Problems
  const filteredProblems = useMemo(() => {
    return problems
      .map((problem, index) => ({ problem, index }))
      .filter(({ problem }) => {
        // Difficulty / category filter
        if (activeFilter === "Easy" && problem.difficulty !== "Easy") return false;
        if (activeFilter === "Medium" && problem.difficulty !== "Medium") return false;
        if (activeFilter === "Hard" && problem.difficulty !== "Hard") return false;
        if (activeFilter === "FAVORITES" && !problem.isFavorite) return false;

        // Search text inside collection
        if (filterSearch.trim()) {
          const q = filterSearch.toLowerCase().trim();
          const matchTitle = problem.title.toLowerCase().includes(q);
          const matchTopic = problem.topic.toLowerCase().includes(q);
          const matchNote = (problem.note || "").toLowerCase().includes(q);
          if (!matchTitle && !matchTopic && !matchNote) return false;
        }

        return true;
      });
  }, [problems, activeFilter, filterSearch]);

  const groupedByTopic = useMemo(() => {
    return filteredProblems.reduce((acc, item) => {
      const { problem } = item;
      if (!acc[problem.topic]) {
        acc[problem.topic] = [];
      }
      acc[problem.topic].push(item);
      return acc;
    }, {});
  }, [filteredProblems]);

  const topics = Object.keys(groupedByTopic);

  return (
    <div className="app-layout">
      {/* Top Full-Width Navigation Bar - only rendered for authenticated users */}
      {isAuthenticated && <Navbar />}

      {!isAuthenticated ? (
        <div className="landing-page-wrapper">
          <LandingHero />
        </div>
      ) : (
        <div className="container">
          {/* Hidden File Input for Backup Import */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".pdf,.json,application/pdf,application/json"
            onChange={handleImportFile}
          />

          {/* Hero Header */}
          <header className="hero">
            <div className="hero-top-badge-row">
              <div className="hero-badge">
                <span className="pulse-dot" />
                <span>DSA MASTERY TRACKER</span>
              </div>
              <div className="rank-badge" style={{ borderColor: rank.color, color: rank.color }}>
                <span>{rank.badge}</span>
                <span>{rank.title}</span>
              </div>
            </div>

            <h1 className="hero-title">LeetCode Tracker</h1>
            <p className="hero-subtitle">
              Your personal workspace to track, master, and export Data Structures &amp; Algorithms problems
            </p>
          </header>

          {/* Bento Stats Section */}
          <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon-wrapper">
              <span className="stat-icon">⚡</span>
            </div>
            <div className="stat-data">
              <span className="stat-label">Total Solved</span>
              <span className="stat-value">{totalProblems}</span>
            </div>
          </div>

          <div className="stat-card stat-easy">
            <div className="stat-icon-wrapper">
              <span className="stat-icon">🟢</span>
            </div>
            <div className="stat-data">
              <div className="stat-top-row">
                <span className="stat-label">Easy</span>
                <span className="stat-pct">{easyPct}%</span>
              </div>
              <span className="stat-value">{easyCount}</span>
            </div>
          </div>

          <div className="stat-card stat-medium">
            <div className="stat-icon-wrapper">
              <span className="stat-icon">🟡</span>
            </div>
            <div className="stat-data">
              <div className="stat-top-row">
                <span className="stat-label">Medium</span>
                <span className="stat-pct">{mediumPct}%</span>
              </div>
              <span className="stat-value">{mediumCount}</span>
            </div>
          </div>

          <div className="stat-card stat-hard">
            <div className="stat-icon-wrapper">
              <span className="stat-icon">🔴</span>
            </div>
            <div className="stat-data">
              <div className="stat-top-row">
                <span className="stat-label">Hard</span>
                <span className="stat-pct">{hardPct}%</span>
              </div>
              <span className="stat-value">{hardCount}</span>
            </div>
          </div>
        </div>

        {/* Progress Breakdown Meter */}
        {totalProblems > 0 && (
          <div className="progress-meter-container">
            <div className="progress-meter-bar">
              <div
                className="progress-segment segment-easy"
                style={{ width: `${(easyCount / totalProblems) * 100}%` }}
                title={`Easy: ${easyCount} (${easyPct}%)`}
              />
              <div
                className="progress-segment segment-medium"
                style={{ width: `${(mediumCount / totalProblems) * 100}%` }}
                title={`Medium: ${mediumCount} (${mediumPct}%)`}
              />
              <div
                className="progress-segment segment-hard"
                style={{ width: `${(hardCount / totalProblems) * 100}%` }}
                title={`Hard: ${hardCount} (${hardPct}%)`}
              />
            </div>
          </div>
        )}
      </section>

      {/* Add Problem Form Section */}
      <section className="form-card">
        <div className="form-header">
          <div className="form-title-group">
            <span className="form-title">⚡ Add Solved Problem</span>
          </div>
          <span className="form-hint">Search by name, question ID (#1486), or paste any LeetCode link</span>
        </div>

        <div className="form-row">
          <div className="add-input-wrapper" ref={addInputContainerRef}>
            <div className="input-with-icon">
              <span className="input-icon">🔍</span>
              <input
                ref={addInputRef}
                onKeyDown={(e) => e.key === "Enter" && addProblem()}
                type="text"
                placeholder="Search by name, ID (#1486) or paste URL..."
                value={title}
                onFocus={() => title.trim() && setShowAddSuggestions(true)}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {showAddSuggestions && title.trim() && addSuggestions.length > 0 && (
              <div className="suggestions-dropdown add-dropdown">
                <div className="suggestions-header">
                  <span>💡 Matching LeetCode Problems ({addSuggestions.length})</span>
                </div>
                <div className="suggestions-list">
                  {addSuggestions.map((item) => (
                    <div
                      key={`add-${item.slug}`}
                      className="suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectAddSuggestion(item);
                      }}
                    >
                      <div className="suggestion-left">
                        {item.id && <span className="suggestion-id">#{item.id}</span>}
                        <span className="suggestion-title" title={item.title}>
                          {item.title}
                        </span>
                      </div>
                      <div className="suggestion-right">
                        <span className="suggestion-topic">{item.topic}</span>
                        <span className={`diff-badge ${item.difficulty.toLowerCase()}`}>
                          {item.difficulty}
                        </span>
                        <button
                          type="button"
                          className="preview-link-btn"
                          title="Open on LeetCode ↗"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.url, "_blank", "noopener,noreferrer");
                          }}
                        >
                          ↗
                        </button>
                        <span className="select-badge">↵ Select</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="select-wrapper">
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="" disabled>Choose topic</option>
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {TOPIC_EMOJIS[t] ? `${TOPIC_EMOJIS[t]} ` : ""}{t}
                </option>
              ))}
            </select>
          </div>

          <div className="select-wrapper">
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="" disabled>Choose difficulty</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <button className="add-btn" onClick={() => addProblem()}>
            <span>+ Add Problem</span>
          </button>
        </div>
      </section>

      {/* Control Bar: Filters, Quick Search & Actions */}
      <section className="control-bar-section">
        <div className="filter-chips-row">
          <button
            className={`filter-chip ${activeFilter === "ALL" ? "active" : ""}`}
            onClick={() => setActiveFilter("ALL")}
          >
            All ({totalProblems})
          </button>
          <button
            className={`filter-chip easy ${activeFilter === "Easy" ? "active" : ""}`}
            onClick={() => setActiveFilter("Easy")}
          >
            🟢 Easy ({easyCount})
          </button>
          <button
            className={`filter-chip medium ${activeFilter === "Medium" ? "active" : ""}`}
            onClick={() => setActiveFilter("Medium")}
          >
            🟡 Medium ({mediumCount})
          </button>
          <button
            className={`filter-chip hard ${activeFilter === "Hard" ? "active" : ""}`}
            onClick={() => setActiveFilter("Hard")}
          >
            🔴 Hard ({hardCount})
          </button>
          <button
            className={`filter-chip fav ${activeFilter === "FAVORITES" ? "active" : ""}`}
            onClick={() => setActiveFilter("FAVORITES")}
          >
            ⭐ Favorites ({favCount})
          </button>
        </div>

        <div className="control-actions-row">
          <div className="filter-search-box">
            <span>🔎</span>
            <input
              type="text"
              placeholder="Filter solved problems..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
            />
            {filterSearch && (
              <button className="clear-filter-btn" onClick={() => setFilterSearch("")}>✕</button>
            )}
          </div>

          <div className="action-buttons-group">
            <button className="utility-btn" onClick={expandAllTopics} title="Expand all topic sections">
              Expand All
            </button>
            <button className="utility-btn" onClick={collapseAllTopics} title="Collapse all topic sections">
              Collapse All
            </button>
            <button className="utility-btn export-pdf-btn" onClick={exportPDF} title="Export executive PDF report with all solved problems">
              📄 Export PDF
            </button>
            <button className="utility-btn import-pdf-btn" onClick={() => fileInputRef.current?.click()} title="Import problems from PDF (or JSON backup)">
              📥 Import PDF
            </button>
          </div>
        </div>
      </section>

      {/* Main Problems Collection Header */}
      <div className="collection-header">
        <div className="collection-title-wrap">
          <span className="collection-icon">📚</span>
          <h2 className="collection-title">Solved Problems Repository</h2>
        </div>
        <span className="collection-count">{filteredProblems.length} Problems Showing</span>
      </div>

      {topics.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-emoji">🚀</span>
          <h3>{filterSearch || activeFilter !== "ALL" ? "No problems match your filter" : "No problems added yet"}</h3>
          <p>
            {filterSearch || activeFilter !== "ALL"
              ? "Try resetting your filter or searching for another keyword."
              : "Start your DSA grind! Type any problem name, question number, or paste a link in the box above to track it here."}
          </p>
          {(filterSearch || activeFilter !== "ALL") && (
            <button
              className="reset-filter-btn"
              onClick={() => {
                setActiveFilter("ALL");
                setFilterSearch("");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="topics-container">
          {topics.map((topicName) => {
            const topicProblems = groupedByTopic[topicName];
            const isOpen = openTopics[topicName] ?? true;

            const counts = DIFFICULTIES.reduce((acc, diff) => {
              acc[diff] = topicProblems.filter((i) => i.problem.difficulty === diff).length;
              return acc;
            }, {});

            const emoji = TOPIC_EMOJIS[topicName] || "📁";

            return (
              <div className="topic-card" key={topicName}>
                <button
                  className="topic-header"
                  onClick={() => toggleTopic(topicName)}
                  aria-expanded={isOpen}
                >
                  <div className="topic-header-left">
                    <span className="topic-emoji-badge">{emoji}</span>
                    <div>
                      <div className="topic-title">{topicName}</div>
                      <div className="topic-badges-row">
                        {counts.Easy > 0 && <span className="mini-badge easy">{counts.Easy} Easy</span>}
                        {counts.Medium > 0 && <span className="mini-badge medium">{counts.Medium} Medium</span>}
                        {counts.Hard > 0 && <span className="mini-badge hard">{counts.Hard} Hard</span>}
                      </div>
                    </div>
                  </div>

                  <div className="topic-header-right">
                    <span className="topic-total-pill">{topicProblems.length} Problems</span>
                    <span className={`topic-arrow ${isOpen ? "open" : ""}`}>
                      ▼
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="topic-body">
                    {DIFFICULTIES.map((diff) => {
                      const diffProblems = topicProblems.filter(
                        (i) => i.problem.difficulty === diff
                      );

                      if (diffProblems.length === 0) return null;

                      return (
                        <div className={`difficulty-group group-${diff.toLowerCase()}`} key={diff}>
                          <div className="difficulty-group-header">
                            <span className={`difficulty-indicator ${diff.toLowerCase()}`}>
                              <span className="diff-dot" />
                              {diff}
                            </span>
                            <span className="difficulty-count-pill">
                              {diffProblems.length} {diffProblems.length === 1 ? "Problem" : "Problems"}
                            </span>
                          </div>

                          <div className="difficulty-problems-list">
                            {diffProblems.map(({ problem, index }) => (
                              <ProblemCard
                                key={`${topicName}-${diff}-${problem.id || index}`}
                                problem={problem}
                                index={index}
                                deleteProblem={deleteProblem}
                                updateProblem={updateProblem}
                                setDeleteIndex={setDeleteIndex}
                                openNoteModal={openNoteModal}
                                toggleFavorite={toggleFavorite}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteIndex !== null && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon-badge danger">🗑️</div>
            <h3>Delete Problem?</h3>
            <p>
              Are you sure you want to remove <strong>"{problems[deleteIndex]?.title}"</strong> from your tracker?
            </p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setDeleteIndex(null)}>
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={() => {
                  deleteProblem(deleteIndex);
                  setDeleteIndex(null);
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Warning Modal */}
      {showDuplicateModal && (
        <div className="modal-overlay">
          <div className="modal duplicate-modal">
            <div className="modal-icon-badge warning">⚠️</div>
            <h3>Already in Tracker</h3>
            <p>This problem is already added to your solved repository.</p>
            <button
              className="ok-btn"
              onClick={() => setShowDuplicateModal(false)}
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Problem Study Note Modal */}
      {noteIndex !== null && (
        <div className="modal-overlay">
          <div className="modal note-modal">
            <div className="modal-icon-badge note">📝</div>
            <h3>Problem Study Notes</h3>
            <p className="note-subtitle">
              Problem: <strong>{problems[noteIndex]?.title}</strong>
            </p>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write your intuition, key pattern, approach, or edge cases here..."
              rows={6}
              autoFocus
            />

            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setNoteIndex(null)}>
                Cancel
              </button>
              <button className="save-btn" onClick={saveNoteModal}>
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}

export default App;
