import { useState } from "react";
import "./ProblemCard.css";

function ProblemCard({
  problem,
  index,
  updateProblem,
  setDeleteIndex,
  openNoteModal,
  toggleFavorite,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(problem.title);

  const handleSave = () => {
    const trimmedTitle = editedTitle.trim();
    if (trimmedTitle === "") return;
    updateProblem(index, { title: trimmedTitle });
    setIsEditing(false);
  };

  const slug = problem.title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const leetcodeLink = problem.leetcodeUrl || `https://leetcode.com/problems/${slug}/`;
  const diffClass = (problem.difficulty || "Easy").toLowerCase();
  const isFav = Boolean(problem.isFavorite);

  return (
    <div className={`problem-row ${isFav ? "is-favorite-row" : ""}`}>
      {/* Favorite Star Button */}
      {toggleFavorite && (
        <button
          className={`fav-star-btn ${isFav ? "active" : ""}`}
          title={isFav ? "Remove from Favorites" : "Mark as Favorite"}
          onClick={() => toggleFavorite(index)}
        >
          {isFav ? "★" : "☆"}
        </button>
      )}

      {/* Primary Column: Title & LeetCode direct link */}
      <div className="problem-primary-col">
        {isEditing ? (
          <input
            type="text"
            className="problem-edit-input"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
          />
        ) : (
          <a
            href={leetcodeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="problem-title-link"
            title={`Open "${problem.title}" on LeetCode ↗`}
          >
            <span className="problem-name-text">{problem.title}</span>
            <span className="leetcode-pill">
              LeetCode <span className="arrow-icon">↗</span>
            </span>
          </a>
        )}
      </div>

      {/* Topic Pill */}
      <div className="problem-topic-col">
        <span className="topic-pill">{problem.topic}</span>
      </div>

      {/* Difficulty Chip */}
      <div className="problem-difficulty-col">
        <span className={`diff-chip ${diffClass}`}>
          <span className="diff-dot" />
          {problem.difficulty}
        </span>
      </div>

      {/* Note Action */}
      <div className="problem-note-col">
        <button
          className={`note-action-btn ${problem.note ? "has-note" : ""}`}
          title={problem.note ? "View / Edit Note" : "Add Note"}
          onClick={() => openNoteModal(index)}
        >
          {problem.note ? "📝 Note" : "+ Note"}
        </button>
      </div>

      {/* Edit & Delete Action Buttons */}
      <div className="problem-actions-col">
        {isEditing ? (
          <button className="save-btn" onClick={handleSave} title="Save changes">
            Save
          </button>
        ) : (
          <button className="edit-btn" onClick={() => setIsEditing(true)} title="Edit problem title">
            Edit
          </button>
        )}

        <button className="delete-btn" onClick={() => setDeleteIndex(index)} title="Delete problem">
          Delete
        </button>
      </div>
    </div>
  );
}

export default ProblemCard;
