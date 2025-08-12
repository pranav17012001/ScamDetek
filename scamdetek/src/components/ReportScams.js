import React, { useState, useEffect } from "react";
import "./reportScams.css";

const ReportScams = ({ onNavigate }) => {
  const [activeSteps, setActiveSteps] = useState([false, false, false]);
  const [animating, setAnimating] = useState(false);

  const toggleStep = (index) => {
    if (animating) return;

    setAnimating(true);
    const newActiveSteps = [...activeSteps];
    newActiveSteps[index] = !newActiveSteps[index];
    setActiveSteps(newActiveSteps);

    // Animation cooldown
    setTimeout(() => {
      setAnimating(false);
    }, 500);
  };

  // Auto-open first step on component mount
  useEffect(() => {
    setTimeout(() => {
      toggleStep(0);
    }, 1000);
  }, []);

  return (
    <main className="report-scams">
      <div className="back-button" onClick={() => onNavigate("knowledge")}>
        ← Back to Knowledge Hub
      </div>

      <section className="report-title">
        <h1>
          Report Scams Effectively
          <br />
          Protect Your Rights
        </h1>
      </section>

      <section className="steps-container">
        <div className="steps-wrapper">
          {/* Step 1 */}
          <div className={`step ${activeSteps[0] ? "active" : ""}`}>
            <div className="step-circle">
              <div className="step-number">1</div>
              {/* Connection lines removed */}
            </div>
            <div className="step-content">
              <button className="step-button" onClick={() => toggleStep(0)}>
                <div className="step-button-text">
                  Have you experienced any of the following{" "}
                  <span className="highlight">suspicious scenarios</span>?
                </div>
                <span className="dropdown-icon"></span>
              </button>
              <div className="step-content-expanded">
                <div className="scam-type-grid">
                  <div className="scam-type-card">
                    <i className="fas fa-user-lock"></i>
                    <p>I gave out my username and password.</p>
                  </div>
                  <div className="scam-type-card">
                    <i className="fas fa-credit-card"></i>
                    <p>I gave out my credit card details.</p>
                  </div>
                  <div className="scam-type-card">
                    <i className="fas fa-mobile-alt"></i>
                    <p>I gave out my OTP/TAC/MSOS.</p>
                  </div>
                  <div className="scam-type-card">
                    <i className="fas fa-user-shield"></i>
                    <p>Someone accessed my phone without authorization.</p>
                  </div>
                  <div className="scam-type-card">
                    <i className="fas fa-home"></i>
                    <p>I gave out my house address.</p>
                  </div>
                  <div className="scam-type-card">
                    <i className="fas fa-id-card"></i>
                    <p>I gave out my mother's maiden name.</p>
                  </div>
                  <div className="scam-type-card">
                    <i className="fas fa-lock"></i>
                    <p>I gave away my security phrase.</p>
                  </div>
                  <div className="scam-type-card">
                    <i className="fas fa-qrcode"></i>
                    <p>I scanned a suspicious QR code</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`step ${activeSteps[1] ? "active" : ""}`}>
            <div className="step-circle">
              <div className="step-number">2</div>
              {/* Connection lines removed */}
            </div>
            <div className="step-content">
              <button className="step-button" onClick={() => toggleStep(1)}>
                <div className="step-button-text">
                  If YES, change your{" "}
                  <span className="highlight">password</span> immediately and
                  report to the{" "}
                  <span className="highlight">Appropriate Authority</span>.
                </div>
                <span className="dropdown-icon"></span>
              </button>
              <div className="step-content-expanded">
                <div className="authority-cards">
                  <div className="authority-card">
                    <h3>Royal Malaysia Police (PDRM)</h3>
                    <p>
                      Recommended for: All types of scams, especially those
                      involving threats, impersonation of government officials.
                    </p>
                    <div className="contact-info">
                      <div>
                        <i className="fas fa-globe"></i>
                        <span>
                          Report Online:{" "}
                          <a
                            href="https://ereporting.rmp.gov.my/index.aspx"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="highlight"
                          >
                            Online PDRM Report
                          </a>
                        </span>
                      </div>
                      <div>
                        <i className="fas fa-phone"></i>
                        <span>
                        Hotline: <strong className="highlight">999</strong>{" "}
                        (emergency) or <strong className="highlight">03-2266 2222</strong> (general inquiries)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="authority-card">
                    <h3>Malaysia Computer Emergency Response Team (MyCERT)</h3>
                    <p>
                      Recommended for: Computer security incidents like online scams, cyber fraud, phishing,
                      social media scams, and malicious URLs.
                    </p>
                    <div className="contact-info">
                      <div>
                        <i className="fas fa-globe"></i>
                        <span>
                          Report Online:{" "}
                          <a
                            href="https://www.mycert.org.my/portal/online-form?id=7a911418-9e84-4e48-84d3-aa8a4fe55f16"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="highlight"
                          >
                            MyCERT Online Report Form
                          </a>
                        </span>
                      </div>
                      <div>
                        <i className="fas fa-envelope"></i>
                        <span>
                          Email:{" "}
                          <a
                            href="mailto:cyber999@cybersecurity.my"
                            className="highlight"
                          >
                            cyber999@cybersecurity.my
                          </a>
                        </span>
                      </div>
                      <div>
                        <i className="fas fa-phone"></i>
                        <span>
                          Hotline:{" "}
                          <strong className="highlight">
                            +601 - 9266 5850
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="authority-card">
                    <h3>National Scam Response Center (NSRC)</h3>
                    <p>
                      Recommended for: Financial scams and fraud involving bank
                      transactions or investment (e.g., Investment Scam, Job
                      Scam, Money Mule Scam).
                    </p>
                    <div className="contact-info">
                      <div>
                        <i className="fas fa-phone"></i>
                        <span>
                          Hotline: <strong className="highlight">997</strong>
                        </span>
                      </div>
                      <div>
                        <i className="fas fa-clock"></i>
                        <span>
                          Availability: 24/7 service for reporting financial
                          scams.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className={`step ${activeSteps[2] ? "active" : ""}`}>
            <div className="step-circle">
              <div className="step-number">3</div>
              {/* No connection line for last step */}
            </div>
            <div className="step-content">
              <button className="step-button" onClick={() => toggleStep(2)}>
                <div className="step-button-text">
                  Then make a <span className="highlight">police report</span>{" "}
                  immediately.
                </div>
                <span className="dropdown-icon"></span>
              </button>
              <div className="step-content-expanded">
                <div className="report-map-container">
                  <div className="map-header">
                    <i className="fas fa-map-marker-alt"></i>
                    <h3>Find the closest police station</h3>
                  </div>
                  <a
                    href="https://www.google.com/maps/search/Nearest+Police+Station"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-button"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ReportScams;
