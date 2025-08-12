import React, { useState, useEffect } from "react";
import "./ScamDetection.css";
import ReactTooltip from "react-tooltip";
import axios from "axios";
import Papa from 'papaparse';
import ScamWordCloud from './ScamWordCloud';
import './WordCloud.css';
import lightningIcon from "../assets/img/lightning.png";
import { useSearchParams } from 'react-router-dom';

const ScamDetection = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || "sms");
  
  // Update activeTab when URL changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [sender, setSender] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeInfoSection, setActiveInfoSection] = useState("risk-score");

  //----------------
  const [imageName, setImageName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const [wordCloudData, setWordCloudData] = useState([]);
  const [showWordCloud, setShowWordCloud] = useState(false);
  const [isLoadingWordCloud, setIsLoadingWordCloud] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [isKeywordsModalOpen, setIsKeywordsModalOpen] = useState(false);


  //---------------

  const loadWordCloudData = () => {
    setIsLoadingWordCloud(true);
    try {
      // Use the static SCAM_KEYWORDS array that's already defined in ScamWordCloud.js
      // Import it or define it here if needed
      const SCAM_KEYWORDS = [
        "#1", "100% more", "100% free", "100% satisfied", "Additional income",
        "Be your own boss", "Best price", "Big bucks", "Billion", "Cash bonus",
        "Casino", "Cheap", "Claims", "Clearance", "Compare rates",
        "Credit card offers", "Cures", "Dear friend", "Discount", "Double your income",
        "Earn $", "Earn extra cash", "Eliminate debt", "Extra income", "Fast cash",
        "Financial freedom", "Free access", "Free consultation", "Free gift", "Free hosting",
        "Free info", "Free investment", "Free membership", "Free money", "Free offer",
        "Free preview", "Free quote", "Free sample", "Free trial", "Full refund",
        "Get out of debt", "Get paid", "Giveaway", "Guaranteed", "Increase sales",
        // Add more keywords as needed or import them
      ];

      console.log(" Using static keywords:", SCAM_KEYWORDS.length);

      // Transform the data for the word cloud
      const words = SCAM_KEYWORDS.map(keyword => ({
        text: keyword,
        value: Math.floor(Math.random() * 50) + 10 // Random size between 10-60
      }));

      console.log(" Transformed word cloud data:", words.slice(0, 5));
      setWordCloudData(words);
      setShowWordCloud(true);
      setIsLoadingWordCloud(false);
    } catch (error) {
      console.error("Error loading word cloud data:", error);
      setIsLoadingWordCloud(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setInputText("");
    setAnalysisResult(null);
    setError(null);
    setSender("");

    // Load word cloud data when selecting the keywords tab
    if (tab === "keywords") {
      console.log(" Keywords tab clicked, loading data 1111");
      loadWordCloudData();
    } else {
      setShowWordCloud(false);
    }
  };

  // In your renderAnalysisPanel function or main render method, add:
  const renderContent = () => {
    if (activeTab === "keywords") {
      return (
        <div className="keywords-section">
          {isLoadingWordCloud ? (
            <div className="loading-word-cloud">
              <div className="word-cloud-spinner"></div>
              ACCESSING THREAT DATABASE
            </div>
          ) : (
            showWordCloud && <ScamWordCloud />
          )}
        </div>
      );
    } else {
      return renderAnalysisPanel();
    }
  };


  // image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadProgress(10);

    // Set OCR processing to true when starting the operation
    setIsOcrProcessing(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('https://scamdetek.live/api/extract-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      const data = response.data;
      console.log("OCR extraction result:", data);

      // Make sure data.extracted_text exists before filling in the input box
      if (data && data.extracted_text) {
        setInputText(data.extracted_text);
      } else {
        setError("No text was extracted from the image.");
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError("Failed to extract text from image.");
    } finally {
      // Set OCR processing to false when the operation completes (success or failure)
      setIsOcrProcessing(false);
    }
  };


  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      setError("Please enter some content to analyze");
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Call the Python backend API
      // const response = await fetch("http://localhost:8000/api/analyze", {
        // const response = await fetch("http://3.107.236.104:8000/api/analyze", {
      const response = await fetch("https://scamdetek.live/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: inputText,
          content_type: activeTab,
          sender: sender,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Analysis failed");
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.message || "Failed to analyze content. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clear OCR text input
  const handleClearText = () => {
    setInputText('');
  };

  // Delete uploaded pictures
  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setUploadProgress(0);
    setImageName('');
  };



  // Helper function to get risk color
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "High":
        return "#ff6b6b"; // Red that matches your theme
      case "Medium":
        return "#ffd166"; // Amber/yellow that fits dark theme
      case "Low":
        return "#4FD1C5"; // Your theme's teal color
      default:
        return "#4FD1C5"; // Default to your theme color
    }
  };

  const formatKey = (key) =>
    key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const senderFlagDescriptions = {
    is_valid_format: "Checks if the sender uses a valid email or phone format.",
    suspicious_tld: "Warns about risky domains like .ru, .tk, or .xyz.",
    spoofing_brand: "Detects brand names like PayPal or Amazon in the domain.",
    free_provider_impersonating_brand:
      "Free email pretending to be a legit brand.",
    too_many_subdomains:
      "Looks for long domains that might hide real identity.",
  };

  const getStatusIndicator = () => {
    if (!analysisResult) return null;

    const riskColor = getRiskColor(analysisResult.risk_level);

    return (
      <div
        className="status-indicator"
        style={{
          backgroundColor: riskColor,
          color: analysisResult.risk_level === "Low" ? "black" : "white",
        }}
      >
        {analysisResult.risk_level} Risk
      </div>
    );
  };

  // Information modal content based on active section
  const renderInfoModalContent = () => {
    switch (activeInfoSection) {
      case "risk-score":
        return (
          <div className="modal-content-fixed-height">
            <h3>Understanding Risk Score</h3>
            <p>The risk score indicates the likelihood that the content you've submitted contains scam or phishing attempts. Our system combines machine learning predictions and rule-based detection to generate this score.</p>
            <ul>
              <li><span className="risk-badge low">0-30%: Low Risk</span> Generally safe content with few or no suspicious elements. The message is likely legitimate.</li>
              <li><span className="risk-badge medium">31-70%: Medium Risk</span> Contains some suspicious elements that warrant caution. Verify with the sender through a different channel before taking action.</li>
              <li><span className="risk-badge high">71-100%: High Risk</span> Strong indicators of a scam or phishing attempt. We recommend ignoring or reporting this message.</li>
            </ul>
            <p><strong>Important Note:</strong> For email analysis, the final risk level is determined by both <strong style={{ color: "#4FD1C5" }}>the percentage score</strong> and <strong style={{ color: "#4FD1C5" }}>the number of warning signs detected</strong>. 4 or more warning signs will trigger a "High Risk" classification, and 2 or more will trigger a "Medium Risk" classification regardless of the percentage score.</p>
            <p><strong>ML Model Confidence:</strong> Indicates how certain our machine learning algorithm is about its assessment. Higher confidence (closer to 1.0) means more reliable results.</p>
            <p><strong>How it's calculated:</strong> For email analysis, we use an XGBoost classifier trained on known scam patterns. For SMS, we apply a specialized model that analyzes message characteristics. URL scanning checks for suspicious domains and patterns. The final detection risk score is calculated by integrating the score of the ML model, the score calculated by the Ipqs API, and the number of Warning Signs.</p>
          </div>
        );
      case "warning-signs":
        return (
          <div className="modal-content-fixed-height">
            <h3>Warning Signs Explained</h3>
            <p>These are specific red flags detected in the content that indicate potential scam or phishing attempts:</p>
            <ul>
              <li><strong>Threatening Language:</strong> Messages containing threats like "account suspension," "security alert," "unauthorized login," or "legal action" designed to create fear.</li>
              <li><strong>Request For Sensitive Information:</strong> Asking for passwords, OTPs, credit card details, bank accounts, PINs, or verification codes.</li>
              <li><strong>Suspicious Links:</strong> URLs with suspicious domains (like .tk, .ml, .ga, .ru), or using URL shorteners (bit.ly, tinyurl.com) to hide the real destination.</li>
              <li><strong>Creates Urgency:</strong> Pressuring you to act immediately with words like "urgent," "immediately," "now," or claiming a deadline.</li>
              <li><strong>Grammar Errors:</strong> Poor grammar, spelling mistakes, or unusual sentence structures that legitimate organizations typically avoid.</li>
              <li><strong>No Personal Greeting:</strong> Generic greetings rather than addressing you by name, suggesting a mass-sent message.</li>
              <li><strong>Suspicious Attachments:</strong> References to files with suspicious extensions like .exe, .scr, .docm, or .zip that could contain malware.</li>
              <li><strong>Suspicious Sender:</strong> Sender's email or phone number shows signs of impersonation or uses suspicious domains.</li>

              <h4>URL Warning Signs</h4>
              <li><strong>No HTTPS</strong>: The URL does not use a secure connection.</li>
              <li><strong>IP Address as Domain</strong>: The domain is a raw IP (e.g., 192.168.0.1), often seen in phishing links.</li>
              <li><strong>Excessive Subdomains</strong>: URLs with many subdomains may attempt to mimic trusted brands.</li>
              <li><strong>Suspicious Keywords</strong>: Contains terms like "login", "verify", "bank", or "account".</li>
              <li><strong>Long Path</strong>: Very long URL paths can be used to disguise redirects or malicious payloads.</li>
              <li><strong>Suspicious TLD</strong>: The domain ends with uncommon or flagged TLDs (e.g., .tk, .xyz, .ru).</li>
              <li><strong>URL Shortener</strong>: Uses services like bit.ly or tinyurl to hide the true destination.</li>



            </ul>
          </div>
        );
      case "detected-traits":
        return (
          <div className="modal-content-fixed-height">
            <h3>Detected Traits</h3>
            <p>These characteristics provide additional context about the message content:</p>

            <h4>Email Analysis Traits</h4>
            <ul>
              <li><strong>Subject:</strong> The email's subject line, which may contain clues about its intent.</li>
              <li><strong>Word Count:</strong> The number of words in the message, as extremely short or long messages may be suspicious.</li>
              <li><strong>Link Count:</strong> The number of URLs found in the message.</li>
              <li><strong>Suspicious Domains:</strong> List of suspicious website domains detected in the message.</li>
              <li><strong>Sensitive Keywords:</strong> Terms related to personal information or account access found in the message.</li>
              <li><strong>Threat Keywords:</strong> Terms designed to create fear or urgency found in the message.</li>
              <li><strong>Suspicious Extensions:</strong> Potentially harmful file types mentioned in the message.</li>
              <li><strong>Predicted Label:</strong> The ML model's classification of the message as potential scam or legitimate.</li>
            </ul>

            <h4>SMS Analysis Traits</h4>
            <ul>
              <li><strong>Character Count:</strong> The total length of the message.</li>
              <li><strong>Link Count:</strong> The number of URLs found in the message.</li>
              <li><strong>Suspicious Domains:</strong> List of URLs with suspicious patterns.</li>
            </ul>

            <h4>URL Analysis Traits</h4>
            <ul>
              <li><strong>Domain:</strong> The website domain extracted from the URL.</li>
              <li><strong>Path Length:</strong> Complexity of the URL path, as longer paths can be suspicious.</li>
              <li><strong>Query Parameters:</strong> Whether the URL contains query parameters, which might be used for tracking or phishing.</li>
              <li><strong>Uses HTTPS:</strong> Whether the URL uses secure protocol, though scammers also use HTTPS.</li>
              <li><strong>Has Ip Address:</strong> The domain name is the original IP address, which is uncommon for legitimate sites and is commonly seen in phishing links.</li>
              <li><strong>Ipqs Introduction:</strong> IPQS (IPQualityScore) is a professional network security service platform for identifying malicious links, phishing sites, spammers and other network threats. In our system, IPQS will perform a real-time security assessment on the URL you submit.</li>
              <li><strong>Ipqs Malicious:</strong> Whether this URL is marked as a known malicious website in the IPQS database.</li>
              <li><strong>Ipqs Risk Score:</strong> A score from 0 to 100, the higher the score, the more likely the URL is to be associated with scams, phishing or malicious behavior.</li>
            </ul>
          </div>
        );
      case "sender-analysis":
        return (
          <div className="modal-content-fixed-height">
            <h3>Sender Analysis</h3>
            <p>This section examines the sender's contact information for signs of legitimacy:</p>

            <h4>Email Sender Analysis</h4>
            <ul>
              <li><strong>Valid Format:</strong> Checks if the email follows proper formatting standards (name@domain.com).</li>
              <li><strong>Suspicious TLD:</strong> Warns about risky domain extensions like .ru, .tk, .xyz, .top, .loan, or .zip that are commonly used in scams.</li>
              <li><strong>Spoofing Brand:</strong> Detects when a sender tries to impersonate a known brand (PayPal, Amazon, Microsoft, etc.) in their domain.</li>
              <li><strong>Free Provider Impersonating Brand:</strong> Detects when someone uses a free email service (Gmail, Yahoo) while claiming to represent an official organization.</li>
              <li><strong>Too Many Subdomains:</strong> Flags emails with complex domain structures (multiple dots) that may be trying to obscure their true identity.</li>
            </ul>

            <h4>Phone Sender Analysis</h4>
            <ul>
              <li><strong>Phone Type:</strong> Classifies the sender's number as Mobile, Landline, Toll-Free, Short Code, or other categories.</li>
              <li><strong>Valid Format:</strong> Checks if the phone number follows proper international or local formatting.</li>
              <li><strong>Is Short Code:</strong> Identifies if the number is a short code (typically 4-6 digits), which can be legitimate for services but also used in scams.</li>
            </ul>

            <p>Legitimate organizations typically send communications from their official domains (e.g., @amazon.com not @amazon.mail-service.com) and verified phone numbers. Government agencies and major companies rarely use free email providers for official communications.</p>
          </div>
        );
      default:
        return <p>Select a section to learn more.</p>;
    }
  };

  // Render the information modal
  const renderInfoModal = () => {
    if (!showInfoModal) return null;

    return (
      <div className="info-modal-overlay">
        <div className="info-modal">
          <div className="info-modal-header">
            <h2>Analysis Information</h2>
            <button
              className="close-modal-button"
              onClick={() => setShowInfoModal(false)}
            >
              ×
            </button>
          </div>
          <div className="info-modal-sidebar">
            <button
              className={`info-section-button ${activeInfoSection === "risk-score" ? "active" : ""}`}
              onClick={() => setActiveInfoSection("risk-score")}
            >
              Risk Score
            </button>
            <button
              className={`info-section-button ${activeInfoSection === "warning-signs" ? "active" : ""}`}
              onClick={() => setActiveInfoSection("warning-signs")}
            >
              Warning Signs
            </button>
            <button
              className={`info-section-button ${activeInfoSection === "detected-traits" ? "active" : ""}`}
              onClick={() => setActiveInfoSection("detected-traits")}
            >
              Detected Traits
            </button>
            <button
              className={`info-section-button ${activeInfoSection === "sender-analysis" ? "active" : ""}`}
              onClick={() => setActiveInfoSection("sender-analysis")}
            >
              Sender Analysis
            </button>
          </div>
          <div className="info-modal-content">
            {renderInfoModalContent()}
          </div>
        </div>
      </div>
    );
  };

  // Render the analysis panel (right side)
  const renderAnalysisPanel = () => {
    if (isAnalyzing) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analyzing your content...</p>
        </div>
      );
    }

    if (!analysisResult) {
      // Placeholder content when there's no analysis
      return (
        <div className="placeholder-content">
          <div className="placeholder-icon">{'\uD83D\uDD0D'}</div>
          <h3 className="placeholder-title">Ready to Analyze</h3>
          <p className="placeholder-text">
            Enter your {activeTab === "sms"
              ? "SMS message"
              : activeTab === "email"
                ? "email content"
                : "URL"} or upload an image on the left and click <strong>Start Analyze</strong> to detect potential scams.
          </p>
          <div className="placeholder-risk-key">
            <span className="risk-key-item high">High Risk</span>
            <span className="risk-key-item medium">Medium Risk</span>
            <span className="risk-key-item low">Low Risk</span>
          </div>
        </div>
      );
    }

    return (
      <div className="analysis-results">
        <div className="results-header">
          <h3>Analysis Results {getStatusIndicator()}</h3>
          <div className="info-button-wrapper" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              className="info-button"
              onClick={() => {
                setActiveInfoSection("risk-score");
                setShowInfoModal(true);
              }}
              title="More information about analysis results"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </button>
            <span
              className="info-label-text"
              style={{ fontSize: "14px", color: "#ccc", cursor: "pointer" }}
              onClick={() => {
                setActiveInfoSection("risk-score");
                setShowInfoModal(true);
              }}
            >
              More information
            </span>
          </div>
        </div>

        <div className="risk-meter-container">
          <div className="risk-meter-label">
            <span>Risk Score : {analysisResult.risk_percentage}%</span>
            <span className="ml-confidence">
              ML Model Confidence: {analysisResult.ml_confidence}
            </span>
          </div>
          <div className="risk-meter">
            <div
              className="risk-meter-fill"
              style={{
                width: `${analysisResult.risk_percentage}%`,
                backgroundColor: getRiskColor(analysisResult.risk_level),
              }}
            ></div>
          </div>
        </div>

        <div className="results-content">
          <div className="results-columns">
            <div className="flags-column">
              <div className="section-header">
                <h4>Warning Signs</h4>
              </div>
              <ul className="flags-list">
                {Object.entries(analysisResult.flags).map(([key, value]) => {
                  if (!value) return null;

                  const formattedKey = formatKey(key);
                  const explanation =
                    analysisResult.explanations?.[key] ||
                    "This may indicate scam behavior.";

                  return (
                    <li key={key} className="flag-item" data-tip={explanation}>
                      <span className="flag-indicator">{'\u26A0'}</span>
                      <span>{formattedKey}</span>
                    </li>
                  );
                })}
              </ul>
              <ReactTooltip place="top" type="dark" effect="solid" />
            </div>

            <div className="metadata-column">
              <div className="section-header">
                <h4>Detected Traits</h4>
              </div>
              <div className="metadata-list">
                {Object.entries(analysisResult.metadata).map(([key, value]) => {
                  if (
                    key === "sender_analysis" ||
                    value === null ||
                    value === undefined
                  )
                    return null;

                  const formattedKey = key
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");

                  let formattedValue;

                  if (Array.isArray(value)) {
                    formattedValue =
                      value.length > 0 ? (
                        <ul className="metadata-array">
                          {value.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        "None"
                      );
                  } else if (typeof value === "object") {
                    formattedValue = (
                      <table className="metadata-table">
                        <thead>
                          <tr>
                            <th>Trait</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(value).map(
                            ([subKey, subVal], index) => (
                              <tr key={index}>
                                <td>
                                  {subKey
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                                </td>
                                <td>
                                  {subVal === true
                                    ? '\u2705 Yes'
                                    : subVal === false
                                      ? '\u274C No'
                                      : String(subVal)}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    );
                  } else {
                    formattedValue =
                      typeof value === "boolean"
                        ? value
                          ? (key === "ipqs_malicious" ? '\u26A0 Malicious' : 'Yes')
                          : (key === "ipqs_malicious" ? '\u2705 Safe' : 'No')
                        : value;
                  }

                  return (
                    <div key={key} className="metadata-item">
                      <span className="metadata-key">{formattedKey}:</span>
                      <span className="metadata-value">{formattedValue}</span>
                    </div>
                  );
                })}
              </div>

              {activeTab !== "url" && (
                <div className="sender_analysis">
                  <div className="section-header">
                    <h4>Sender Analysis</h4>
                  </div>
                  {analysisResult.metadata?.sender_analysis && (
                    <div className="sender-analysis-column">
                      <ul className="sender-analysis-list">
                        {Object.entries(
                          analysisResult.metadata.sender_analysis
                        ).map(([key, value], index) => {
                          if (key === "is_short_code") return null;
                          if (key === "is_valid_format") return null;

                          const formattedKey = key
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ");

                          if (key === "phone_type") {
                            return (
                              <li key={index} className="sender-analysis-item">
                                <span className="sender-analysis-key">
                                  {formattedKey}
                                </span>
                                <span
                                  className="sender-analysis-status"
                                  style={{ color: "#4FD1C5" }}
                                >
                                  {value}
                                </span>
                              </li>
                            );
                          }

                          const isFlagged =
                            key === "is_valid_format" ? !value : value;
                          const statusIcon = isFlagged ? '\u26A0' : '\u2705';
                          const statusText = isFlagged ? "Suspicious" : "Safe";
                          const statusColor = isFlagged ? "#ffc107" : "#4CAF50";

                          return (
                            <li
                              key={index}
                              className="sender-analysis-item"
                              data-tip={senderFlagDescriptions[key] || ""}
                            >
                              <span className="sender-analysis-key">
                                {formattedKey}
                              </span>
                              <span
                                className="sender-analysis-status"
                                style={{ color: statusColor }}
                              >
                                {statusIcon} {statusText}
                              </span>
                            </li>
                          );
                        })}
                      </ul>

                      <ReactTooltip effect="solid" place="top" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="detection-page">
      {/* Page Header and Intro */}
      <div className="detection-header">
        <h1>Check for Scams Instantly!</h1>
      </div>
      <div className="detection-container">
        {/* Sidebar */}
        <div className="detection-sidebar">
          <button
            className={`sidebar-button ${activeTab === "email" ? "active" : ""}`}
            onClick={() => handleTabClick("email")}
            aria-label="Email Detection"
          >
            📧 Email Detection
          </button>
          <button
            className={`sidebar-button ${activeTab === "sms" ? "active" : ""}`}
            onClick={() => handleTabClick("sms")}
            aria-label="SMS Detection"
          >
            💬 SMS Detection
          </button>
          <button
            className={`sidebar-button ${activeTab === "url" ? "active" : ""}`}
            onClick={() => handleTabClick("url")}
            aria-label="URL Detection"
          >
            🔗 URL Detection
          </button>
          <div className="wordcloud-container">
            <button type="button" className="sidebar-button wordcloud-button" onClick={() => setIsKeywordsModalOpen(true)} aria-label="Scam Keywords">
              ⚡ Scam Keywords
            </button>   
            <div className="wordcloud-tooltip">Alert!</div>
          </div>
        </div>
        {/* Main content */}
        <div className="detection-content">
          {activeTab !== "keywords" ? (
            <>
              {/* Input section */}
              <div className="input-section">
                <input
                  type="text"
                  className="sender-input"
                  placeholder={
                    activeTab === "sms"
                      ? "Enter sender phone number"
                      : activeTab === "email"
                        ? "Enter sender email address"
                        : "Sender information (optional)"
                  }
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                />

                <div className="image-upload-section">
                  <label htmlFor="file-upload" className="custom-upload-icon-button">
                    <img src="\upload.png" alt="Upload" className="upload-icon" />
                    <span className="upload-label-text">Upload Image (Optional)</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />

                  {/* OCR Processing Indicator */}
                  {isOcrProcessing && (
                    <div className="ocr-processing-text">
                      <div className="ocr-spinner"></div>
                      <span style={{ marginLeft: "8px" }}>Extracting text from image...</span>
                    </div>
                  )}

                  {/* Delete Button */}
                  {previewUrl && (
                    <button onClick={handleRemoveImage} className="remove-btn">
                      Delete Image
                    </button>
                  )}

                  {imageName && <p className="filename">{imageName}</p>}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <progress value={uploadProgress} max="100" />
                  )}
                  {previewUrl && <img src={previewUrl} alt="Preview" className="image-preview" />}
                </div>

                <textarea
                  className="detection-textarea"
                  placeholder={`Please paste ${activeTab === "sms"
                    ? "SMS"
                    : activeTab === "email"
                      ? "email"
                      : "URL"
                    } content here...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                ></textarea>

                <div className="analyze-button-container">
                  <button
                    className="analyze-button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? "Analyzing..." : "Start Analyze"}
                  </button>

                  <button onClick={handleClearText} className="clear-btn"> Clear Text</button>

                </div>

                {error && <div className="error-message">{error}</div>}
              </div>
            </>
          ) : null}
          {/* Render appropriate content based on the active tab */}
          {renderContent()}
        </div>
      </div>
      {renderInfoModal()}
      {/* WordCloud Modal */}
      {isKeywordsModalOpen && (
        <div className="keywords-modal-overlay" onClick={() => setIsKeywordsModalOpen(false)}>
          <div className="keywords-modal" onClick={e => e.stopPropagation()}>
            <div className="keywords-modal-header">
              <button className="close-keywords-modal" onClick={() => setIsKeywordsModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="keywords-modal-content">
              <ScamWordCloud />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScamDetection;