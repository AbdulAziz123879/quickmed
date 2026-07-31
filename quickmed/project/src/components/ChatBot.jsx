/* ChatBot.jsx
   Floating AI assistant widget. Self-contained: renders its own bubble
   button + chat panel, and talks to the backend's /api/chat route
   (which proxies to Anthropic, same pattern as PrescriptionUploadButton).
   Drop <ChatBot theme={theme} dark={dark} /> anywhere — it positions
   itself fixed to the bottom-right corner and doesn't affect layout.
*/
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Bot } from "lucide-react";
import { C } from "../theme";
import { API_BASE_URL } from "../config";

const WELCOME = {
  role: "assistant",
  content:
    "Hi! I'm the Quick Med assistant. Ask me about delivery times, finding a medicine, prescriptions, or how the app works.",
};

export function ChatBot({ theme, dark }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages
            .filter((m) => m !== WELCOME)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || `Backend error (${response.status})`);
      setMessages((cur) => [...cur, { role: "assistant", content: data.reply || "Sorry, I didn't catch that." }]);
    } catch (e) {
      const isNetworkError = e instanceof TypeError;
      setError(
        isNetworkError
          ? `Couldn't reach the backend at ${API_BASE_URL}. Make sure it's running (see /backend/README.md).`
          : e.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating launcher button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="qm-btn"
        aria-label={open ? "Close chat" : "Open chat"}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 400,
          width: 56, height: 56, borderRadius: "50%", border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
          boxShadow: "0 14px 32px -10px rgba(37,99,235,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {open ? <X color="#fff" size={24} /> : <MessageCircle color="#fff" size={24} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: "fixed", bottom: 92, right: 24, zIndex: 400,
            width: 340, maxWidth: "calc(100vw - 32px)", height: 460, maxHeight: "calc(100vh - 140px)",
            background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20,
            boxShadow: "0 24px 60px -20px rgba(17,24,39,0.35)",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${theme.border}`, background: dark ? "#111A2B" : "#F8FAFC" }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Bot size={17} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.text }}>Quick Med Assistant</div>
              <div style={{ fontSize: 11, color: theme.sub }}>Usually replies instantly</div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "82%", fontSize: 13, lineHeight: 1.5, padding: "9px 12px", borderRadius: 14,
                    background: m.role === "user" ? C.primary : (dark ? "#1A2437" : "#F1F5FE"),
                    color: m.role === "user" ? "#fff" : theme.text,
                    borderBottomRightRadius: m.role === "user" ? 4 : 14,
                    borderBottomLeftRadius: m.role === "user" ? 14 : 4,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: theme.sub, padding: "9px 12px" }}>
                  <Sparkles size={13} color={C.primary} /> Thinking…
                </div>
              </div>
            )}
            {error && (
              <div style={{ fontSize: 12, color: C.danger, background: "#FEF2F2", borderRadius: 10, padding: "8px 10px" }}>{error}</div>
            )}
          </div>

          {/* Input */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, borderTop: `1px solid ${theme.border}` }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask something..."
              style={{ flex: 1, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 13, outline: "none", background: "transparent", color: theme.text }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="qm-btn"
              aria-label="Send message"
              style={{
                width: 38, height: 38, borderRadius: 10, border: "none", flexShrink: 0,
                background: C.primary, opacity: loading || !input.trim() ? 0.5 : 1,
                cursor: loading || !input.trim() ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Send size={15} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
