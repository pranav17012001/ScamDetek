import React from "react";

const QuizStartPage = ({ onStartQuiz, onNavigate }) => {
  return (
    <div className="quiz-start-container">
      <div className="back-button" onClick={() => onNavigate("gamifiedCenter")}>
        ← Back to Gamified Center
      </div>
      <h1 className="quiz-title">
        <span className="gradient-text">Welcome to Scam Snap</span>
      </h1>
      
      <div className="quiz-start-content">
        <p className="quiz-description">
          Test your knowledge about common scams and improve your self-protection awareness
        </p>
        
        <div className="quiz-instructions">
          <h2>Instructions</h2>
          <ul>
            <li>Each question presents a real-world scam scenario</li>
            <li>Choose the response you think is safest</li>
            <li>After submitting, you'll see detailed explanations</li>
            <li>At the end, you'll receive your score and recommendations</li>
          </ul>
        </div>
        
        <button 
          className="start-quiz-button" 
          onClick={onStartQuiz}
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizStartPage; 