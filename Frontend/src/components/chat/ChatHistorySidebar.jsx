import React, { useState } from "react";
import { Plus, MessageSquare, Edit2, Trash2, Check, X } from "lucide-react";

const ChatHistorySidebar = ({ conversations, currentChatId, onSelect, onNew, onRename, onDelete }) => {
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");

    const handleStartEdit = (e, id, currentTitle) => {
        e.stopPropagation();
        setEditingId(id);
        setEditTitle(currentTitle);
    };

    const handleSaveEdit = (e, id) => {
        e.stopPropagation();
        onRename(id, editTitle);
        setEditingId(null);
    };

    const handleCancelEdit = (e) => {
        e.stopPropagation();
        setEditingId(null);
    };

    return (
        <div className="w-72 h-full flex flex-col bg-slate-900/50 border-r border-white/5 backdrop-blur-xl">
            <div className="p-6">
                <button
                    onClick={onNew}
                    className="w-full flex items-center justify-between py-2.5 px-4 bg-white/5 hover:bg-white/10 
                     text-gray-200 rounded-xl transition-all border border-white/10 group active:scale-[0.98]"
                >
                    <div className="flex items-center gap-2">
                        <Plus size={16} className="text-blue-500" />
                        <span className="font-medium text-sm">New Forecast</span>
                    </div>
                    <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100">
                        <span className="text-[12px]">⌘</span>K
                    </kbd>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-1 py-2">
                <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                    Recent Activity
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                </div>
                {conversations.map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => onSelect(chat.id)}
                        className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border
                       ${currentChatId === chat.id
                                ? "bg-blue-600/10 text-white border-blue-500/30"
                                : "text-gray-400 hover:bg-white/5 border-transparent"}`}
                    >
                        <MessageSquare size={14} className={currentChatId === chat.id ? "text-blue-400" : "opacity-40"} />

                        {editingId === chat.id ? (
                            <div className="flex-1 flex items-center gap-1">
                                <input
                                    autoFocus
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full bg-slate-800 border border-blue-500/50 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <button onClick={(e) => handleSaveEdit(e, chat.id)} className="text-blue-400 hover:text-blue-300">
                                    <Check size={14} />
                                </button>
                                <button onClick={handleCancelEdit} className="text-gray-500 hover:text-white">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="flex-1 text-sm truncate tracking-tight">{chat.title}</span>
                                <div className="absolute right-2 hidden group-hover:flex items-center gap-1">
                                    <button
                                        onClick={(e) => handleStartEdit(e, chat.id, chat.title)}
                                        className="p-1.5 hover:bg-white/10 rounded-md text-gray-500 hover:text-white transition-all"
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(chat.id); }}
                                        className="p-1.5 hover:bg-red-500/10 rounded-md text-gray-500 hover:text-red-400 transition-all"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-6 border-t border-white/5">
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-400/60 text-[10px] uppercase font-bold tracking-widest text-center">
                    Local Storage Active
                </div>
            </div>
        </div>
    );
};

export default ChatHistorySidebar;
