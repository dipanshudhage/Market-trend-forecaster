// src/services/chatService.js
import httpClient from "./httpClient";

export async function sendChatMessage(message, context = "sentiment_dashboard") {
  try {
    const response = await httpClient.post("/api/chat", {
      message,
      context
    });

    return {
      success: true,
      reply: response.data.reply
    };
  } catch (error) {
    console.error("Chat API error:", error);
    
    // Return fallback responses for common errors
    if (error.response?.status === 429) {
      return {
        success: false,
        reply: "I'm thinking too hard! Please wait a moment and try again."
      };
    }
    
    if (error.response?.status >= 500) {
      return {
        success: false,
        reply: "Server is taking a coffee break. Please try again shortly."
      };
    }
    
    return {
      success: false,
      reply: "Sorry, I'm having trouble connecting right now. Please try again."
    };
  }
}

// Optional: Get chat history (if backend supports it later)
export async function getChatHistory(sessionId) {
  try {
    const response = await httpClient.get(`/api/chat/history/${sessionId}`);
    return {
      success: true,
      history: response.data.history
    };
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    return { success: false, history: [] };
  }
}
