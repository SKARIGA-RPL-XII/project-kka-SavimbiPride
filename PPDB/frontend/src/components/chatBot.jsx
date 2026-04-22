import { FaTimes } from "react-icons/fa";
import React, { useState, useEffect, useRef } from "react";
import hello from "../assets/helloAgetha.png";
import idle from "../assets/catAgetha.png";
import icon from "../assets/agethaIcon.jpeg";
import proses from "../assets/thinkingAgetha.png";
import badword from "../assets/madAgetha.png";
import voice from "../assets/soundDialog.mp3"; 

export default function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const [isTyping, setIsTyping] = useState(false);   
  const [isAnimate, setIsAnimate] = useState(false);
  const [charImage, setCharImage] = useState(idle); 
  
  const chatEndRef = useRef(null);
  const audioRef = useRef(new Audio(voice));
  const typingIntervalRef = useRef(null);

  const userData = JSON.parse(sessionStorage.getItem("user"));
  const userProfilePic = userData?.foto 
    ? `http://localhost:5000/avatars/${userData.foto}` 
    : icon;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const typeWriterEffect = (fullText, isBad) => {
    let currentText = "";
    let index = 0;
    
    setIsTyping(true);
    setMessages((prev) => [...prev, { role: "bot", text: "" }]);

    audioRef.current.loop = true;
    audioRef.current.play().catch(err => console.log("Audio play blocked"));

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    typingIntervalRef.current = setInterval(() => {
      if (index < fullText.length) {
        currentText += fullText[index];
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = currentText;
          return newMessages;
        });
        index++;
      } else {
        clearInterval(typingIntervalRef.current);
        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        if (isBad) {
          setCharImage(badword);
        } else {
          setCharImage(idle);
        }
        setIsTyping(false);
        setIsLoading(false);
      }
    }, 40);
  };

  useEffect(() => {
    setTimeout(() => {
      setIsAnimate(true);
    }, 50);

    const welcomeTimer = setTimeout(() => {
      setCharImage(hello); // Langsung jadi hello
      typeWriterEffect("Halo! Aku Agetha. Ada yang bisa aku bantu?", false);
    }, 1000);

    return () => {
      clearTimeout(welcomeTimer);
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      audioRef.current.pause();
    };
  }, []);

  const handleSendMessage = async (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "" && !isLoading && !isTyping) {
      const userText = inputValue.trim();
      setMessages((prev) => [...prev, { role: "user", text: userText }]);
      setInputValue("");
      setIsLoading(true);
      setCharImage(proses);

      try {
        const response = await fetch("http://localhost:5000/api/chatbot/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userText }),
        });
        
        const data = await response.json();
        
        setTimeout(() => {
          setIsLoading(false);
          setCharImage(idle); 
          typeWriterEffect(data.response, data.isBad);
        }, 1500);

      } catch (error) {
        console.error("Gagal menghubungi server:", error);
        setIsLoading(false);
        typeWriterEffect("Maaf, serverku sedang bermasalah. Coba lagi nanti ya!", false);
        setCharImage(hello);
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-[999] flex items-end justify-center bg-black/40 backdrop-blur-sm pb-10 transition-opacity duration-700 ${isAnimate ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`w-[1000px] h-[550px] bg-transparent flex overflow-hidden transition-all duration-1000 ease-out transform ${isAnimate ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <div className="w-1/2 flex items-end justify-center relative">
          <div className={`absolute bottom-[450px] left-[65%] -translate-x-1/2 flex items-center justify-center rounded-2xl bg-white px-6 py-2 text-center text-sm text-black shadow-xl border border-gray-100 max-w-[280px] transition-all duration-700 ${isAnimate ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="line-clamp-3 italic">
              {isLoading ? (
                <span>Agetha sedang memikirkan sesuatu...</span>
              ) : (
                messages.filter(m => m.role === 'bot').slice(-1)[0]?.text || "..."
              )}
            </div>
            <div className="absolute -bottom-2 left-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-white rotate-[20deg]"></div>
          </div>
          
          <img 
            src={charImage} 
            className={`w-[520px] object-contain drop-shadow-lg transition-all duration-500 }`}
            alt="Agetha"
          />
        </div>

        <div className="w-1/2 bg-[#3b2aa8] border-2 border-[#31269c] p-4 flex flex-col shadow-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-white text-2xl font-rubik-glitch tracking-wider">
            Agetha
            </h2>
            <button onClick={onClose} className="bg-red-600 border-2 border-black text-black w-8 h-8 flex items-center justify-center font-bold hover:bg-red-700 cursor-pointer">
              <FaTimes size={12} />
            </button>
          </div>

          <div className="flex-1 bg-gray-200 rounded-xl p-4 mt-2 overflow-y-auto space-y-4 shadow-inner text-black">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "bot" && <img src={icon} className="w-8 h-8 rounded-full shadow-sm border border-indigo-300" alt="bot" />}
                <span className={`${
                    msg.role === "user" 
                    ? "bg-black text-white px-4 py-1.5 rounded-br-none shadow-md" 
                    : "bg-indigo-600 text-white px-5 py-2 rounded-bl-none shadow-md"
                  } rounded-2xl text-sm max-w-[80%] whitespace-pre-wrap`}
                >
                  {msg.text}
                </span>
                {msg.role === "user" && (
                  <img 
                    src={userProfilePic} 
                    alt="Profile"
                    className="w-7 h-7 rounded-full shadow-sm border border-gray-400 object-cover" 
                    onError={(e) => { e.target.src = icon; }}
                  />
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2">
                <img src={icon} className="w-8 h-8 rounded-full opacity-50" alt="loading" />
                <span className="bg-gray-300 text-gray-600 px-4 py-1 rounded-full text-xs">
                  Agetha sedang memikirkan sesuatu...
                </span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="mt-3">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleSendMessage}
              disabled={isLoading || isTyping}
              placeholder={isLoading || isTyping ? "Tunggu Agetha ya..." : "Ketik pesan disini..."}
              className={`w-full bg-white text-center text-sm py-3 rounded-full outline-none text-black shadow-inner border border-transparent focus:border-indigo-400 transition-all ${(isLoading || isTyping) ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}