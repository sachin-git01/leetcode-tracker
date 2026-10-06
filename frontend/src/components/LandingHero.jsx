import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

const LandingHero = () => {
  const { loginWithGoogle } = useAuth();
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setErrorMsg("");
      await loginWithGoogle(credentialResponse.credential);
    } catch (err) {
      setErrorMsg(err.message || "Failed to sign in with Google.");
    }
  };

  const handleGoogleError = () => {
    setErrorMsg("Google Sign-In was cancelled or failed.");
  };

  return (
    <div className="landing-screen">
      {/* Ambient Backlight (Electric Cyan & Ice Blue - Zero Purple) */}
      <div className="hero-ambient-glow glow-cyan" />
      <div className="hero-ambient-glow glow-blue" />

      {/* The Unified Master Hero Card (Matches Reference Image) */}
      <main className="master-hero-stage">
        <div className="master-hero-card">
          <div className="card-top-light-beam" />

          {/* Card Header */}
          <div className="master-card-header">
            <h1 className="master-card-title">
              Welcome to Your LeetCode <br />
              <span className="master-title-gradient">Mastery Workspace</span>
            </h1>
            <p className="master-card-subtitle">
              Sign up to build, track, and secure your personal problem-solving repository on MongoDB.
            </p>
          </div>

          {/* Interactive Triad Row (Left Visual Graphic | Center Google CTA | Right Telemetry Card) */}
          <div className="master-action-row">
            {/* Left Graphic: Illustrated Coder & Floating DSA Nodes (matches reference image) */}
            <div className="graphic-panel left-panel">
              <svg viewBox="0 0 230 170" fill="none" xmlns="http://www.w3.org/2000/svg" className="coder-illustration-svg">
                {/* Ambient node glow */}
                <circle cx="170" cy="45" r="28" fill="rgba(56, 189, 248, 0.14)" />
                <circle cx="48" cy="85" r="22" fill="rgba(245, 158, 11, 0.12)" />

                {/* Connecting glowing dashed paths */}
                <path d="M125 95 C 135 68, 148 55, 162 42" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.75" />
                <path d="M162 42 C 182 50, 192 70, 182 92" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                <path d="M162 42 C 158 75, 140 105, 130 115" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.55" />

                {/* Floating Node 1: </> (Top) */}
                <g transform="translate(148, 26)">
                  <rect width="48" height="22" rx="6" fill="#0b1329" stroke="#38bdf8" strokeWidth="1.2" />
                  <text x="24" y="15" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">&lt;/&gt;</text>
                </g>

                {/* Floating Node 2: Binary Tree (Right) */}
                <g transform="translate(162, 78)">
                  <rect width="58" height="22" rx="6" fill="#0b1329" stroke="#0ea5e9" strokeWidth="1.2" />
                  <text x="29" y="15" fill="#7dd3fc" fontSize="9" fontWeight="700" textAnchor="middle">Trees</text>
                </g>

                {/* Floating Node 3: DP & Graphs (Bottom) */}
                <g transform="translate(142, 114)">
                  <rect width="54" height="22" rx="6" fill="#0b1329" stroke="#10b981" strokeWidth="1.2" />
                  <text x="27" y="15" fill="#34d399" fontSize="9" fontWeight="700" textAnchor="middle">Graphs</text>
                </g>

                {/* Mini Bar Chart Widget on Left */}
                <g transform="translate(28, 66)">
                  <rect width="36" height="34" rx="8" fill="#0b1329" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />
                  <rect x="7" y="18" width="5" height="10" rx="2" fill="#10b981" />
                  <rect x="15" y="12" width="5" height="16" rx="2" fill="#38bdf8" />
                  <rect x="23" y="8" width="5" height="20" rx="2" fill="#f59e0b" />
                </g>

                {/* Developer Character (Blue shirt, pointing to nodes) */}
                {/* Body / Shirt */}
                <path d="M55 170 C 55 140, 70 128, 90 126 L 120 126 C 140 128, 155 140, 155 170 Z" fill="url(#coderShirtGrad)" />
                {/* Collar */}
                <path d="M98 126 L 105 135 L 112 126 Z" fill="#0b1329" />
                {/* Neck */}
                <rect x="100" y="114" width="10" height="14" fill="#fed7aa" />
                {/* Head / Face */}
                <circle cx="105" cy="98" r="15" fill="#fed7aa" />
                {/* Hair */}
                <path d="M90 96 C 90 82, 98 78, 109 78 C 119 78, 123 83, 123 90 C 123 94, 119 92, 117 94 C 113 90, 100 88, 94 96 Z" fill="#1e293b" />
                {/* Modern Glasses */}
                <rect x="96" y="94" width="8" height="6.5" rx="1.5" fill="none" stroke="#38bdf8" strokeWidth="1.2" />
                <rect x="107" y="94" width="8" height="6.5" rx="1.5" fill="none" stroke="#38bdf8" strokeWidth="1.2" />
                <line x1="104" y1="97" x2="107" y2="97" stroke="#38bdf8" strokeWidth="1.2" />
                {/* Smile */}
                <path d="M102 106 Q 105 109, 109 106" stroke="#78350f" strokeWidth="1" strokeLinecap="round" fill="none" />

                {/* Raised Arm Pointing up to nodes */}
                <path d="M120 132 C 127 122, 137 107, 143 92" stroke="#fed7aa" strokeWidth="6.5" strokeLinecap="round" />
                <path d="M120 132 C 125 125, 133 115, 137 105" stroke="url(#coderShirtGrad)" strokeWidth="8.5" strokeLinecap="round" />
                {/* Pointing Hand */}
                <circle cx="144" cy="90" r="4" fill="#fed7aa" />
                <line x1="144" y1="90" x2="148" y2="83" stroke="#fed7aa" strokeWidth="2.5" strokeLinecap="round" />

                <defs>
                  <linearGradient id="coderShirtGrad" x1="55" y1="126" x2="155" y2="170" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0284c7" />
                    <stop offset="1" stopColor="#0369a1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Center: Glowing Google Button */}
            <div className="center-cta-area">
              {errorMsg && (
                <div className="cta-error-chip">⚠️ {errorMsg}</div>
              )}
              <div className="glowing-google-btn" style={{ colorScheme: "light" }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  shape="pill"
                  text="continue_with"
                  size="large"
                />
              </div>
            </div>

            {/* Right Graphic: LeetCode Difficulty & Telemetry Card */}
            <div className="graphic-panel right-panel">
              <div className="telemetry-widget">
                <div className="telemetry-widget-top">
                  <span className="telemetry-spark">⚡</span>
                  <div className="diff-pill-row">
                    <span className="diff-chip easy">Easy</span>
                    <span className="diff-chip medium">Medium</span>
                    <span className="diff-chip hard">Hard</span>
                  </div>
                </div>
                <div className="telemetry-progress-track">
                  <div className="telemetry-progress-bar" />
                </div>
                <div className="telemetry-stats-row">
                  <span className="stat-chip">⏱️ O(N) Time</span>
                  <span className="stat-chip">💾 O(1) Space</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Integrated Feature Strip */}
          <div className="master-features-strip">
            <div className="feature-strip-item">
              <span className="strip-icon">⚡</span>
              <span className="strip-label">4,073+ Catalog &amp; URL Parser</span>
            </div>
            <div className="strip-divider" />
            <div className="feature-strip-item">
              <span className="strip-icon">💡</span>
              <span className="strip-label">Intuition &amp; Complexity Notes</span>
            </div>
            <div className="strip-divider" />
            <div className="feature-strip-item">
              <span className="strip-icon">⭐</span>
              <span className="strip-label">35+ Topics &amp; Starred Revision</span>
            </div>
            <div className="strip-divider" />
            <div className="feature-strip-item">
              <span className="strip-icon">📄</span>
              <span className="strip-label">Executive PDF Portfolio Export</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingHero;
