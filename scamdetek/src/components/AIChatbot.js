import React, { useState } from "react";
import "../App.css";
import ReactMarkdown from "react-markdown";
const AIChatbot = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  //new conversation window
  const [conversations, setConversations] = useState([{
    id: Date.now(),
    title: "New Chat",
    createdAt: new Date(),
    messages: [{
      type: "bot",
      content: "Hi, I am your ScamDetek assistant! How can I help you?",
    }],
  }]);
  const [activeId, setActiveId] = useState(conversations[0].id);
  const activeConversation = conversations.find((c) => c.id === activeId);
  const [predefinedClicked, setPredefinedClicked] = useState(false);
  const updateActiveMessages = (newMessages) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeId ? { ...conv, messages: newMessages } : conv
      )
    );
  };

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      createdAt: new Date(),
      messages: [{
        type: "bot",
        content: "Hi, I am your ScamDetek assistant! How can I help you?",
      }],
    };
    setConversations([newChat, ...conversations]);
    setActiveId(newChat.id);
    setInputMessage(""); // clear input box
    setPredefinedClicked(false);
  };
  //

  const predefinedQuestions = [
    "💬 How can I tell if a social-media ad is a scam?",
    "💬 What red flags show that a website might be fraudulent?",
    "💬 What steps should I follow to file a cybercrime report online?"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    if (activeConversation.title === "New Chat") {
      const firstWords = inputMessage.slice(0, 100);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeId ? { ...conv, title: firstWords } : conv
        )
      );
    }

    // Add user message
    const newMessages = [...(activeConversation?.messages || []), { type: "user", content: inputMessage }];
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeId ? { ...conv, messages: newMessages } : conv
      ));

    // // Simulate bot response
    // setTimeout(() => {
    //   setMessages((prevMessages) => [
    //     ...prevMessages,
    //     {
    //       type: "bot",
    //       content:
    //         "I'm analyzing your query about scams. Common scams include SMS phishing, fake bank websites, and phone call scams. Always verify communications through official channels and never share your OTP or banking credentials.",
    //     },
    //   ]);
    // }, 1000);

    // truely answer
    setIsLoading(true);
    // fetch("http://localhost:8000/api/ask-gemini", {
    fetch("https://scamdetek.live/api/ask-gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: inputMessage })
    })
      .then(res => res.json())
      .then(data => {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeId
              ? {
                ...conv,
                messages: [
                  ...(conv.messages || []),
                  {
                    type: "bot",
                    content: data.answer || "Sorry, I couldn't get an answer.",
                  },
                ],
              }
              : conv
          )
        );

      })
      .catch(err => {
        console.error("API error:", err);
        updateActiveMessages([
          ...(activeConversation?.messages || []),
          {
            type: "bot",
            content: "Something went wrong. Please try again later.",
          },
        ]);
      }).finally(() => {
        setIsLoading(false);
      });


    setInputMessage("");
  };


  const handleQuestionClick = (question) => {
    setPredefinedClicked(true);

    // Add predefined question to messages
    const userMessage = { type: "user", content: question };
    const currentMessages = [...(activeConversation?.messages || []), userMessage];
    updateActiveMessages(currentMessages);

    setIsLoading(true);
    fetch("https://scamdetek.live/api/ask-gemini", {
    // fetch("http://localhost:8000/api/ask-gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: question }),
    })
      .then((res) => res.json())
      .then((data) => {
        const botMessage = {
          type: "bot",
          content: data.answer || "Sorry, I couldn't get an answer.",
        };
        updateActiveMessages([...currentMessages, botMessage]);

        // 设置会话标题为 Gemini 返回标题（仅首次）
        if (activeConversation.title === "New Chat" && data.title) {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === activeId ? { ...conv, title: data.title } : conv
            )
          );
        }
      })
      .catch((err) => {
        console.error("API error:", err);
        updateActiveMessages([
          ...currentMessages,
          {
            type: "bot",
            content: "Something went wrong. Please try again later.",
          },
        ]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };


  return (
    <div className="chatbot-page">
      <div className="chatbot-container">
        <div className="chat-sidebar">
          <h3 className="sidebar-title">Chat History</h3>

          <div><button className="new-chat-btn" onClick={handleNewChat}>
            + New Chat
          </button></div>

          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`chat-history-item ${conv.id === activeId ? "active" : ""}`}
              onClick={() => setActiveId(conv.id)}
            >
              <div className="history-title">{conv.title}</div>
              <div className="history-time">
                Time:{conv.createdAt.toLocaleTimeString('en-GB', { hour12: false })}
              </div>
            </div>
          ))}
        </div>

        <div className="chat-main">
          <div className="chat-header">
            <h3 className="chat-title">AI Scam Awareness Assistant</h3>
            <p className="chat-subtitle">
              Meet ScamDetek—your AI-powered guide to spotting scams, understanding Malaysian cyber laws, and walking you through every step of reporting fraud.
            </p>
          </div>

          <div className="chat-messages">
            {activeConversation?.messages.map((message, index) =>
              message.type === "bot" ? (
                <div className="bot-message" key={index}>
                  <div className="bot-avatar">
                    <img
                      src="/bot-avatar.png"
                      alt="Bot"
                      className="bot-avatar-img"
                    />
                  </div>
                  <div className="message-content">
                    {/* {message.content.split("\n").map((line, i) =>
                      line.startsWith("-") || line.startsWith("•") ? (
                        <div key={i} style={{ marginLeft: "15px" }}>
                          {line}
                        </div>
                      ) : (
                        <div key={i}>{line}</div>
                      )
                    )} */}
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>

                </div>
              ) : (
                <div className="user-message" key={index}>
                  <div className="message-content"><ReactMarkdown>{message.content}</ReactMarkdown></div>
                </div>
              )
            )}
            {isLoading && (
              <div className="bot-message thinking">
                <div className="bot-avatar">
                  <img
                    src="/bot-avatar.png"
                    alt="Bot"
                    className="bot-avatar-img"
                  />
                </div>
                <div className="message-content">
                  <em>🤖AI chatbot is thinking...</em>
                </div>
              </div>
            )}

            {/* Predefined questions inside chat-messages */}
            {!predefinedClicked && activeConversation?.messages.filter((m) => m.type === "user").length === 0 && (
              <div className="question-container">
                {predefinedQuestions.map((question, idx) => (
                  <div
                    key={idx}
                    className="question-bubble"
                    onClick={() => handleQuestionClick(question)}
                  >
                    {question}
                  </div>
                ))}
              </div>
            )}

          </div>

          <form className="chat-input-container" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message here..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button type="submit" className="send-button">
              Send
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginLeft: "5px" }}
              >
                <path
                  d="M22 2L11 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;