import React from "react";

const AIThinkingIndicator = () => {
    return (
        <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl w-fit animate-pulse">
            <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
            </div>
            <span className="text-sm font-medium text-blue-300">AI analyzing data...</span>
        </div>
    );
};

export default AIThinkingIndicator;
