// src/pages/AIChatbot.jsx
import React, { useState, useEffect, useRef } from "react";
import "../styles/chatbot.css";
import SuggestedPrompts from "../components/chat/SuggestedPrompts";
import TypingMessage from "../components/chat/TypingMessage";
import AIThinkingIndicator from "../components/chat/AIThinkingIndicator";
import ChatHistorySidebar from "../components/chat/ChatHistorySidebar";
import InsightCard from "../components/chat/InsightCard";
import ChatChart from "../components/chat/ChatChart";
import VoiceInputButton from "../components/chat/VoiceInputButton";
import { useChatStream } from "../hooks/useChatStream";
import ReactMarkdown from "react-markdown";
import { Copy, RefreshCw, Clock, Terminal, Maximize2, Minimize2 } from "lucide-react";

const DEFAULT_WELCOME = "Hi! I'm your AI Market Intelligence assistant. Ask me about brand sentiment, trends, alerts, or any competitor insights. What would you like to know?";

const AIChatbot = () => {
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("market_forecast_chats");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "initial",
        title: "New Intelligence Request",
        messages: [{ id: "welcome", role: "assistant", content: DEFAULT_WELCOME }]
      }
    ];
  });

  const [currentChatId, setCurrentChatId] = useState(() => {
    const saved = localStorage.getItem("market_forecast_current_id");
    return saved || "initial";
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const { streamChat } = useChatStream();
  const messagesEndRef = useRef(null);

  const commands = [
    { cmd: "/compare", desc: "Compare two products" },
    { cmd: "/trend", desc: "Show sentiment trends" },
    { cmd: "/alerts", desc: "Check latest alerts" },
    { cmd: "/topics", desc: "List trending topics" }
  ];

  const currentChat = conversations.find(c => c.id === currentChatId) || conversations[0];

  useEffect(() => {
    localStorage.setItem("market_forecast_chats", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem("market_forecast_current_id", currentChatId);
  }, [currentChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const sendMessage = async (overrideInput = null) => {
    const textToSend = (overrideInput !== null && typeof overrideInput === 'string') ? overrideInput : input;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend
    };

    // Update messages for current chat
    setConversations(prev => prev.map(c => {
      if (c.id === currentChatId) {
        let newTitle = c.title;
        if (c.messages.length <= 1) {
          newTitle = textToSend.slice(0, 30) + (textToSend.length > 30 ? "..." : "");
        }
        return { ...c, title: newTitle, messages: [...c.messages, userMessage] };
      }
      return c;
    }));

    setLoading(true);
    if (overrideInput === null) setInput("");

    // Create placeholder AI message for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const initialAiMessage = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      isStreaming: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(c =>
      c.id === currentChatId ? { ...c, messages: [...c.messages, initialAiMessage] } : c
    ));

    try {
      await streamChat(textToSend, "Market Forecaster", (fullText) => {
        setConversations(prev => prev.map(c =>
          c.id === currentChatId ? {
            ...c,
            messages: c.messages.map(m => m.id === aiMessageId ? { ...m, content: fullText } : m)
          } : c
        ));
      });

      // Finalize streaming
      setConversations(prev => prev.map(c =>
        c.id === currentChatId ? {
          ...c,
          messages: c.messages.map(m => m.id === aiMessageId ? { ...m, isStreaming: false } : m)
        } : c
      ));
    } catch (error) {
      console.error("Streaming failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setShowCommands(value.startsWith("/"));
  };

  const applyCommand = (cmd) => {
    setInput(cmd + " ");
    setShowCommands(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newChat = {
      id: newId,
      title: `Forecast ${conversations.length + 1}`,
      messages: [{ id: "welcome", role: "assistant", content: DEFAULT_WELCOME }]
    };
    setConversations([newChat, ...conversations]);
    setCurrentChatId(newId);
  };

  const handleRename = (id, newTitle) => {
    setConversations(conversations.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const handleDelete = (id) => {
    const filtered = conversations.filter(c => c.id !== id);
    if (filtered.length === 0) {
      const initial = {
        id: "initial",
        title: "New Intelligence Request",
        messages: [{ id: "welcome", role: "assistant", content: DEFAULT_WELCOME }]
      };
      setConversations([initial]);
      setCurrentChatId("initial");
    } else {
      setConversations(filtered);
      if (currentChatId === id) setCurrentChatId(filtered[0].id);
    }
  };

  return (
    <div className={`flex overflow-hidden transition-all duration-500 ease-in-out ${isMaximized
      ? "fixed inset-0 w-screen h-screen z-[100] rounded-none bg-slate-950"
      : "h-[calc(100vh-120px)] rounded-3xl border border-white/10 shadow-2xl bg-slate-950/40 backdrop-blur-3xl"
      }`}>
      <ChatHistorySidebar
        conversations={conversations}
        currentChatId={currentChatId}
        onSelect={setCurrentChatId}
        onNew={handleNewChat}
        onRename={handleRename}
        onDelete={handleDelete}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="chatbot-header">
          <div className="chatbot-title-group">
            <div className="ai-avatar">🤖</div>
            <div>
              <h3>Market Intelligence: {currentChat?.title}</h3>
              <span className="status-indicator">
                <span className="status-dot"></span>
                Online
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 flex items-center gap-2 group/max"
            title={isMaximized ? "Exit Fullscreen" : "Maximize Chat"}
          >
            {isMaximized ? (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/max:opacity-100 transition-opacity">Minimize</span>
                <Minimize2 size={16} />
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/max:opacity-100 transition-opacity">Maximize</span>
                <Maximize2 size={16} />
              </>
            )}
          </button>
        </div>

        <div className="chatbot-messages flex-1 overflow-y-auto">
          {currentChat?.messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-avatar">
                {message.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content group/content relative">
                <div className="message-bubble relative">
                  {message.isStreaming ? (
                    <div className="flex items-start gap-1">
                      <div className="prose prose-invert max-w-none text-gray-200">
                        <ReactMarkdown>{message.content || ""}</ReactMarkdown>
                      </div>
                      <span className="typing-line" />
                    </div>
                  ) : (message.role === 'assistant' && message.isTyping) ? (
                    <TypingMessage
                      content={message.content}
                      onComplete={() => {
                        setConversations(prev =>
                          prev.map(c => ({
                            ...c,
                            messages: c.messages.map(m => m.id === message.id ? { ...m, isTyping: false } : m)
                          }))
                        );
                      }}
                    />
                  ) : (
                    <div className="space-y-4">
                      {(() => {
                        const content = message.content || "";
                        if (!content.includes("[INSIGHT:") && !content.includes("[CHART:")) {
                          return (
                            <div className="prose prose-invert max-w-none">
                              <ReactMarkdown>{content}</ReactMarkdown>
                            </div>
                          );
                        }

                        const parts = content.split(/(\[INSIGHT:.*?\]|\[CHART:.*?\])/g);
                        return parts.map((part, i) => {
                          if (part.startsWith("[INSIGHT:")) {
                            try {
                              const data = JSON.parse(part.slice(9, -1));
                              return <InsightCard key={i} {...data} />;
                            } catch { return <span key={i}>{part}</span>; }
                          } else if (part.startsWith("[CHART:")) {
                            try {
                              const data = JSON.parse(part.slice(7, -1));
                              return <ChatChart key={i} {...data} />;
                            } catch { return <span key={i}>{part}</span>; }
                          } else if (part.trim()) {
                            return (
                              <div key={i} className="prose prose-invert max-w-none">
                                <ReactMarkdown>{part}</ReactMarkdown>
                              </div>
                            );
                          }
                          return null;
                        });
                      })()}
                    </div>
                  )}

                  {!message.isStreaming && message.role === 'assistant' && (
                    <div className="flex gap-2 mt-3 opacity-0 group-hover/content:opacity-100 transition-opacity absolute -bottom-8 left-0">
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="p-1.5 hover:bg-white/5 hover:text-blue-400 text-gray-500 rounded-lg transition-all"
                        title="Copy response"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={() => {
                          const idx = currentChat.messages.indexOf(message);
                          if (idx > 0) sendMessage(currentChat.messages[idx - 1].content);
                        }}
                        className="p-1.5 hover:bg-white/5 hover:text-blue-400 text-gray-500 rounded-lg transition-all"
                        title="Regenerate"
                      >
                        <RefreshCw size={13} />
                      </button>
                    </div>
                  )}

                  {message.timestamp && !message.isStreaming && (
                    <span className="text-[10px] text-gray-600 absolute -bottom-6 right-0 opacity-0 group-hover/content:opacity-100 transition-opacity flex items-center gap-1">
                      <Clock size={10} /> {message.timestamp}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          {loading && (
            <div className="message ai-message ml-4">
              <div className="message-avatar">🤖</div>
              <AIThinkingIndicator />
            </div>
          )}
        </div>

        <div className="chatbot-input-container p-6 w-full">
          <div className="max-w-212.5 mx-auto relative">
            {currentChat?.messages.length <= 1 && !input && (
              <SuggestedPrompts onSelect={(text) => sendMessage(text)} />
            )}

            {/* Command Autocomplete */}
            {showCommands && (
              <div className="absolute bottom-full left-0 mb-4 w-72 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
                <div className="px-4 py-2.5 bg-blue-500/10 border-b border-white/5 text-blue-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                  <Terminal size={14} /> Quick Commands
                </div>
                <div className="p-1">
                  {commands.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => applyCommand(c.cmd)}
                      className="w-full text-left p-2.5 hover:bg-white/5 rounded-xl flex flex-col gap-0.5 transition-all group"
                    >
                      <span className="text-sm font-mono text-gray-200 group-hover:text-white">{c.cmd}</span>
                      <span className="text-[10px] text-gray-500">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="chatbot-input-area">
              <VoiceInputButton
                onTranscript={(text) => setInput(prev => prev + (prev ? " " : "") + text)}
                disabled={loading}
              />
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask about brand sentiment, trends, or competitors..."
                rows="1"
                disabled={loading}
                className="text-gray-200 placeholder:text-gray-500"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-blue-900/20 mb-1 mr-1"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 7-7 7 7" /><path d="M12 19V5" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-600 text-center mt-3 tracking-wide">
              AI can make mistakes. Check important data.
            </p>
          </div>
        </div>
      </div >
    </div >
  );
};

export default AIChatbot;
