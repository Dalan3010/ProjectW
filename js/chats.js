// BID — CRUD de conversaciones por usuario.
// Estructura en storage: bid.chats → { [email]: chat[] } con el más reciente primero.

import { storage } from './storage.js';

export const CHATS_KEY = 'chats';
const DEFAULT_TITLE = 'Nueva conversación';
const TITLE_MAX = 48;

// UUID nativo si está disponible; si no, un id único razonable para esta app.
export function generateId() {
  if (window.crypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export class ChatService {
  constructor(storage) {
    this.storage = storage;
  }

  allChats() {
    const chats = this.storage.get(CHATS_KEY, {});
    // Defensa contra datos corruptos: si no es un objeto, arrancamos de cero.
    return chats && typeof chats === 'object' ? chats : {};
  }

  // Copia ordenada: nunca exponemos el array guardado para que nadie lo mute.
  list(userEmail) {
    const userChats = this.allChats()[userEmail] || [];
    return userChats.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  get(userEmail, chatId) {
    const chat = this.list(userEmail).find((c) => c.id === chatId);
    return chat ? { ...chat, messages: chat.messages.slice() } : null;
  }

  create(userEmail, { title } = {}) {
    const now = new Date().toISOString();
    const chat = {
      id: generateId(),
      title: title || DEFAULT_TITLE,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    const all = this.allChats();
    all[userEmail] = [chat, ...(all[userEmail] || [])];
    this.storage.set(CHATS_KEY, all);
    return chat;
  }

  remove(userEmail, chatId) {
    const all = this.allChats();
    const userChats = all[userEmail] || [];
    const rest = userChats.filter((c) => c.id !== chatId);
    if (rest.length === userChats.length) return false;
    all[userEmail] = rest;
    this.storage.set(CHATS_KEY, all);
    return true;
  }

  addMessage(userEmail, chatId, { role, content }) {
    const all = this.allChats();
    const userChats = (all[userEmail] || []).slice();
    const index = userChats.findIndex((c) => c.id === chatId);
    if (index === -1) return null;

    // Copia antes de guardar: el objeto del store nunca se muta en su posición.
    const chat = { ...userChats[index] };
    const message = { role, content, createdAt: new Date().toISOString() };
    chat.messages = (chat.messages || []).concat(message);
    chat.updatedAt = message.createdAt;

    // La conversación se bautiza con el primer mensaje del usuario.
    if (chat.title === DEFAULT_TITLE) {
      const firstUser = chat.messages.find((m) => m.role === 'user');
      if (firstUser) {
        const snippet = firstUser.content.trim();
        chat.title = snippet.length > TITLE_MAX ? `${snippet.slice(0, TITLE_MAX)}…` : snippet;
      }
    }

    userChats[index] = chat;
    all[userEmail] = userChats;
    this.storage.set(CHATS_KEY, all);
    return chat;
  }
}

export const chats = new ChatService(storage);