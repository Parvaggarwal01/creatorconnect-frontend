import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  loading: false,
  typingUsers: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      state.messages = [];
      state.typingUsers = [];
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    appendMessage: (state, action) => {
      const exists = state.messages.some((m) => m._id === action.payload._id);
      if (!exists) state.messages.push(action.payload);

      // Update lastMessage on the conversation
      const conv = state.conversations.find(
        (c) => c._id === state.activeConversation?._id,
      );
      if (conv) conv.lastMessage = action.payload;
    },
    updateTyping: (state, action) => {
      const { userId, isTyping } = action.payload;
      if (isTyping) {
        if (!state.typingUsers.includes(userId)) state.typingUsers.push(userId);
      } else {
        state.typingUsers = state.typingUsers.filter((id) => id !== userId);
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    prependConversation: (state, action) => {
      const exists = state.conversations.find(
        (c) => c._id === action.payload._id,
      );
      if (!exists) state.conversations.unshift(action.payload);
    },
  },
});

export const {
  setConversations,
  setActiveConversation,
  setMessages,
  appendMessage,
  updateTyping,
  setLoading,
  prependConversation,
} = chatSlice.actions;

export default chatSlice.reducer;
