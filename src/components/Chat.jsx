import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import {
  setConversations,
  setActiveConversation,
  setMessages,
  appendMessage,
  updateTyping,
  setLoading,
  prependConversation,
} from "../store/slice/chatSlice";
import Layout from "./Layout";

/* ─── Avatar helper ─────────────────────────────────────────── */
function Avatar({ name, size = "md" }) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div
      className={`${sz} rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center font-semibold text-gray-700 dark:text-gray-200 shrink-0`}
    >
      {initials}
    </div>
  );
}

/* ─── New Conversation Modal ────────────────────────────────── */
function NewChatModal({ onClose, onStart, token }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `http://localhost:3000/auth/users?search=${encodeURIComponent(query)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) setUsers(await res.json());
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query, token]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            New Conversation
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <input
          autoFocus
          type="text"
          placeholder="Search by name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 outline-none text-sm mb-3"
        />
        {searching && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
            Searching…
          </p>
        )}
        <ul className="space-y-1 max-h-56 overflow-y-auto">
          {users.map((u) => (
            <li key={u._id}>
              <button
                onClick={() => onStart(u)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                <Avatar name={u.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {u.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {u.email}
                  </p>
                </div>
              </button>
            </li>
          ))}
          {!searching && query && users.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
              No users found
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}

/* ─── Main Chat Component ──────────────────────────────────── */
function Chat() {
  const dispatch = useDispatch();
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const { conversations, activeConversation, messages, loading, typingUsers } =
    useSelector((s) => s.chat);

  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  /* ── Load conversations on mount ── */
  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Socket listeners ── */
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => dispatch(appendMessage(msg));
    const onTypingStart = ({ userId }) =>
      dispatch(updateTyping({ userId, isTyping: true }));
    const onTypingStop = ({ userId }) =>
      dispatch(updateTyping({ userId, isTyping: false }));

    socket.on("message:receive", onMessage);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);

    return () => {
      socket.off("message:receive", onMessage);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
    };
  }, [socket, dispatch]);

  /* ── Join/leave room when active conversation changes ── */
  useEffect(() => {
    if (!socket || !activeConversation) return;
    socket.emit("conversation:join", activeConversation._id);
    fetchMessages(activeConversation._id);
    return () => socket.emit("conversation:leave", activeConversation._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?._id, socket]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    dispatch(setLoading(true));
    try {
      const res = await fetch("http://localhost:3000/chat", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) dispatch(setConversations(await res.json()));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchMessages = async (conversationId) => {
    dispatch(setLoading(true));
    try {
      const res = await fetch(`http://localhost:3000/chat/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) dispatch(setMessages(await res.json()));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const startConversation = async (targetUser) => {
    setShowModal(false);
    try {
      const res = await fetch("http://localhost:3000/chat/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ participantId: targetUser._id }),
      });
      if (res.ok) {
        const conv = await res.json();
        dispatch(prependConversation(conv));
        dispatch(setActiveConversation(conv));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = useCallback(() => {
    if (!input.trim() || !activeConversation || !socket) return;
    setSending(true);
    socket.emit("message:send", {
      conversationId: activeConversation._id,
      content: input.trim(),
    });
    setInput("");
    setSending(false);
    socket.emit("typing:stop", { conversationId: activeConversation._id });
  }, [input, activeConversation, socket]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socket || !activeConversation) return;
    socket.emit("typing:start", { conversationId: activeConversation._id });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("typing:stop", { conversationId: activeConversation._id });
    }, 1500);
  };

  /* ── Helper: get the other participant ── */
  const getOther = (conv) =>
    conv?.participants?.find((p) => p._id !== user?.id && p._id !== user?._id);

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* ── Sidebar ─────────────────────────────────── */}
        <div className="w-full sm:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Messages
            </h2>
            <button
              onClick={() => setShowModal(true)}
              title="New conversation"
              className="p-1.5 rounded-md bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {loading && conversations.length === 0 && (
              <div className="space-y-3 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 animate-pulse"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <svg
                  className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  No conversations yet
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-xs text-gray-900 dark:text-white underline font-medium"
                >
                  Start one
                </button>
              </div>
            )}
            {conversations.map((conv) => {
              const other = getOther(conv);
              const isActive = activeConversation?._id === conv._id;
              return (
                <button
                  key={conv._id}
                  onClick={() => dispatch(setActiveConversation(conv))}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-100 dark:border-gray-700/50 ${
                    isActive
                      ? "bg-gray-100 dark:bg-gray-700"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <Avatar name={other?.name || "?"} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {other?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {conv.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                  {conv.updatedAt && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                      {formatTime(conv.updatedAt)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Chat Panel ──────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <svg
                className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-gray-400 dark:text-gray-500 font-medium">
                Select a conversation
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">
                or start a new one
              </p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 shrink-0">
                <Avatar name={getOther(activeConversation)?.name} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {getOther(activeConversation)?.name}
                  </p>
                  {typingUsers.length > 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                      typing…
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {loading && (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isMe =
                    msg.sender?._id === user?.id ||
                    msg.sender?._id === user?._id ||
                    msg.sender === user?.id;
                  const showDate =
                    i === 0 ||
                    formatDate(msg.createdAt) !==
                      formatDate(messages[i - 1].createdAt);

                  return (
                    <div key={msg._id}>
                      {showDate && (
                        <div className="text-center my-2">
                          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            isMe
                              ? "bg-gray-900 dark:bg-gray-700 text-white rounded-br-sm"
                              : "bg-gray-100 dark:bg-gray-700/80 text-gray-900 dark:text-white rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm wrap-break-words">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isMe
                                ? "text-gray-300 dark:text-gray-400 text-right"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
                <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 px-3 py-2">
                  <textarea
                    value={input}
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message…"
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none max-h-32"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className="p-2 bg-gray-900 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-colors shrink-0"
                  >
                    <svg
                      className="w-4 h-4 rotate-90"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1 pl-1">
                  Enter to send · Shift+Enter for new line
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <NewChatModal
          token={token}
          onClose={() => setShowModal(false)}
          onStart={startConversation}
        />
      )}
    </Layout>
  );
}

export default Chat;
