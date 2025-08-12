import React from "react";
import "../App.css";
import scrollIcon from '../assets/img/home-to-bottom.png';

const HomePage = ({ onNavigate }) => {

  // Function to handle smooth scrolling down by one viewport height
  const handleScrollDown = () => {
    // Start scrolling
    window.scrollBy({
      top: window.innerHeight, // Scroll down by the height of the viewport
      left: 0,
      behavior: 'smooth' // Enable smooth scrolling
    });

    // After a delay (adjust timing based on scroll duration), re-trigger animations
    setTimeout(() => {
      // Find all chart bars within the stats section
      const chartBars = document.querySelectorAll('.stats-chart .chart-bar');
      chartBars.forEach(bar => {
        // Remove the animation class to reset
        bar.classList.remove('chart-bar-animated');

        // Force reflow to ensure the class removal is registered before re-adding
        // Reading offsetHeight is a common trick for this
        void bar.offsetHeight;

        // Re-add the animation class to trigger the animation again
        bar.classList.add('chart-bar-animated');
      });
    }, 300); // Adjust this delay (in milliseconds) as needed
  };

  return (
    <div className="home-wrapper">
      <div className="home-page">
        {/* Hero Section */}
        <section className="hero-section hero-section-height">
          <div className="hero-content">
            <div className="home-title">
              <div className="hero-text-style">Protect Your</div>
              <div className="hero-text-style" style={{ height: '81px' }}>Digital World from</div>
              <div className="title-scams white-text"><strong>Online Scams</strong></div>
            </div>
            <p className="hero-description">
              AI-powered tools to detect and protect against online scams, ensuring your safety across{" "}
              <span className="highlight">Emails</span>, <span className="highlight">URLs</span>, and <span className="highlight">SMS messages</span>.
            </p>

            <button className="get-started-btn" onClick={() => onNavigate("detection")}>
              Get started
            </button>
          </div>
          <div className="scroll-icon-container hero-scroll-icon" onClick={handleScrollDown}>
            <img src={scrollIcon} className="scroll-icon" alt="Scroll down" />
          </div>
        </section>
        <div className="homepage-content-wrapper">
          <div className="max1200">
            {/* What We Offer Section */}
            <section className="offer-section">
              <h2 className="section-title" style={{ textAlign: 'left' }}>
                <span className="gradient-text">What We</span>{" "}
                <span className="gradient-text">Offer</span>
              </h2>
              <p className="offer-description">
                We offer an AI-powered platform designed to protect you from online scams in <span className="highlight">Emails</span>, <span className="highlight">SMS</span>, and <span className="highlight">malicious URLs</span>. Our advanced tools help detect fraud, provide <span className="highlight">educational resources</span>, a comprehensive <span className="highlight">Dashboard</span> that displays cybercrime statistics for both Malaysia and global landscape and also offer <span className="highlight">AI chatbot</span> and <span className="highlight">interactive learning</span> to keep you safe in Malaysia's digital world.
              </p>
            </section>

            {/* Statistics Section */}
            <section className="stats-section">
              <div className="stats-chart">
                <h3>Majority Channels of Scams in Malaysia: Insights from the 2024 Asia Scam Report</h3>
                <div className="chart-container">
                  {/* Add the animation class initially */}
                  <div className="chart-item">
                    <span className="chart-label highlight-blue">Email</span>
                    <div className="chart-bar-container">
                      <div className="chart-bar chart-bar-animated" style={{ width: "38%" }}>38%</div>
                    </div>
                  </div>
                  <div className="chart-item">
                    <span className="chart-label">Post on social media</span>
                    <div className="chart-bar-container">
                      <div className="chart-bar chart-bar-animated" style={{ width: "44%" }}>44%</div>
                    </div>
                  </div>
                  <div className="chart-item">
                    <span className="chart-label highlight-blue">SMS messages</span>
                    <div className="chart-bar-container">
                      <div className="chart-bar chart-bar-animated" style={{ width: "62%" }}>62%</div>
                    </div>
                  </div>
                  <div className="chart-item">
                    <span className="chart-label highlight-blue">Instant messaging applications</span>
                    <div className="chart-bar-container">
                      <div className="chart-bar chart-bar-animated" style={{ width: "81%" }}>81%</div>
                    </div>
                  </div>
                  <div className="chart-item">
                    <span className="chart-label">Phone call</span>
                    <div className="chart-bar-container">
                      <div className="chart-bar chart-bar-animated" style={{ width: "81%" }}>81%</div>
                    </div>
                  </div>
                  <div className="chart-item">
                    <span className="chart-label">Online communities or Forums</span>
                    <div className="chart-bar-container">
                      <div className="chart-bar chart-bar-animated" style={{ width: "16%" }}>16%</div>
                    </div>
                  </div>
                  <div className="chart-item">
                    <span className="chart-label">Online marketplaces</span>
                    <div className="chart-bar-container">
                      <div className="chart-bar chart-bar-animated" style={{ width: "22%" }}>22%</div>
                    </div>
                  </div>
                  <div className="chart-item">
                    <span className="chart-label">Interact in person</span>
                    <div className="chart-bar-container">
                      <div className="chart-bar chart-bar-animated" style={{ width: "18%" }}>18%</div>
                    </div>
                  </div>
                  <div className="chart-item">
                    <span className="chart-label">Dating sites or apps</span>
                    <div className="chart-bar-container">
                      <div className="chart-bar chart-bar-animated" style={{ width: "12%" }}>12%</div>
                    </div>
                  </div>
                  <div className="chart-item">
                    <span className="chart-label">Postal services</span>
                    <div className="chart-bar-container">
                      <div className="chart-bar chart-bar-animated" style={{ width: "10%" }}>10%</div>
                    </div>
                  </div>
                  <div className="chart-item">
                    <span className="chart-label">Live video streaming platforms</span>
                    <div className="chart-bar-container">
                      <div className="chart-bar chart-bar-animated" style={{ width: "7%" }}>7%</div>
                    </div>
                  </div>
                  <div className="chart-item">
                    <span className="chart-label">None of the above</span>
                    <div className="chart-bar-container">
                      <div className="chart-bar chart-bar-animated" style={{ width: "12%" }}>12%</div>
                    </div>
                  </div>
                </div>
                <div className="source-text" style={{ textAlign: 'center' }}>Source: 2024 Asia Scam Report (Malaysia)</div>
              </div>

              <div className="stats-info">
                <h2 className="section-title" style={{ textAlign: 'left' }}>
                  <span className="gradient-text">Alarming Rise of</span><br />
                  <span className="gradient-text">Online Scams</span>
                </h2>
                <div className="stats-details">
                  <p>
                    In 2024, Malaysians lost <span className="highlight">$12.8 billion</span> in scams,
                    equivalent to 3% of the country's gross domestic product.
                  </p>
                  <p>
                    Approximately <span className="highlight">74%</span> of respondents said they
                    were targeted by scammers at least once a month.
                  </p>
                  <p className="warning-text warning-blue">
                    Don't wait until you're the next victim!
                  </p>
                </div>
              </div>
            </section>

            {/* 在这里插入箭头，位于第二屏和第三屏之间 */}
            <div className="scroll-icon-container" style={{ marginTop: '0', marginBottom: '40px' }} onClick={handleScrollDown}>
              <img src={scrollIcon} className="scroll-icon" alt="Scroll down" />
            </div>

            {/* Let's Start Section */}
            <section className="start-section">
              <h2 className="section-title">
                <span className="gradient-text">Let's Start !</span>
              </h2>
              <div className="detection-options">
                <div className="detection-card" onClick={() => onNavigate("detection", { tab: "email" })}>
                  <h3>Email Scam</h3>
                  <p>Paste Email content to analyze</p>
                </div>
                <div className="detection-card" onClick={() => onNavigate("detection", { tab: "sms" })}>
                  <h3>SMS Scam</h3>
                  <p>Paste SMS content to analyze</p>
                </div>
                <div className="detection-card" onClick={() => onNavigate("detection", { tab: "url" })}>
                  <h3>URL Scam</h3>
                  <p>Paste URL content to analyze</p>
                </div>
              </div>
              <div className="detection-options">
                <div className="detection-card" onClick={() => onNavigate("knowledge")}>
                  <h3>Knowledge Hub</h3>
                  <p>Learn about scam types and reporting steps</p>
                </div>
                <div className="detection-card" onClick={() => onNavigate("dashboard")}>  
                  <h3>Scam Stats</h3>
                  <p>Real-time statistics on cybercrimes across countries</p>
                </div>
                <div className="detection-card" onClick={() => onNavigate("chatbot")}>
                  <h3>Al Chatbot</h3>
                  <p>Enhance scam awareness by Al assistant</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
