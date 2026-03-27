import { useState, useCallback } from "react";
import API_URL from "../services/api";

/**
 * Custom hook for handling progressively streamed AI responses.
 */
export const useChatStream = () => {
    const [isStreaming, setIsStreaming] = useState(false);

    const streamChat = useCallback(async (message, context, onChunk) => {
        setIsStreaming(true);
        let fullText = "";

        try {
            const response = await fetch(`${API_URL}/api/chat/stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, context })
            });

            if (!response.body) return;
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                let messages = buffer.split("\n\n");
                // Keep the last partial message
                buffer = messages.pop() || "";

                for (const msg of messages) {
                    if (msg.includes("data: [DONE]")) {
                        setIsStreaming(false);
                        break;
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
        } finally {
            setIsStreaming(false);
        }
    }, []);

    return { streamChat, isStreaming };
};
