import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchHistory } from '../contexts/SearchHistoryContext';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

const Chat = () => {
    const { currentUser } = useAuth();
    const { addSearch } = useSearchHistory();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);


    // Real-time Firestore Sync
    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'users', currentUser.uid, 'chats'),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (msgs.length === 0) {
                // Add welcome message if empty
                setMessages([{ id: 'welcome', role: 'bot', text: 'Hello! I am your AI Health Assistant. How can I help you today?', createdAt: new Date() }]);
            } else {
                setMessages(msgs);
            }
        });

        return unsubscribe;
    }, [currentUser]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const fileToGenerativePart = async (file) => {
        const base64EncodedDataPromise = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(file);
        });
        return { data: await base64EncodedDataPromise, mimeType: file.type };
    };

    const handleSend = async () => {
        if (!input.trim() || !currentUser) return;

        const textInput = input;
        setInput('');
        setIsTyping(true);

        try {
            // 1. Save User Message to DB
            await addDoc(collection(db, 'users', currentUser.uid, 'chats'), {
                text: textInput,
                role: 'user',
                createdAt: serverTimestamp()
            });

            // Save to search history
            await addSearch({
                query: textInput,
                page: 'chat',
                title: 'Chat Query'
            });

            // 2. Generate AI Response
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            console.log("Calling Backend API:", `${API_URL}/api/chat`);
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: textInput,
                    history: messages.slice(-5).map(msg => ({
                        role: msg.role === 'bot' ? 'bot' : 'user',
                        text: msg.text
                    }))
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get response from AI");
            }

            const data = await response.json();
            const responseText = data.text;

            // 3. Save AI Response to DB
            await addDoc(collection(db, 'users', currentUser.uid, 'chats'), {
                text: responseText,
                role: 'bot',
                createdAt: serverTimestamp()
            });

            // TTS (Optional)
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(responseText);
                window.speechSynthesis.speak(utterance);
            }

        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage = {
                id: Date.now() + 1,
                text: `Error: ${error.message}. Please check Render logs or API key.`,
                role: 'bot',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            await addDoc(collection(db, 'users', currentUser.uid, 'chats'), {
                text: errorMessage.text,
                role: errorMessage.role,
                createdAt: serverTimestamp()
            });
            setIsTyping(false);
        } finally {
            setIsTyping(false);
        }
    };

    const toggleMic = () => {
        // ... (Keep existing mic logic) ...
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Voice recognition not supported in this browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
        };

        recognition.start();
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;

        const imageUrl = URL.createObjectURL(file);

        // Note: For full image persistence, we'd need Firebase Storage. 
        // For now, we'll just handle the immediate interaction.
        const inlineData = await fileToGenerativePart(file);

        // Save marker message
        await addDoc(collection(db, 'users', currentUser.uid, 'chats'), {
            text: '[Uploaded an Image]',
            role: 'user',
            image: imageUrl, // Local URL only valid for this session in real DB app needs storage URL
            createdAt: serverTimestamp()
        });

        // Trigger AI analysis for image (simplified for now)
        setIsTyping(true);
        // ... (AI Image Logic would go here - omitted for brevity in this step) ...
        setIsTyping(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] relative">
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                            : 'glass-card text-slate-100 rounded-tl-none'
                            }`}>
                            {msg.image && (
                                <img src={msg.image} alt="Upload" className="max-w-xs rounded-lg mb-2 border border-white/20" />
                            )}
                            <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="glass-card p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                            <Loader2 className="animate-spin text-cyan-400" size={16} />
                            <span className="text-sm text-slate-400">AI is analyzing...</span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#0f172a] to-transparent">
                <div className="glass-panel p-2 flex items-center gap-2">
                    <label className="p-2 text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors">
                        <ImageIcon size={22} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>

                    <button
                        onClick={toggleMic}
                        className={`p-2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-cyan-400'}`}
                    >
                        <Mic size={22} />
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your health concern..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 p-2"
                    />

                    <button
                        onClick={handleSend}
                        className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white hover:opacity-90 transition-opacity"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
