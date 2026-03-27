import { useState, useCallback } from "react";
import API_URL from "../services/api";

/**
 * Custom hook for handling streamed AI responses with fallback.
 */
export const useChatStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);

  const streamChat = useCallback(async (message, context, onChunk) => {
    setIsStreaming(true);
    let fullText = "";

    try {
      const response = await fetch(`${API_URL}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, context }),
      });

      // ✅ Fallback if streaming fails
      if (!response.ok || !response.body) {
        console.warn("Streaming failed, switching to fallback API...");

        const fallback = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, context }),
        });

        if (!fallback.ok) {
          throw new Error(`Fallback API failed: ${fallback.status}`);
        }

        const data = await fallback.json();

        const text =
  data?.response ||
  data?.reply ||   // 🔥 ADD THIS LINE
  data?.message ||
  data?.result ||
  "No response from server";

        onChunk(text);
        return;
      }

      // ✅ Streaming logic
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const messages = buffer.split("\n\n");
        buffer = messages.pop() || "";

        for (const msg of messages) {
          if (msg.includes("data: [DONE]")) {
            setIsStreaming(false);
            return;
          }

          if (msg.startsWith("data: ")) {
            try {
              const raw = msg.slice(6);
              const content = JSON.parse(raw);

              if (content) {
                fullText += content;
                onChunk(fullText);
              }
            } catch (e) {
              console.error("Error parsing SSE chunk:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);

      // ❗ Final fallback error message
      onChunk("⚠️ Error: Unable to fetch response from server.");
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { streamChat, isStreaming };
};
