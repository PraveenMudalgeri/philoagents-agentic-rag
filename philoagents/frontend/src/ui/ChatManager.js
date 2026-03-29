/**
 * ChatManager: handles the WebSocket connection and DOM chat UI.
 */

const WS_BASE = `ws://${window.location.hostname}:8000/api/v1/ws/chat`;

export class ChatManager {
  constructor() {
    this._overlay = document.getElementById("chat-overlay");
    this._nameEl = document.getElementById("philosopher-name");
    this._messagesEl = document.getElementById("chat-messages");
    this._inputEl = document.getElementById("chat-input");
    this._sendBtn = document.getElementById("chat-send");
    this._closeBtn = document.getElementById("chat-close");

    this._ws = null;
    this._philosopherId = null;
    this._sessionId = null;
    this._open = false;
    this._pendingAssistantEl = null;

    this._sendBtn.addEventListener("click", () => this._sendMessage());
    this._inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this._sendMessage();
    });
    this._closeBtn.addEventListener("click", () => this.close());
  }

  isOpen() {
    return this._open;
  }

  open(philosopherId, philosopherName) {
    this._philosopherId = philosopherId;
    this._sessionId = `${philosopherId}-${Date.now()}`;
    this._nameEl.textContent = `💬 ${philosopherName}`;
    this._messagesEl.innerHTML = "";
    this._overlay.style.display = "block";
    this._open = true;
    this._connectWebSocket();
    this._inputEl.focus();
  }

  close() {
    this._overlay.style.display = "none";
    this._open = false;
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
  }

  _connectWebSocket() {
    const url = `${WS_BASE}/${this._philosopherId}/${this._sessionId}`;
    this._ws = new WebSocket(url);

    this._ws.onopen = () => {
      console.log(`[ChatManager] WebSocket connected: ${url}`);
    };

    this._ws.onmessage = (event) => {
      const token = event.data;
      if (token === "[DONE]") {
        this._pendingAssistantEl = null;
        return;
      }
      if (!this._pendingAssistantEl) {
        this._pendingAssistantEl = this._appendMessage("philosopher", "");
      }
      this._pendingAssistantEl.textContent += token;
      this._messagesEl.scrollTop = this._messagesEl.scrollHeight;
    };

    this._ws.onerror = (err) => {
      console.error("[ChatManager] WebSocket error", err);
    };

    this._ws.onclose = () => {
      console.log("[ChatManager] WebSocket closed");
    };
  }

  _sendMessage() {
    const text = this._inputEl.value.trim();
    if (!text || !this._ws || this._ws.readyState !== WebSocket.OPEN) return;

    this._appendMessage("user", text);
    this._ws.send(text);
    this._inputEl.value = "";
    this._messagesEl.scrollTop = this._messagesEl.scrollHeight;
  }

  /**
   * Append a message line to the chat box.
   * @param {"user"|"philosopher"} role
   * @param {string} content
   * @returns {HTMLElement} The created span element (allows streaming append).
   */
  _appendMessage(role, content) {
    const div = document.createElement("div");
    div.className = role;
    const prefix = role === "user" ? "You: " : "";
    const span = document.createElement("span");
    span.textContent = prefix + content;
    div.appendChild(span);
    this._messagesEl.appendChild(div);
    return span;
  }
}
