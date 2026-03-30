import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.js";
import { MainMenuScene } from "./scenes/MainMenuScene.js";
import { PreloadScene } from "./scenes/PreloadScene.js";
import { toggleBgmMute, isBgmMuted } from "./audio/lightBgm.js";

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: "#06080d",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [PreloadScene, MainMenuScene, GameScene],
};

export default new Phaser.Game(config);

// Setup BGM toggle button
const bgmToggleBtn = document.getElementById("bgm-toggle");
if (bgmToggleBtn) {
  const updateButtonUI = () => {
    bgmToggleBtn.textContent = isBgmMuted() ? "🔇" : "🔊";
  };

  bgmToggleBtn.addEventListener("click", () => {
    toggleBgmMute();
    updateButtonUI();
  });

  // Keyboard shortcut: M key
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "m" && !e.ctrlKey && !e.metaKey) {
      toggleBgmMute();
      updateButtonUI();
    }
  });

  updateButtonUI();
}
