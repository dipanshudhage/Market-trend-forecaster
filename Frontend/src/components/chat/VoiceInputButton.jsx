import React, { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

/**
 * Voice Input button using Web Speech API.
 */
const VoiceInputButton = ({ onTranscript, disabled }) => {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recog = new SpeechRecognition();
            recog.continuous = false;
            recog.interimResults = false;
            recog.lang = "en-US";

            recog.onstart = () => setIsListening(true);
            recog.onend = () => setIsListening(false);
            recog.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                onTranscript(transcript);
            };

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRecognition(recog);
        }
    }, [onTranscript]);

    const toggleListen = () => {
        if (isListening) {
            recognition?.stop();
        } else {
            recognition?.start();
        }
    };

    if (!recognition) return null;

    return (
        <button
            onClick={toggleListen}
            disabled={disabled}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 relative overflow-hidden group mb-1
                 ${isListening
                    ? "text-blue-400 bg-blue-500/10"
                    : "text-gray-500 hover:text-gray-300 bg-transparent hover:bg-white/5"}`}
            title={isListening ? "Stop Listening" : "Voice Input"}
        >
            {isListening && (
                <span className="absolute inset-0 bg-blue-500/20 animate-pulse" />
            )}
            <div className="relative z-10 transition-transform group-hover:scale-110">
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </div>
        </button>
    );
};

export default VoiceInputButton;
