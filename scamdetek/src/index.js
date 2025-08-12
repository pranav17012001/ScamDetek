import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from 'react-router-dom';

const resizeObserverError = "ResizeObserver loop completed with undelivered notifications.";
const resizeObserverErrorAlt = "ResizeObserver loop limit exceeded";

window.addEventListener('error', (event) => {
  if (
    event.message &&
    (event.message.includes(resizeObserverError) || 
     event.message.includes(resizeObserverErrorAlt))
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
    return false;
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason && 
    event.reason.message && 
    (event.reason.message.includes(resizeObserverError) ||
     event.reason.message.includes(resizeObserverErrorAlt))
  ) {
    event.preventDefault();
    event.stopPropagation();
  }
});

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback) {
    super((entries, observer) => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries)) return;
        callback(entries, observer);
      });
    });
  }
};

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
