import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

/**
 * A reusable component that animates text reveal word-by-word.
 */
const TypingMessage = ({ content, speed = 15, onComplete }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < content.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + content[index]);
                setIndex((prev) => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [index, content, speed, onComplete]);

    return (
        <div className="flex items-start gap-1">
            <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed">
                <ReactMarkdown>{displayedText || ""}</ReactMarkdown>
            </div>
            {index < content.length && <span className="typing-line" />}
        </div>
    );
};

export default TypingMessage;
