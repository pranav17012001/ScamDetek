// src/components/AccessGate.js
import React, { useState } from "react";
import "./AccessGate.css";

const AccessGate = ({ onAccessGranted }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (username === "admin" && password === "scamdetek123") {
      onAccessGranted();
    } else {
      setError("Invalid credentials.");
    }
  };

  return (
    <div className="access-gate">
      <h2>Restricted Access</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSubmit}>Enter</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default AccessGate;
