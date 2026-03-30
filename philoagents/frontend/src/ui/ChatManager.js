/**
 * ChatManager: handles the WebSocket connection and DOM chat UI.
 */

const WS_BASE = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/v1/ws/chat`;

export class ChatManager {
  constructor() {
    this._overlay = document.getElementById("chat-overlay");
    this._nameEl = document.getElementById("npc-name");
    this._messagesEl = document.getElementById("chat-messages");
    this._inputEl = document.getElementById("chat-input");
    this._sendBtn = document.getElementById("chat-send");
    this._closeBtn = document.getElementById("chat-close");

    this._ws = null;
    this._npcId = null;
    this._sessionId = null;
    this._open = false;
    this._pendingAssistantEl = null;

    this._sendBtn.addEventListener("click", () => this._sendMessage());
    this._inputEl.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        e.preventDefault();
        this._sendMessage();
      }
    }, true);
    this._inputEl.addEventListener("keypress", (e) => {
      e.stopPropagation();
    }, true);
    this._inputEl.addEventListener("keyup", (e) => {
      e.stopPropagation();
    }, true);
    this._closeBtn.addEventListener("click", () => this.close());
  }

  isOpen() {
    return this._open;
  }

  open(npcId, npcName) {
    this._npcId = npcId;
    this._sessionId = `${npcId}-${Date.now()}`;
    this._nameEl.textContent = `💬 ${npcName}`;
    this._messagesEl.innerHTML = "";
    this._overlay.style.display = "block";
    this._open = true;

    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
      gameContainer.style.pointerEvents = "none";
    }

    window.dispatchEvent(new CustomEvent("chat-opened"));
    this._connectWebSocket();
    this._inputEl.focus();
  }

  close() {
    this._overlay.style.display = "none";
    this._open = false;

    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
      gameContainer.style.pointerEvents = "auto";
    }

    window.dispatchEvent(new CustomEvent("chat-closed"));
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
  }

  _connectWebSocket() {
    const url = `${WS_BASE}/${this._npcId}/${this._sessionId}`;
    console.log(`[ChatManager] Attempting to connect to: ${url}`);
    this._ws = new WebSocket(url);

    this._ws.onopen = () => {
      console.log(`[ChatManager] WebSocket connected: ${url}`);
      console.log(`[ChatManager] WebSocket state: ${this._ws.readyState}`);

      // Ensure input focus in chat bypasses game keyboard capture.
      this._inputEl.addEventListener(
        "keydown",
        (e) => {
          e.stopPropagation();
        },
        true,
      );
      this._inputEl.addEventListener(
        "keypress",
        (e) => {
          e.stopPropagation();
        },
        true,
      );
      this._inputEl.addEventListener(
        "keyup",
        (e) => {
          e.stopPropagation();
        },
        true,
      );
    };

    this._ws.onmessage = (event) => {
      const token = event.data;
      console.log(`[ChatManager] Received token: ${token}`);
      
      // Check for error messages
      if (token.startsWith("ERROR:")) {
        console.error(`[ChatManager] Backend error: ${token}`);
        this._appendMessage("npc", `⚠️ ${token}`);
        this._pendingAssistantEl = null;
        return;
      }
      
      if (token === "[DONE]") {
        this._pendingAssistantEl = null;
        return;
      }
      if (!this._pendingAssistantEl) {
        this._pendingAssistantEl = this._appendMessage("npc", "");
      }
      this._pendingAssistantEl.textContent += token;
      this._messagesEl.scrollTop = this._messagesEl.scrollHeight;
    };

    this._ws.onerror = (err) => {
      console.error("[ChatManager] WebSocket error", err);
      console.error("[ChatManager] WebSocket state:", this._ws.readyState);
      this._appendMessage("npc", "❌ Connection error. Check browser console.");
    };

    this._ws.onclose = () => {
      console.log("[ChatManager] WebSocket closed");
      console.log("[ChatManager] WebSocket state:", this._ws.readyState);
    };
  }

  _sendMessage() {
    const text = this._inputEl.value.trim();
    console.log(`[ChatManager] Send triggered. Text: "${text}", WebSocket: ${this._ws}, ReadyState: ${this._ws?.readyState}`);

    if (!text) {
      console.warn("[ChatManager] Message is empty");
      return;
    }
    
    if (!this._ws) {
      console.error("[ChatManager] WebSocket not initialized");
      return;
    }
    
    if (this._ws.readyState !== WebSocket.OPEN) {
      console.error(`[ChatManager] WebSocket not open. Current state: ${this._ws.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)`);
      return;
    }

    this._appendMessage("user", text);
    this._ws.send(text);
    this._inputEl.value = "";
    this._messagesEl.scrollTop = this._messagesEl.scrollHeight;
  }

  /**
   * Append a message line to the chat box.
   * @param {"user"|"npc"} role
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
