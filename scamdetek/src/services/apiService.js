// src/services/apiService.js

// const API_BASE_URL = "http://localhost:8000/api";
const API_BASE_URL = "https://scamdetek.live/api";

const apiService = {
  // Analyze content for scams
  analyzeContent: async (content, contentType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          content_type: contentType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Analysis failed");
      }

      return await response.json();
    } catch (error) {
      console.error("API error during analysis:", error);
      throw error;
    }
  },
};

export default apiService;
