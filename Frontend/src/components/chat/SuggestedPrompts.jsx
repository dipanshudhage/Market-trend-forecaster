import { BarChart, TrendingDown, Flame, ThumbsDown } from "lucide-react";

const SuggestedPrompts = ({ onSelect }) => {
    const prompts = [
        { text: "Compare Echo Dot vs Nest Mini sentiment this week", icon: <BarChart size={14} /> },
        { text: "What caused the latest sentiment drop?", icon: <TrendingDown size={14} /> },
        { text: "Show trending topics in reviews", icon: <Flame size={14} /> },
        { text: "Which product has the most negative feedback?", icon: <ThumbsDown size={14} /> }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full px-4">
            {prompts.map((prompt, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(prompt.text)}
                    className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500/30 transition-all text-left group"
                >
                    <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-blue-600/20 text-gray-400 group-hover:text-blue-400 transition-colors">
                        {prompt.icon}
                    </div>
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{prompt.text}</span>
                </button>
            ))}
        </div>
    );
};

export default SuggestedPrompts;
