import React, { useState, useEffect } from "react";
import "./App.css";
import HomePage from "./components/HomePage";
import ScamDetection from "./components/ScamDetection";
import AIChatbot from "./components/AIChatbot";
import KnowledgeHub from "./components/KnowledgeHub";
import ScamsType from "./components/ScamsType";
import ReportScams from "./components/ReportScams";
import ScamTypeDetail from "./components/ScamTypeDetail";
import AccessGate from "./components/AccessGate";
import GlobalDashboard from "./components/GlobalDashboard"; // Import GlobalDashboard
import ScamQuiz from "./components/ScamQuiz";
import GamifiedCenter from "./components/GamifiedCenter";
import {
  Routes,
  Route,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import ChatbotPopup from "./components/ChatbotPopup"; // Import the new popup component
import axios from "axios"; // Import axios
import globalDataCache from "./utils/globalDataCache"; // Import globalDataCache

const App = () => {
  const [hasAccess, setHasAccess] = useState(() => {
    return localStorage.getItem("hasAccess") === "true";
  });
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // State for popup visibility

  const handleAccessGranted = () => {
    localStorage.setItem("hasAccess", "true");
    setHasAccess(true);
  };

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (page, params) => {
    let path;
    switch (page) {
      case "home":
        path = "/";
        break;
      case "detection":
        path =
          params && params.tab ? `/detection?tab=${params.tab}` : "/detection";
        break;
      case "chatbot":
        path = "/chatbot";
        break;
      case "knowledge":
        path = "/knowledge";
        break;
      case "dashboard":
        path = "/dashboard";
        break;
      case "gamifiedCenter":
        path = "/gamified-center";
        break;
      case "quiz":
        path = "/quiz";
        break;
      case "scamsType":
        path = "/scams-type";
        break;
      case "reportScams":
        path = "/report-scams";
        break;
      case "scamTypeDetail":
        if (params && params.title) {
          const formattedTitle = encodeURIComponent(
            params.title.toLowerCase().replace(/\s+/g, "-")
          );
          path = `/scam-type-detail/${formattedTitle}`;
        } else {
          console.error("Scam title missing for scamTypeDetail navigation");
          path = "/scams-type";
        }
        break;
      default:
        path = "/";
    }
    navigate(path);
    window.scrollTo(0, 0);
  };

  // Effect to pre-fetch global cyber attack data
  useEffect(() => {
    if (hasAccess && !globalDataCache.data) {
      // Fetch only if access is granted and cache is empty
      console.log("Pre-fetching global cyber attack data...");
      axios
        .get("/api/global-cyber-attacks")
        .then((response) => {
          globalDataCache.data = response.data;
          console.log("Global cyber attack data pre-fetched and cached.");
        })
        .catch((error) => {
          console.error("Error pre-fetching global cyber attack data:", error);
          // Optionally, you could set a flag or retry mechanism here
        });
    }
  }, [hasAccess]); // Re-run if hasAccess changes (e.g., after access gate)

  // Gate check before rendering anything else
  if (!hasAccess) {
    return <AccessGate onAccessGranted={handleAccessGranted} />;
  }

  const toggleChatbotPopup = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <div className={location.pathname === "/" ? "" : "app"}>
      {/* Navbar */}
      <nav className="navbar">
        <div
          className="logo-container"
          onClick={() => handleNavigation("home")}
        >
          <img src="/logo.png" alt="ScamDetek Logo" className="logo" />
          <span className="logo-text">ScamDetek</span>
        </div>

        <div className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/detection"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Scam Detection
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Scam Stats
          </NavLink>
          <NavLink
            to="/gamified-center"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Gamified Center
          </NavLink>
          <NavLink
            to="/chatbot"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            AI Chatbot
          </NavLink>
          <NavLink
            to="/knowledge"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Knowledge Hub
          </NavLink>
        </div>

        <div className="social-links">
          <a href="#" className="social-link">
            {/* SVG icons */}
          </a>
          <a href="#" className="social-link">
            {/* SVG icons */}
          </a>
          <a href="#" className="social-link">
            {/* SVG icons */}
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main
        className={`page-fade-in ${
          location.pathname === "/" ? "" : "main-content"
        }`.trim()}
      >
        <Routes>
          <Route
            path="/"
            element={<HomePage onNavigate={handleNavigation} />}
          />
          <Route path="/detection" element={<ScamDetection />} />
          <Route
            path="/scams-type"
            element={<ScamsType onNavigate={handleNavigation} />}
          />
          <Route
            path="/report-scams"
            element={<ReportScams onNavigate={handleNavigation} />}
          />
          <Route path="/dashboard" element={<GlobalDashboard />} />
          <Route
            path="/gamified-center"
            element={<GamifiedCenter onNavigate={handleNavigation} />}
          />
          <Route
            path="/quiz"
            element={<ScamQuiz onNavigate={handleNavigation} />}
          />
          <Route path="/chatbot" element={<AIChatbot />} />
          <Route
            path="/knowledge"
            element={<KnowledgeHub onNavigate={handleNavigation} />}
          />
          <Route
            path="/scam-type-detail/:title"
            element={<ScamTypeDetail onNavigate={handleNavigation} />}
          />
          <Route
            path="*"
            element={<HomePage onNavigate={handleNavigation} />}
          />
        </Routes>

        {/* Copyright Section */}
        <div className="copyright-section">
          <p className="copyright">©2025 ScamDetek. All rights reserved.</p>
          <p className="tagline">Protect yourself from online scam.</p>
        </div>
      </main>

      {/* Chatbot Icon - fixed at bottom right */}
      {location.pathname !== "/chatbot" && (
        <div className="chatbot-icon" onClick={toggleChatbotPopup}>
          <div className="chat-bubble">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}
      <ChatbotPopup isOpen={isChatbotOpen} onClose={toggleChatbotPopup} />
    </div>
  );
};

export default App;
