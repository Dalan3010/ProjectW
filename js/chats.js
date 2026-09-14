// BID — Persistencia local de chats por usuario

const BIDChat = (() => {
  const CHATS_KEY = "chats";

  function generateId() {
    if (window.crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function getAll() {
    return BIDStorage.get(CHATS_KEY, {});
  }

  function saveAll(chats) {
    return BIDStorage.set(CHATS_KEY, chats);
  }

  function chatsFor(userEmail) {
    return getAll()[userEmail] || [];
  }

  function saveChats(userEmail, chats) {
    const all = getAll();
    all[userEmail] = chats;
    saveAll(all);
  }

  function topTitleFor(messages) {
    const first = messages.find((message) => message.role === "user");
    const snippet = (first && first.content.trim()) || "Nueva conversación";
    return snippet.length > 48 ? `${snippet.slice(0, 48)}…` : snippet;
  }

  function create(userEmail, { title } = {}) {
    const chat = {
      id: generateId(),
      title: title || "Nueva conversación",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveChats(userEmail, [chat, ...chatsFor(userEmail)]);
    return chat;
  }

  function list(userEmail) {
    return chatsFor(userEmail).slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  function get(userEmail, chatId) {
    return chatsFor(userEmail).find((chat) => chat.id === chatId) || null;
  }

  function remove(userEmail, chatId) {
    const chats = chatsFor(userEmail).filter((chat) => chat.id !== chatId);
    saveChats(userEmail, chats);
  }

  function addMessage(userEmail, chatId, { role, content }) {
    const chats = chatsFor(userEmail);
    const chat = chats.find((item) => item.id === chatId);
    if (!chat) return null;
    chat.messages.push({
      role,
      content,
      createdAt: new Date().toISOString(),
    });
    chat.updatedAt = new Date().toISOString();
    if (chat.title === "Nueva conversación") {
      chat.title = topTitleFor(chat.messages);
    }
    saveChats(userEmail, [...chats]);
    return chat;
  }

  return { create, list, get, remove, addMessage };
})();