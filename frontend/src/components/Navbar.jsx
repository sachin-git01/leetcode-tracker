import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showConfirmSignOut, setShowConfirmSignOut] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showConfirmSignOut) {
        setShowConfirmSignOut(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showConfirmSignOut]);

  return (
    <>
      <header className="app-navbar">
        <div className="navbar-inner">
          {/* Brand Logo & Name */}
          <div className="navbar-brand">
            <div className="brand-icon-wrapper">
              <span className="brand-icon">⚡</span>
            </div>
            <span className="brand-title">
              LeetCode <span className="brand-accent">Tracker</span>
            </span>
          </div>

          {/* Right Auth / Profile Section (Only shown when logged in) */}
          <div className="navbar-actions">
            {isAuthenticated && user && (
              <div className="user-profile-badge">
                <div className="user-avatar-wrapper">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="user-avatar"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="user-avatar-initials">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="user-status-dot" title="Connected to MongoDB Atlas" />
                </div>

                <div className="user-meta">
                  <span className="user-name" title={user.name}>
                    {user.name}
                  </span>
                  <span className="user-email" title={user.email}>
                    {user.email}
                  </span>
                </div>

                <button
                  type="button"
                  className="sign-out-btn"
                  onClick={() => setShowConfirmSignOut(true)}
                  title="Sign out of account"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sign Out Confirmation Modal */}
      {showConfirmSignOut && (
        <div className="modal-overlay" onClick={() => setShowConfirmSignOut(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-badge danger">🚪</div>
            <h3>Sign Out?</h3>
            <p>
              Are you sure you want to sign out of <strong>{user?.email || "your account"}</strong>?
            </p>
            <div className="modal-buttons">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowConfirmSignOut(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-btn"
                onClick={() => {
                  setShowConfirmSignOut(false);
                  logout();
                }}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
