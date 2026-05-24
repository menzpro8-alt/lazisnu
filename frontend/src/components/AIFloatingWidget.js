'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiPost } from '@/lib/api';

const COOL_QUOTES = [
  "Amanah dalam setiap rupiah, berkah untuk umat.",
  "Data akurat, keputusan tepat, manfaat meluas.",
  "Transparansi adalah kunci kepercayaan donatur.",
  "Zakat mensucikan harta, Infaq melipatgandakan pahala.",
  "Membangun masa depan umat melalui tata kelola yang cerdas.",
  "Sedekah tidak mengurangi harta, justru menambah keberkahan.",
  "Digitalisasi Lazisnu, mengabdi untuk kemandirian umat."
];

export default function AIFloatingWidget() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo! Ada yang bisa saya bantu analisis atau kerjakan hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % COOL_QUOTES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !user || user.role !== 'admin' || user.org_level !== 'PP') {
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const lowerInput = userMessage.toLowerCase();
      const taskKeywords = ['analisis', 'hitung', 'ringkas', 'data', 'laporan', 'statistik', 'total', 'persen', 'grafik', 'buatkan', 'tugas', 'pemasukan', 'pengeluaran', 'donatur', 'penerima', 'saldo'];
      const isTask = taskKeywords.some(word => lowerInput.includes(word));

      // Professional approach: Backend handles AI calls and context fetching
      const res = await apiPost('ai', {
        message: userMessage,
        history: messages.slice(1).map(m => ({ role: m.role, content: m.content })),
        isTask: isTask
      });

      // Data is wrapped in .data from backend successResponse
      const reply = res.data?.reply || 'Maaf, sistem sedang memproses data.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply, isTask }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: `[SISTEM]: Terjadi kesalahan koneksi. Silakan coba lagi.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Button with "Cool" AI Logo */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-500 z-50 relative group ${
          isOpen ? 'bg-red-500 rotate-90 rounded-full' : 'bg-white border-2 border-emerald-100 hover:border-emerald-400 overflow-hidden'
        }`}
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-800 opacity-90"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <svg className="w-9 h-9 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846 .813-2.846 .813a4.5 4.5 0 00-3.09 3.09z" />
                  <circle cx="12" cy="12" r="9" stroke="white" strokeOpacity="0.2" />
                  <path d="M12 3v2m0 14v2m9-9h-2M3 12h2" stroke="white" strokeOpacity="0.5" strokeLinecap="round" />
               </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] sm:w-[450px] h-[600px] bg-white rounded-[2.5rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)] border border-gray-100 flex flex-col overflow-hidden animate-fade-in origin-bottom-right transition-all">
          
          <div className="bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 p-6 text-white shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-float">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-tight uppercase leading-none">Smart Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Quantum Engine Online</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10 min-h-[50px] flex items-center transition-all duration-1000">
                <p className="text-xs font-medium text-emerald-50 italic animate-fade-in">
                  &quot;{COOL_QUOTES[quoteIndex]}&quot;
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/80 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-4 shadow-sm text-sm leading-relaxed transition-all duration-300 ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-br-none font-medium shadow-emerald-200' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none font-medium'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.isTask && (
                    <div className="mt-3 pt-3 border-t border-emerald-50 flex items-center justify-between">
                      <div className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        AI Insight Engine
                      </div>
                      <span className="text-[8px] text-gray-300 font-bold">Smart Analysis</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-.3s]"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-.5s]"></span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-5 bg-white border-t border-gray-100">
            <form onSubmit={handleSend} className="relative flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tulis pesan atau minta analisis..."
                disabled={isTyping}
                className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-[1.2rem] text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all font-medium placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-gray-300 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-200 transition-all"
              >
                <svg className="w-6 h-6 -mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}