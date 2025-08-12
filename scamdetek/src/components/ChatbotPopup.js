import React, { useState, useEffect, useRef } from "react";
import "./ChatbotPopup.css"; // We will create this CSS file next
import ReactMarkdown from "react-markdown";

const ChatbotPopup = ({ isOpen, onClose }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content: "Hi, I am your ScamDetek assistant! How can I help you?",
    },
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to reset chat when popup opens, if it was previously closed.
  // This depends on how you want to manage chat state persistence across popup sessions.
  // For now, let's reset it each time it opens for simplicity.
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          type: "bot",
          content: "Hi, I am your ScamDetek assistant! How can I help you?",
        },
      ]);
      setInputMessage("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const predefinedQuestions = [
    "How can I tell if a social-media ad is a scam?",
    "What red flags show that a website might be fraudulent?",
    "What steps should I follow to file a cybercrime report online?"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newUserMessage = { type: "user", content: inputMessage };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsLoading(true);
    fetch("https://scamdetek.live/api/ask-gemini", {
    // fetch("http://localhost:8000/api/ask-gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: inputMessage }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            type: "bot",
            content: data.answer || "Sorry, I couldn't get an answer.",
          },
        ]);
      })
      .catch((err) => {
        console.error("API error:", err);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            type: "bot",
            content: "Something went wrong. Please try again later.",
          },
        ]);
      })
      .finally(() => {
        setIsLoading(false);
      });

    setInputMessage("");
  };

  const handleQuestionClick = (question) => {
    const questionText = question; // No need to replace icon if it's not there
    setInputMessage(questionText); // Set as input to allow user to see it before sending, or modify

    const newUserMessage = { type: "user", content: questionText };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsLoading(true);
    fetch("https://scamdetek.live/api/ask-gemini", {
    // fetch("http://localhost:8000/api/ask-gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: questionText }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            type: "bot",
            content: data.answer || "Sorry, I couldn't get an answer.",
          },
        ]);
      })
      .catch((err) => {
        console.error("API error:", err);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            type: "bot",
            content: "Something went wrong. Please try again later.",
          },
        ]);
      })
      .finally(() => {
        setIsLoading(false);
      });
      setInputMessage(""); // Clear input after sending
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-popup-container">
      <div className="chatbot-popup-header">
        <h3>AI Scam Awareness Assistant</h3>
        <button onClick={onClose} className="chatbot-popup-close-btn">
          &times; {/* Unicode for 'X' symbol */}
        </button>
      </div>
      <div className="chatbot-popup-messages">
        {messages.map((message, index) =>
          message.type === "bot" ? (
            <div className="bot-message-popup" key={index}>
              <div className="bot-avatar-popup">
                <img
                  src="/bot-avatar.png"
                  alt="Bot"
                  className="bot-avatar-img-popup"
                />
              </div>
              <div className="message-content-popup">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="user-message-popup" key={index}>
              <div className="message-content-popup">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          )
        )}
        {isLoading && (
          <div className="bot-message-popup thinking-popup">
            <div className="bot-avatar-popup">
              <img
                src="/bot-avatar.png"
                alt="Bot"
                className="bot-avatar-img-popup"
              />
            </div>
            <div className="message-content-popup">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!isLoading && messages.length <= 1 && ( // Only show predefined if no real conversation started
          <div className="chatbot-popup-predefined-questions">
              {predefinedQuestions.map((q, i) => (
                  <button key={i} onClick={() => handleQuestionClick(q)} className="predefined-question-popup">
                      {q} {/* Display question without icon */}
                  </button>
              ))}
          </div>
      )}

      <form onSubmit={handleSubmit} className="chatbot-popup-input-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="chatbot-popup-input"
          disabled={isLoading}
        />
        <button type="submit" className="chatbot-popup-send-btn" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatbotPopup; 