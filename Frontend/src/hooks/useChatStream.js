import { useState, useCallback } from "react";
import API_URL from "../services/api";

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
        const fallback = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, context }),
        });

        const data = await fallback.json();

        onChunk(
          data?.response ||
          data?.reply ||
          "No response"
        );
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);

        // 🔥 Split SSE messages
        const lines = chunk.split("\n");

        for (let line of lines) {
          if (!line.startsWith("data: ")) continue;

          const data = line.replace("data: ", "").trim();

          if (data === "[DONE]") {
            setIsStreaming(false);
            return;
          }

          // 🔥 IMPORTANT: Treat as plain text
          let text = data;

          try {
            // If it's JSON, parse it
            const parsed = JSON.parse(data);
            text =
              parsed?.response ||
              parsed?.reply ||
              parsed?.message ||
              parsed;
          } catch {
            // It's already plain string → OK
          }

          if (text) {
            fullText += text;
            onChunk(fullText);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      onChunk("⚠️ Error getting response");
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { streamChat, isStreaming };
};
