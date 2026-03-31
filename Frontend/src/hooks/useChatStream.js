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

      // 🔥 Fallback if streaming fails
      if (!response.ok || !response.body) {
        console.warn("Streaming failed, using fallback API...");

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
          data?.reply ||
          data?.message ||
          data?.result ||
          "No response from server";

        onChunk(text);
        return;
      }

      // 🔥 Streaming logic (SAFE VERSION)
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
          if (!msg.trim()) continue;

          if (msg.includes("data: [DONE]")) {
            setIsStreaming(false);
            return;
          }

          if (msg.startsWith("data: ")) {
            const raw = msg.slice(6).trim();

            if (!raw) continue;

            try {
              // Try parsing JSON first
              let content;

              try {
                content = JSON.parse(raw);
              } catch {
                // If not JSON → treat as plain text
                content = raw;
              }

              // Handle different formats safely
              let textChunk =
                content?.response ||
                content?.reply ||
                content?.message ||
                content?.delta ||
                content;

              if (typeof textChunk !== "string") {
                textChunk = String(textChunk || "");
              }

              if (textChunk) {
                fullText += textChunk;
                onChunk(fullText);
              }
            } catch (e) {
              console.error("Error processing chunk:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);

      // 🔥 Final fallback
      try {
        const fallback = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, context }),
        });

        const data = await fallback.json();

        const text =
          data?.response ||
          data?.reply ||
          "⚠️ Unable to fetch response";

        onChunk(text);
      } catch {
        onChunk("⚠️ Server error. Please try again.");
      }
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { streamChat, isStreaming };
};
