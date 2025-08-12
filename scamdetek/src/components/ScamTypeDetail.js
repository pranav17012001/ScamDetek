import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { scamsTypeList } from "../utils/const";
import "./scamsTypeDetail.css";

const ScamTypeDetail = ({ onNavigate }) => {
  const { title: urlTitle } = useParams();

  const formattedTitle = urlTitle
    ? decodeURIComponent(urlTitle)
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : "";

  const [scamType, setScamType] = useState(
    scamsTypeList.find((scam) => scam.title === formattedTitle) || scamsTypeList[0]
  );
  const [videoPlaying, setVideoPlaying] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    if (formattedTitle) {
      const foundScam = scamsTypeList.find((scam) => scam.title === formattedTitle);
      if (foundScam) {
        setScamType(foundScam);
        setVideoPlaying(false);
      }
    }

    return () => {
      stopVideo();
    };
  }, [formattedTitle]);

  const stopVideo = () => {
    if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = "";
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = src.replace("autoplay=1", "autoplay=0");
        }
      }, 10);
    }
    setVideoPlaying(false);
  };

  const isYoutubeVideo = (source) => {
    if (!source) return false;
    if (typeof source !== "string") return false;
    return (
      source.includes("youtube.com/embed/") ||
      source.includes("youtu.be/") ||
      source.includes("youtube.com/watch")
    );
  };

  const getYoutubeVideoId = (url) => {
    if (!url) return null;

    if (url.includes("youtube.com/embed/")) {
      return url.split("youtube.com/embed/")[1].split("?")[0];
    } else if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("youtube.com/watch")) {
      const params = new URLSearchParams(url.split("?")[1]);
      return params.get("v");
    }
    return null;
  };

  const getYoutubeThumbnail = (videoId) => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const toggleVideo = () => {
    setVideoPlaying(!videoPlaying);
    if (videoPlaying) {
      stopVideo();
    }
  };

  const renderExampleContent = () => {
    if (!scamType.exampleSource) {
      return <p>Example not available</p>;
    }

    if (isYoutubeVideo(scamType.exampleSource)) {
      const videoId = getYoutubeVideoId(scamType.exampleSource);

      if (videoPlaying) {
        return (
          <div className="video-player-container">
            <iframe
              ref={iframeRef}
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={`${scamType.title} example`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
            <button
              className="video-stop-button"
              onClick={(e) => {
                e.stopPropagation();
                toggleVideo();
              }}
              aria-label="Stop video"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.7)" />
                <rect x="8" y="8" width="8" height="8" fill="white" />
              </svg>
            </button>
          </div>
        );
      } else {
        return (
          <div className="video-thumbnail-container" onClick={toggleVideo}>
            <img
              src={getYoutubeThumbnail(videoId)}
              alt={`${scamType.title} video thumbnail`}
              className="video-thumbnail"
            />
            <div className="play-button-overlay">
              <svg
                width="68"
                height="48"
                viewBox="0 0 68 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"
                  fill="red"
                ></path>
                <path d="M 45,24 27,14 27,34" fill="white"></path>
              </svg>
            </div>
          </div>
        );
      }
    } else {
      return (
        <div className="example-image-container">
          <img
            src={scamType.exampleSource}
            alt={`${scamType.title} example`}
            className="example-img"
            onError={(e) => {
              console.error("Failed to load image:", scamType.exampleSource);
              e.target.onerror = null;
              e.target.style.display = "none";
              e.target.parentNode.innerHTML = "Example image not available";
            }}
          />
        </div>
      );
    }
  };

  return (
    <div className="scams-type-detail">
      <div className="back-button" onClick={() => onNavigate("scamsType")}>
        ← Back to Scam Types
      </div>

      <div className="main-content">
        <div className="phone-scam-section">
          <div className="scam-icon">
            <img
              src={scamType.cardIcon}
              alt={`${scamType.title} icon`}
              className="card-icon"
              onError={(e) => {
                console.error("Failed to load icon:", scamType.cardIcon);
                e.target.onerror = null;
                e.target.style.display = "none";
              }}
            />
          </div>
          <div className="scam-description">
            <h1 style={{ textAlign: "left" }}>{scamType.title}</h1>
            <p>{scamType.description}</p>
          </div>
        </div>

        <h2 className="section-title">How Does It Happen?</h2>
        <div className="process-container">
          <div className="example-box">
            <p>{scamType.exampleDesc || "Example of this scam type:"}</p>
            {renderExampleContent()}
          </div>
          <div className="steps-container">
            {scamType.howItHappens &&
              scamType.howItHappens.map((step, index) => (
                <div className="step" key={index}>
                  <div className="step-number">{index + 1}</div>
                  <div className="step-content">{step}</div>
                </div>
              ))}
          </div>
        </div>

        <h2 className="section-title">How to Defend?</h2>
        <div className="defense-box">
          <ul>
            {scamType.defense &&
              scamType.defense.map((defense, index) => (
                <li key={index}>{defense}</li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScamTypeDetail;
